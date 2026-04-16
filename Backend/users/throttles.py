from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthLoginThrottle(AnonRateThrottle):
    scope = 'auth_login'


class AuthRegisterThrottle(AnonRateThrottle):
    scope = 'auth_register'


class PasswordResetThrottle(AnonRateThrottle):
    scope = 'password_reset'


class TokenRefreshThrottle(UserRateThrottle):
    scope = 'token_refresh'


class ResendVerifyThrottle(UserRateThrottle):
    scope = 'resend_verify'
