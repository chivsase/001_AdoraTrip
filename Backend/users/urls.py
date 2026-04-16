from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView

from users.views import (
    AdminUserDetailView,
    AdminUserListView,
    ChangePasswordView,
    CookieTokenRefreshView,
    CSRFCookieView,
    EmailVerifyView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ResendVerificationView,
)

app_name = 'auth'

urlpatterns = [
    # Registration & Login
    path('register/',             RegisterView.as_view(),           name='register'),
    path('login/',                LoginView.as_view(),              name='login'),
    path('logout/',               LogoutView.as_view(),             name='logout'),

    # Token management
    path('token/refresh/',        CookieTokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify/',         TokenVerifyView.as_view(),        name='token-verify'),

    # Profile
    path('me/',                   MeView.as_view(),                 name='me'),

    # CSRF
    path('csrf/',                 CSRFCookieView.as_view(),         name='csrf'),

    # Email verification
    path('email/verify/',                   EmailVerifyView.as_view(),        name='email-verify'),
    path('email/resend-verification/',      ResendVerificationView.as_view(), name='email-resend'),

    # Password flows
    path('password/reset/request/',         PasswordResetRequestView.as_view(),  name='password-reset-request'),
    path('password/reset/confirm/',         PasswordResetConfirmView.as_view(),  name='password-reset-confirm'),
    path('password/change/',                ChangePasswordView.as_view(),        name='password-change'),

    # Admin — User management (mounted here, secured by IsSuperAdmin/IsPlatformStaff)
    path('admin/users/',                    AdminUserListView.as_view(),         name='admin-user-list'),
    path('admin/users/<uuid:pk>/',          AdminUserDetailView.as_view(),       name='admin-user-detail'),
]
