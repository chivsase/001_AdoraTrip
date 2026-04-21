from django.db import models
from .base import AbstractListing


class Tour(AbstractListing):
    """
    Day trips, multi-day tours, and activities.
    Schedules define recurrence rules; TourSlots are the concrete bookable instances.
    """
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1)
    max_participants = models.PositiveIntegerField()
    min_participants = models.PositiveIntegerField(default=1)
    meeting_point = models.TextField(blank=True)
    meeting_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    meeting_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    includes = models.JSONField(default=list)   # ["lunch", "transport", "guide"]
    excludes = models.JSONField(default=list)
    difficulty = models.CharField(
        max_length=20,
        choices=[('easy', 'Easy'), ('moderate', 'Moderate'), ('hard', 'Hard')],
        default='easy',
    )
    languages = models.JSONField(default=list)  # ["en", "km", "zh"]

    class Meta:
        db_table = 'inventory_tours'

    def save(self, *args, **kwargs):
        if not self.listing_type:
            self.listing_type = 'tour'
        super().save(*args, **kwargs)


class TourSchedule(models.Model):
    """Recurring schedule rule — e.g. every Mon/Wed/Fri at 08:00."""
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='schedules')
    weekdays = models.JSONField()       # [0,1,2,3,4,5,6] — 0=Monday
    start_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_tour_schedules'

    def __str__(self):
        return f'{self.tour.name} schedule @ {self.start_time}'


class TourSlot(models.Model):
    """
    Concrete bookable date+time slot, generated from a TourSchedule
    or created manually by the vendor.
    """
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='slots')
    schedule = models.ForeignKey(TourSchedule, on_delete=models.SET_NULL, null=True, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    available_seats = models.PositiveIntegerField()
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'inventory_tour_slots'
        indexes = [models.Index(fields=['tour', 'starts_at'])]

    def __str__(self):
        return f'{self.tour.name} | {self.starts_at} | {self.available_seats} seats'

    @property
    def effective_price(self):
        return self.price_override if self.price_override is not None else self.tour.base_price
