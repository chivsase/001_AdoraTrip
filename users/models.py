import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone

from .managers import CustomUserManager


class PlatformRole(models.TextChoices):
    SUPER_ADMIN        = 'SUPER_ADMIN',        'Super Admin'
    PLATFORM_STAFF     = 'PLATFORM_STAFF',     'Platform Staff'
    PARTNER_OWNER      = 'PARTNER_OWNER',      'Partner Owner'
    PARTNER_MANAGER    = 'PARTNER_MANAGER',    'Partner Manager'
    PARTNER_STAFF      = 'PARTNER_STAFF',      'Partner Staff'
    PARTNER_FINANCE    = 'PARTNER_FINANCE',    'Partner Finance'
    LOCAL_GUIDE        = 'LOCAL_GUIDE',        'Local Guide'
    TRANSPORT_PROVIDER = 'TRANSPORT_PROVIDER', 'Transport Provider'
    TRAVELER           = 'TRAVELER',           'Traveler'


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model with UUID PK and email-based authentication.
    UUID prevents user ID enumeration attacks in JWT sub claims.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Identity
    email     = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    phone     = models.CharField(max_length=20, blank=True)
    avatar    = models.ImageField(upload_to='avatars/', null=True, blank=True)

    # Platform-level role (coarse; org membership holds fine-grained role)
    platform_role = models.CharField(
        max_length=30,
        choices=PlatformRole.choices,
        default=PlatformRole.TRAVELER,
    )

    # Django admin access flags
    is_active = models.BooleanField(default=True)
    is_staff  = models.BooleanField(default=False)

    # Verification
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)

    # Social auth flags
    google_linked   = models.BooleanField(default=False)
    facebook_linked = models.BooleanField(default=False)

    # Metadata
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    date_joined   = models.DateTimeField(default=timezone.now)
    updated_at    = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['platform_role']),
        ]

    def __str__(self):
        return self.email

    @property
    def is_partner(self):
        return self.platform_role.startswith('PARTNER_')

    @property
    def is_admin(self):
        return self.platform_role in (PlatformRole.SUPER_ADMIN, PlatformRole.PLATFORM_STAFF)


class EmailVerificationToken(models.Model):
    """One-time token sent to verify a user's email address (24h TTL)."""
    user       = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='email_verification')
    token      = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'email_verification_tokens'

    def is_valid(self):
        return timezone.now() < self.expires_at


class PasswordResetToken(models.Model):
    """One-time token for password reset (1h TTL)."""
    user       = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token      = models.CharField(max_length=64, unique=True)
    is_used    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'password_reset_tokens'

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at


class AuditLog(models.Model):
    """Immutable audit trail for auth and org actions."""
    user         = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    action       = models.CharField(max_length=100)       # e.g. LOGIN, REGISTER, INVITE_MEMBER
    target_model = models.CharField(max_length=100, blank=True)
    target_id    = models.CharField(max_length=100, blank=True)
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    user_agent   = models.TextField(blank=True)
    metadata     = models.JSONField(default=dict, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        indexes = [
            models.Index(fields=['user', 'action', 'created_at']),
            models.Index(fields=['action', 'created_at']),
        ]

    def __str__(self):
        return f'{self.action} by {self.user_id} at {self.created_at}'
