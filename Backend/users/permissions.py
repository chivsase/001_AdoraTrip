from rest_framework.permissions import BasePermission
from users.models import PlatformRole


class IsAuthenticatedAndVerified(BasePermission):
    """
    Base for all protected endpoints.
    Requires: authenticated + email verified + account active.
    """
    message = 'Authentication required. Please verify your email address.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.is_email_verified
        )


class IsSuperAdmin(IsAuthenticatedAndVerified):
    """Full platform control. Only SUPER_ADMIN role."""
    message = 'Super admin access required.'

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.platform_role == PlatformRole.SUPER_ADMIN
        )


class IsPlatformStaff(IsAuthenticatedAndVerified):
    """Platform-level read + moderation access (SUPER_ADMIN or PLATFORM_STAFF)."""
    message = 'Platform staff access required.'

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.platform_role in (
                PlatformRole.SUPER_ADMIN,
                PlatformRole.PLATFORM_STAFF,
            )
        )


class IsAnyPartnerRole(IsAuthenticatedAndVerified):
    """Any user with a PARTNER_* platform role."""
    message = 'Partner account required.'

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.platform_role.startswith('PARTNER_')
        )


class IsLocalGuide(IsAuthenticatedAndVerified):
    message = 'Local guide account required.'

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.platform_role == PlatformRole.LOCAL_GUIDE
        )


class IsTransportProvider(IsAuthenticatedAndVerified):
    message = 'Transport provider account required.'

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.platform_role == PlatformRole.TRANSPORT_PROVIDER
        )


class IsTraveler(IsAuthenticatedAndVerified):
    message = 'Traveler account required.'

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user.platform_role == PlatformRole.TRAVELER
        )


class IsBookingOwner(IsAuthenticatedAndVerified):
    """Object-level: only the traveler who made the booking can access it."""
    message = 'You do not have permission to access this booking.'

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
