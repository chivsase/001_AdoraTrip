from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.generics import GenericAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.authentication import CustomJWTAuthentication
from users.models import EmailVerificationToken, PasswordResetToken
from users.permissions import IsAuthenticatedAndVerified, IsSuperAdmin, IsPlatformStaff
from users.serializers import (
    AdminUserListSerializer,
    AdminUserUpdateSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    EmailVerifySerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    get_tokens_for_user,
)
from users.throttles import (
    AuthLoginThrottle,
    AuthRegisterThrottle,
    PasswordResetThrottle,
    ResendVerifyThrottle,
)

User = get_user_model()

# ─── Helper ────────────────────────────────────────────────────────────────────

def _set_refresh_cookie(response, refresh_token: str):
    """Attach the refresh token as an HttpOnly cookie."""
    response.set_cookie(
        key=settings.JWT_REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=settings.JWT_REFRESH_COOKIE_HTTPONLY,
        samesite=settings.JWT_REFRESH_COOKIE_SAMESITE,
        secure=settings.JWT_REFRESH_COOKIE_SECURE,
        path='/',
    )


def _clear_refresh_cookie(response):
    response.delete_cookie(settings.JWT_REFRESH_COOKIE_NAME, path='/')


def _fire(task_func, *args, **kwargs):
    """Call a Celery task's .delay() and swallow broker errors gracefully."""
    try:
        task_func.delay(*args, **kwargs)
    except Exception:
        # Broker unavailable (dev without Redis) — try synchronous fallback
        try:
            task_func(*args, **kwargs)
        except Exception:
            pass  # Never crash the request because of a background task


def _log(request, action, user=None, **meta):
    """Fire-and-forget audit log via Celery (or inline fallback)."""
    from users.tasks import create_audit_log
    _fire(
        create_audit_log,
        user_id=str(user.id) if user else None,
        action=action,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        metadata=meta,
    )


# ─── Registration ──────────────────────────────────────────────────────────────

class RegisterView(GenericAPIView):
    """
    POST /api/v1/auth/register/
    Create a new traveler account. Returns JWT tokens immediately so the user
    can browse the site, but booking is blocked until email is verified.
    """
    permission_classes = [AllowAny]
    throttle_classes   = [AuthRegisterThrottle]
    serializer_class   = RegisterSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # In development (ACCOUNT_EMAIL_VERIFICATION='none') auto-verify immediately
        from django.conf import settings as django_settings
        if getattr(django_settings, 'ACCOUNT_EMAIL_VERIFICATION', 'mandatory') == 'none':
            user.is_email_verified = True
            user.save(update_fields=['is_email_verified'])
        else:
            # Queue verification email (non-blocking)
            from users.tasks import send_verification_email
            send_verification_email.delay(str(user.id))

        tokens = get_tokens_for_user(user)
        _log(request, 'REGISTER', user=user)

        response = Response(
            {'user': UserProfileSerializer(user).data, **tokens},
            status=status.HTTP_201_CREATED,
        )
        _set_refresh_cookie(response, tokens['refresh'])
        return response


