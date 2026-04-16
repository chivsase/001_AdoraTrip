import secrets
from django.utils import timezone


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure URL-safe token."""
    return secrets.token_urlsafe(length)


def make_email_verification_token(user):
    """Create or replace an EmailVerificationToken for the given user."""
    from users.models import EmailVerificationToken
    EmailVerificationToken.objects.filter(user=user).delete()
    return EmailVerificationToken.objects.create(
        user=user,
        token=generate_secure_token(32),
        expires_at=timezone.now() + timezone.timedelta(hours=24),
    )


def make_password_reset_token(user):
    """Create a new PasswordResetToken for the given user."""
    from users.models import PasswordResetToken
    return PasswordResetToken.objects.create(
        user=user,
        token=generate_secure_token(32),
        expires_at=timezone.now() + timezone.timedelta(hours=1),
    )
