import uuid
import secrets
from datetime import timedelta
from django.db import models
from django.conf import settings
from django.utils import timezone


class OrganizationType(models.TextChoices):
    HOTEL           = 'HOTEL',           'Hotel'
    HOMESTAY        = 'HOMESTAY',        'Homestay'
    TOUR_OPERATOR   = 'TOUR_OPERATOR',   'Tour Operator'
    TRANSPORT       = 'TRANSPORT',       'Transport Company'
    ATTRACTION      = 'ATTRACTION',      'Attraction'
    RESTAURANT      = 'RESTAURANT',      'Restaurant'
    TRAVEL_AGENCY   = 'TRAVEL_AGENCY',   'Travel Agency'


class OrganizationStatus(models.TextChoices):
    PENDING   = 'PENDING',   'Pending Review'
    ACTIVE    = 'ACTIVE',    'Active'
    SUSPENDED = 'SUSPENDED', 'Suspended'
    REJECTED  = 'REJECTED',  'Rejected'


class SubscriptionTier(models.TextChoices):
    BASIC      = 'BASIC',      'Basic'
    PRO        = 'PRO',        'Pro'
    ENTERPRISE = 'ENTERPRISE', 'Enterprise'


class Organization(models.Model):
    """
    A partner company on AdoraTrip (Hotel, Homestay, Tour Operator, etc.).
    Users belong to organizations via OrganizationMembership.
    """
    id   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True)   # used in URLs: /partner/hotel-a/

    org_type = models.CharField(max_length=30, choices=OrganizationType.choices)
    status   = models.CharField(
        max_length=20,
        choices=OrganizationStatus.choices,
        default=OrganizationStatus.PENDING,
    )

    # Contact / legal info
    business_email   = models.EmailField()
    business_phone   = models.CharField(max_length=20, blank=True)
    address          = models.TextField(blank=True)
    city             = models.CharField(max_length=100, blank=True)
    registration_no  = models.CharField(max_length=100, blank=True)   # KYC
    tax_id           = models.CharField(max_length=100, blank=True)

    # Platform relation
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_organizations',
    )

    subscription_tier = models.CharField(
        max_length=20,
        choices=SubscriptionTier.choices,
        default=SubscriptionTier.BASIC,
    )

    # Admin notes
    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['org_type']),
        ]

    def __str__(self):
        return f'{self.name} ({self.org_type})'


class OrgRole(models.TextChoices):
    OWNER   = 'OWNER',   'Owner'     # Full access, can invite/remove members
    MANAGER = 'MANAGER', 'Manager'  # Bookings, inventory, pricing
    STAFF   = 'STAFF',   'Staff'    # View bookings, update check-in status
    FINANCE = 'FINANCE', 'Finance'  # Revenue reports only


class OrganizationMembership(models.Model):
    """
    Links a CustomUser to an Organization with a specific role.
    This is the core of the RBAC system for company sub-users.
    """
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='org_memberships',
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='memberships',
    )
    role      = models.CharField(max_length=20, choices=OrgRole.choices)
    is_active = models.BooleanField(default=True)

    # Invitation tracking
    invited_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sent_memberships',
    )
    invited_at  = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    # Fine-grained permission overrides per member (JSON, optional)
    # e.g. {"can_export_reports": true, "can_edit_pricing": false}
    permission_overrides = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table        = 'organization_memberships'
        unique_together = [('user', 'organization')]
        indexes = [
            models.Index(fields=['user', 'organization']),
            models.Index(fields=['organization', 'role']),
        ]

    def __str__(self):
        return f'{self.user.email} → {self.organization.name} ({self.role})'


class OrganizationInvitation(models.Model):
    """
    Magic-link invitation sent to a new member.
    Valid for 7 days. Accepted via POST /api/v1/organizations/invitations/{token}/accept/
    """
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='invitations')
    email        = models.EmailField()
    role         = models.CharField(max_length=20, choices=OrgRole.choices)
    token        = models.CharField(max_length=64, unique=True)   # secrets.token_urlsafe(32)
    invited_by   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_accepted  = models.BooleanField(default=False)
    expires_at   = models.DateTimeField()   # created_at + 7 days
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'organization_invitations'
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['email', 'organization']),
        ]

    def __str__(self):
        return f'Invite {self.email} to {self.organization.name} as {self.role}'

    @classmethod
    def create_for(cls, organization, email, role, invited_by):
        return cls.objects.create(
            organization=organization,
            email=email,
            role=role,
            token=secrets.token_urlsafe(32),
            invited_by=invited_by,
            expires_at=timezone.now() + timedelta(days=7),
        )

    def is_valid(self):
        return not self.is_accepted and timezone.now() < self.expires_at
