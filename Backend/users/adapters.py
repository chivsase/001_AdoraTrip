from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Customises allauth's email/password flow.
    - Sets platform_role=TRAVELER by default on all new accounts.
    - Defers email sending to a Celery task (non-blocking).
    """

    def save_user(self, request, user, form, commit=True):
        from users.models import PlatformRole
        user = super().save_user(request, user, form, commit=False)
        user.platform_role = PlatformRole.TRAVELER
        if commit:
            user.save()
        return user

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        # Delegate to Celery so registration response is instant
        from users.tasks import send_verification_email
        send_verification_email.delay(str(emailconfirmation.email_address.user_id))

    def get_email_confirmation_url(self, request, emailconfirmation):
        # Point the verification link at the Next.js frontend, not Django
        token = emailconfirmation.key
        return f'{settings.FRONTEND_URL}/verify-email?token={token}'


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Customises allauth's social (Google/Facebook) flow.
    - Auto-links social account if email matches an existing user.
    - Marks email as verified for all social signups (we trust Google/FB).
    - Sets platform_role=TRAVELER for new social users.
    """

    def pre_social_login(self, request, sociallogin):
        """
        If the social email matches an existing CustomUser, connect the
        social account to that user instead of creating a duplicate.
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()

        if sociallogin.is_existing:
            return

        email = sociallogin.account.extra_data.get('email', '').lower()
        if not email:
            return

        try:
            existing_user = User.objects.get(email=email)
            sociallogin.connect(request, existing_user)
        except User.DoesNotExist:
            pass

    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)

        # Set full_name from social provider
        if not user.full_name:
            user.full_name = data.get('name', '') or (
                f"{data.get('first_name', '')} {data.get('last_name', '')}".strip()
            )

        # Trust social provider email as verified
        user.is_email_verified = True

        # All social signups start as TRAVELER
        from users.models import PlatformRole
        if not user.platform_role:
            user.platform_role = PlatformRole.TRAVELER

        return user

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)

        # Mark which provider was linked
        provider = sociallogin.account.provider
        if provider == 'google':
            user.google_linked = True
        elif provider == 'facebook':
            user.facebook_linked = True
        user.save(update_fields=['google_linked', 'facebook_linked', 'is_email_verified', 'full_name'])
        return user
