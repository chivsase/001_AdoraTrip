from django.db import models
from django.conf import settings


class RewardsAccount(models.Model):
    """
    Stores a traveler's points balance and tier history.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rewards_account'
    )
    balance = models.PositiveIntegerField(default=0)  # Current spendable points
    lifetime_earned = models.PositiveIntegerField(default=0)
    lifetime_redeemed = models.PositiveIntegerField(default=0)
    
    # Mirroring CustomUser.rewards_tier for redundancy and history
    tier = models.CharField(max_length=20, default='bronze')
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rewards_accounts'

    def __str__(self):
        return f'{self.user.email} — {self.balance} pts'


class RewardsTransactionType(models.TextChoices):
    EARN = 'earn', 'Earn'
    REDEEM = 'redeem', 'Redeem'
    EXPIRE = 'expire', 'Expire'
    BONUS = 'bonus', 'Bonus'


class RewardsTransaction(models.Model):
    """
    Ledger for all points movements.
    """
    account = models.ForeignKey(
        RewardsAccount,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    booking = models.ForeignKey(
        'bookings.Booking',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reward_transactions'
    )
    
    type = models.CharField(
        max_length=10,
        choices=RewardsTransactionType.choices
    )
    points = models.IntegerField()  # Positive = earn/bonus, Negative = redeem/expire
    balance_after = models.PositiveIntegerField()
    description = models.CharField(max_length=200, blank=True)
    
    expires_at = models.DateField(null=True, blank=True)  # Points usually expire after 1 year
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rewards_transactions'
        ordering = ['-created_at']
