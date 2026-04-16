from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='emails')
def send_invitation_email(self, invitation_id: str):
    """Send a magic-link invitation email to a prospective org member."""
    from organizations.models import OrganizationInvitation

    try:
        invitation = OrganizationInvitation.objects.select_related(
            'organization', 'invited_by'
        ).get(id=invitation_id)
    except OrganizationInvitation.DoesNotExist:
        return

    accept_url = (
        f'{settings.FRONTEND_URL}/organizations/invitations/{invitation.token}/accept'
    )
    org_name    = invitation.organization.name
    inviter     = invitation.invited_by.full_name or invitation.invited_by.email
    role_label  = dict(invitation._meta.get_field('role').choices).get(invitation.role, invitation.role)

    try:
        send_mail(
            subject=f"You've been invited to join {org_name} on AdoraTour",
            message=(
                f'Hi,\n\n'
                f'{inviter} has invited you to join {org_name} as {role_label}.\n\n'
                f'Click the link below to accept (valid for 7 days):\n\n'
                f'{accept_url}\n\n'
                f'If you did not expect this invitation, please ignore this email.\n\n'
                f'— The AdoraTour Team'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invitation.email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)
