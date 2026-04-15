from users.permissions import IsAuthenticatedAndVerified
from organizations.models import OrgRole, OrganizationMembership


def _get_membership(user, org):
    """Return the active OrganizationMembership for this user+org, or None."""
    return OrganizationMembership.objects.filter(
        user=user,
        organization=org,
        is_active=True,
    ).first()


class IsOrgMember(IsAuthenticatedAndVerified):
    """
    Object-level permission: user must be an active member of the org.
    Subclasses set `required_roles` to restrict by role.
    The `obj` passed to has_object_permission must be an Organization instance.
    """
    required_roles = None  # None = any active member
    message = 'You are not a member of this organization.'

    def has_object_permission(self, request, view, obj):
        if not super().has_permission(request, view):
            return False
        membership = _get_membership(request.user, obj)
        if not membership:
            return False
        if self.required_roles:
            return membership.role in self.required_roles
        return True


class IsOrgOwner(IsOrgMember):
    required_roles = [OrgRole.OWNER]
    message = 'Organization owner access required.'


class IsOrgManager(IsOrgMember):
    required_roles = [OrgRole.OWNER, OrgRole.MANAGER]
    message = 'Organization manager access required.'


class IsOrgStaff(IsOrgMember):
    required_roles = [OrgRole.OWNER, OrgRole.MANAGER, OrgRole.STAFF]
    message = 'Organization staff access required.'


class IsOrgFinance(IsOrgMember):
    required_roles = [OrgRole.OWNER, OrgRole.FINANCE]
    message = 'Organization finance access required.'


class IsOrgOwnerOrSuperAdmin(IsOrgMember):
    """Super admins bypass the org membership check."""
    from users.models import PlatformRole as _PR
    required_roles = [OrgRole.OWNER]

    def has_object_permission(self, request, view, obj):
        from users.models import PlatformRole
        if (
            request.user.is_authenticated
            and request.user.platform_role == PlatformRole.SUPER_ADMIN
        ):
            return True
        return super().has_object_permission(request, view, obj)