# ─── Login / Logout ────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    Email + password → access token (body) + refresh token (HttpOnly cookie).
    """
    serializer_class  = CustomTokenObtainPairSerializer
    throttle_classes  = [AuthLoginThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            _set_refresh_cookie(response, response.data['refresh'])
            # Update last login IP — use filter to avoid DoesNotExist if email
            # is missing or was normalised differently by the serializer.
            try:
                user = User.objects.get(email=request.data.get('email', '').lower())
                user.last_login_ip = request.META.get('REMOTE_ADDR')
                user.save(update_fields=['last_login_ip'])
                _log(request, 'LOGIN', user=user)
            except User.DoesNotExist:
                pass
        return response


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Blacklist the refresh token from cookie or request body.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = (
            request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
            or request.data.get('refresh')
        )
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass  # already blacklisted or invalid — still clear the cookie

        _log(request, 'LOGOUT', user=request.user)
        response = Response({'detail': 'Successfully logged out.'})
        _clear_refresh_cookie(response)
        return response


# ─── Token Refresh ─────────────────────────────────────────────────────────────

class CookieTokenRefreshView(TokenRefreshView):
    """
    POST /api/v1/auth/token/refresh/
    Reads refresh token from HttpOnly cookie, returns new access + refresh tokens.
    """
    throttle_classes = []

    def post(self, request, *args, **kwargs):
        # Inject the cookie value into request.data if not in body
        mutable = request.data.copy()
        if 'refresh' not in mutable:
            cookie_refresh = request.COOKIES.get(settings.JWT_REFRESH_COOKIE_NAME)
            if cookie_refresh:
                mutable['refresh'] = cookie_refresh
        request._full_data = mutable

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and 'refresh' in response.data:
            _set_refresh_cookie(response, response.data['refresh'])
        return response


# ─── Current User (Me) ─────────────────────────────────────────────────────────

class MeView(GenericAPIView):
    """
    GET  /api/v1/auth/me/  → profile + org memberships
    PATCH /api/v1/auth/me/ → update full_name, phone, avatar
    DELETE /api/v1/auth/me/ → soft-delete (GDPR)
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)

    def delete(self, request):
        user = request.user
        user.is_active = False
        user.save(update_fields=['is_active'])
        _log(request, 'ACCOUNT_DEACTIVATED', user=user)
        response = Response({'detail': 'Account deactivated.'}, status=status.HTTP_200_OK)
        _clear_refresh_cookie(response)
        return response


# ─── Email Verification ────────────────────────────────────────────────────────

