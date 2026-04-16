from allauth.socialaccount.signals import social_account_added, social_account_removed
from django.dispatch import receiver


@receiver(social_account_added)
def on_social_account_added(sender, request, sociallogin, **kwargs):
    """Update the social-linked flag when a user connects a provider."""
    user     = sociallogin.user
    provider = sociallogin.account.provider

    if provider == 'google':
        user.google_linked = True
    elif provider == 'facebook':
        user.facebook_linked = True

    user.save(update_fields=['google_linked', 'facebook_linked'])


@receiver(social_account_removed)
def on_social_account_removed(sender, request, socialaccount, **kwargs):
    """Clear the social-linked flag when a user disconnects a provider."""
    user     = socialaccount.user
    provider = socialaccount.provider

    if provider == 'google':
        user.google_linked = False
    elif provider == 'facebook':
        user.facebook_linked = False

    user.save(update_fields=['google_linked', 'facebook_linked'])
