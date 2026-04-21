from django.db import models


class Destination(models.Model):
    """
    A top-level travel destination (province/city) shown on the homepage
    and used as the geographic anchor for all listings.
    """
    CATEGORY_CHOICES = ['Beach', 'Culture', 'Nature', 'Urban']

    id = models.SlugField(max_length=100, primary_key=True)  # e.g. "siem-reap"
    name = models.CharField(max_length=100)
    province = models.CharField(max_length=200)
    tagline = models.CharField(max_length=300)
    image = models.URLField(max_length=500)

    # Aggregate stats (denormalised for fast reads; updated by signals/tasks)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)
    listing_count = models.PositiveIntegerField(default=0)
    price_from = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Editorial
    tag = models.CharField(max_length=50, blank=True)        # "MOST POPULAR"
    categories = models.JSONField(default=list)              # ["Culture", "Nature"]
    is_trending = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    # SEO
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cms_destinations'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name