class EmailVerifyView(GenericAPIView):
    """
    POST /api/v1/auth/email/verify/
    Consumes the one-time token from the verification email.
    """
    permission_classes = [AllowAny]
    serializer_class   = EmailVerifySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_str = serializer.validated_data['token']

        try:
            record = EmailVerificationToken.objects.select_related('user').get(token=token_str)
        except EmailVerificationToken.DoesNotExist:
            return Response({'detail': 'Invalid verification token.'}, status=status.HTTP_400_BAD_REQUEST)

        if not record.is_valid():
            record.delete()
            return Response({'detail': 'Verification token has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        user = record.user
        user.is_email_verified = True
        user.save(update_fields=['is_email_verified'])
        record.delete()

        _log(request, 'EMAIL_VERIFIED', user=user)
        tokens = get_tokens_for_user(user)
        response = Response({'detail': 'Email verified successfully.', **tokens})
        _set_refresh_cookie(response, tokens['refresh'])
        return response


class ResendVerificationView(GenericAPIView):
    """
    POST /api/v1/auth/email/resend-verification/
    Rate-limited to 1 per 5 minutes.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes   = [ResendVerifyThrottle]

    def post(self, request):
        if request.user.is_email_verified:
            return Response({'detail': 'Email is already verified.'})
        from users.tasks import send_verification_email
        send_verification_email.delay(str(request.user.id))
        return Response({'detail': 'Verification email sent.'})


# ─── Password Management ───────────────────────────────────────────────────────

class PasswordResetRequestView(GenericAPIView):
    """
    POST /api/v1/auth/password/reset/request/
    Always returns 200 to prevent user enumeration.
    """
    permission_classes = [AllowAny]
    throttle_classes   = [PasswordResetThrottle]
    serializer_class   = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()

        try:
            user = User.objects.get(email=email)
            from users.tasks import send_password_reset_email
            send_password_reset_email.delay(str(user.id))
        except User.DoesNotExist:
            pass  # Silent — don't reveal whether email exists

        return Response({'detail': 'If that email is registered, a reset link has been sent.'})


class PasswordResetConfirmView(GenericAPIView):
    """
    POST /api/v1/auth/password/reset/confirm/
    Validates token, sets new password, invalidates all existing JWTs.
    """
    permission_classes = [AllowAny]
    serializer_class   = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            record = PasswordResetToken.objects.select_related('user').get(
                token=serializer.validated_data['token']
            )
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Invalid or expired reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        if not record.is_valid():
            return Response({'detail': 'Reset token has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user = record.user
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])

        record.is_used = True
        record.save(update_fields=['is_used'])

        # Invalidate all existing tokens for this user on all devices
        CustomJWTAuthentication.invalidate_user_tokens(str(user.id))

        _log(request, 'PASSWORD_RESET', user=user)
        return Response({'detail': 'Password reset successful. Please log in with your new password.'})


class ChangePasswordView(GenericAPIView):
    """
    POST /api/v1/auth/password/change/
    For logged-in users who know their current password.
    """
    permission_classes = [IsAuthenticatedAndVerified]
    serializer_class   = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return Response({'current_password': ['Incorrect password.']}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])

        CustomJWTAuthentication.invalidate_user_tokens(str(user.id))
        _log(request, 'PASSWORD_CHANGED', user=user)
        return Response({'detail': 'Password changed successfully. Please log in again.'})


# ─── CSRF Cookie ──────────────────────────────────────────────────────────────

class CSRFCookieView(APIView):
    """
    GET /api/v1/auth/csrf/
    Returns a CSRF cookie. Next.js SPA calls this on app load to get the token
    it needs for X-CSRFToken headers on non-GET requests.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from django.middleware.csrf import get_token
        get_token(request)
        return Response({'detail': 'CSRF cookie set.'})


# ─── User Settings (Theme Customizer) ──────────────────────────────────────────

class UserSettingsView(APIView):
    """
    GET  /api/v1/auth/settings/ → current customizer settings
    PUT  /api/v1/auth/settings/ → save customizer settings
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from users.models import UserSettings

        obj, _ = UserSettings.objects.get_or_create(user=request.user)

        return Response(obj.data)

    def put(self, request):
        from users.models import UserSettings
        from users.serializers import UserSettingsSerializer

        serializer = UserSettingsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj, _ = UserSettings.objects.get_or_create(user=request.user)
        obj.data = serializer.validated_data['data']
        obj.save(update_fields=['data', 'updated_at'])

        return Response(obj.data)


# ─── Admin — User Management ───────────────────────────────────────────────────

class AdminUserListView(GenericAPIView):
    """GET /api/v1/admin/users/"""
    permission_classes = [IsPlatformStaff]
    serializer_class   = AdminUserListSerializer

    def get(self, request):
        from django.db.models import Q
        qs = User.objects.all().order_by('-date_joined')
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(full_name__icontains=search))
        role = request.query_params.get('role')
        if role:
            qs = qs.filter(platform_role=role)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class AdminUserDetailView(GenericAPIView):
    """PATCH /api/v1/admin/users/{id}/"""
    permission_classes = [IsSuperAdmin]
    serializer_class   = AdminUserUpdateSerializer

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # If suspended, invalidate all tokens immediately
        if not user.is_active:
            CustomJWTAuthentication.invalidate_user_tokens(str(user.id))

        _log(request, 'ADMIN_USER_UPDATE', user=request.user, target_user=str(pk))
        return Response(AdminUserListSerializer(user).data)


# ─── OAuth Callback (JWT bridge) ───────────────────────────────────────────────

class OAuthCallbackView(APIView):
    """
    GET /api/v1/auth/oauth/callback/
    After allauth finishes the social login (Google/Facebook), this view is
    reached via LOGIN_REDIRECT_URL.  It issues JWT tokens, sets the refresh
    cookie, and redirects the user to the Next.js frontend with the access
    token so the SPA can store it in localStorage.
    """
    permission_classes = [AllowAny]
    authentication_classes = [
        CustomJWTAuthentication,
        SessionAuthentication,
    ]

    def get(self, request):
        from django.shortcuts import redirect as django_redirect
        from urllib.parse import urlencode

        user = request.user
        frontend_url = settings.FRONTEND_URL

        if not user or not user.is_authenticated:
            return django_redirect(f'{frontend_url}/login?error=oauth_failed')

        tokens = get_tokens_for_user(user)
        _log(request, 'OAUTH_LOGIN', user=user)

        # Build redirect URL with access token
        params = urlencode({'access_token': tokens['access']})
        redirect_url = f'{frontend_url}/oauth/callback?{params}'

        response = django_redirect(redirect_url)
        _set_refresh_cookie(response, tokens['refresh'])
        return response
