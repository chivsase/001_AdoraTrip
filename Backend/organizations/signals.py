from django.db.models.signals import post_save
from django.dispatch import receiver

from organizations.models import OrgRole, OrganizationMembership
from users.models import PlatformRole


# Map OrgRole → PlatformRole
_ORG_TO_PLATFORM = {
    OrgRole.OWNER:   PlatformRole.PARTNER_OWNER,
    OrgRole.MANAGER: PlatformRole.PARTNER_MANAGER,
    OrgRole.STAFF:   PlatformRole.PARTNER_STAFF,
    OrgRole.FINANCE: PlatformRole.PARTNER_FINANCE,
}


def _recalculate_platform_role(user):
    """
    Derive the user's platform_role from their highest active org membership.
    Falls back to TRAVELER if they have no active memberships.
    Called after membership create/update/deactivate.
    """
    active = list(
        OrganizationMembership.objects.filter(user=user, is_active=True).values_list('role', flat=True)
    )

    if not active:
        new_role = PlatformRole.TRAVELER
    else:
        # Priority: OWNER > MANAGER > FINANCE > STAFF
        priority = [OrgRole.OWNER, OrgRole.MANAGER, OrgRole.FINANCE, OrgRole.STAFF]
        for role in priority:
            if role in active:
                new_role = _ORG_TO_PLATFORM[role]
                break
        else:
            new_role = PlatformRole.TRAVELER

    if user.platform_role != new_role:
        user.platform_role = new_role
        user.save(update_fields=['platform_role'])


@receiver(post_save, sender=OrganizationMembership)
def sync_platform_role_on_membership_change(sender, instance, created, **kwargs):
    """Keep user.platform_role in sync whenever a membership is saved."""
    _recalculate_platform_role(instance.user)
