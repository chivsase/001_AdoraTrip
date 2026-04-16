from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='emails')
def send_verification_email(self, user_id: str):
    """Generate a verification token and send the email."""
    from django.contrib.auth import get_user_model
    from users.tokens import make_email_verification_token

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    if user.is_email_verified:
        return

    token_record = make_email_verification_token(user)
    verify_url   = f'{settings.FRONTEND_URL}/verify-email?token={token_record.token}'

    try:
        send_mail(
            subject='Verify your AdoraTrip email address',
            message=(
                f'Hi {user.full_name or user.email},\n\n'
                f'Please verify your email by clicking the link below:\n\n'
                f'{verify_url}\n\n'
                f'This link expires in 24 hours.\n\n'
                f'If you did not create an account, please ignore this email.\n\n'
                f'— The AdoraTrip Team'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60, queue='emails')
def send_password_reset_email(self, user_id: str):
    """Generate a reset token and send the email."""
    from django.contrib.auth import get_user_model
    from users.tokens import make_password_reset_token

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return

    token_record = make_password_reset_token(user)
    reset_url    = f'{settings.FRONTEND_URL}/reset-password?token={token_record.token}'

    try:
        send_mail(
            subject='Reset your AdoraTrip password',
            message=(
                f'Hi {user.full_name or user.email},\n\n'
                f'You requested a password reset. Click the link below:\n\n'
                f'{reset_url}\n\n'
                f'This link expires in 1 hour.\n\n'
                f'If you did not request this, please ignore this email.\n\n'
                f'— The AdoraTrip Team'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(queue='emails')
def create_audit_log(user_id, action, ip_address=None, user_agent='', metadata=None):
    """Persist an AuditLog record asynchronously."""
    from users.models import AuditLog
    from django.contrib.auth import get_user_model
    User = get_user_model()

    user = None
    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            pass

    AuditLog.objects.create(
        user=user,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        metadata=metadata or {},
    )
