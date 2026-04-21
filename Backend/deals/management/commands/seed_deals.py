"""
Management command to seed sample destinations and deals for development.

Usage:
    python manage.py seed_deals            # create (idempotent — skips existing)
    python manage.py seed_deals --reset    # wipe and recreate
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from cms.models import Destination
from deals.models import Deal


DESTINATIONS = [
    {
        'id': 'siem-reap',
        'name': 'Siem Reap',
        'province': 'Siem Reap Province',
        'tagline': 'Gateway to Angkor Wat',
        'image': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&h=600&fit=crop',
        'rating_avg': 4.9,
        'review_count': 8412,
        'listing_count': 450,
        'price_from': 18,
        'tag': 'MOST POPULAR',
        'categories': ['Culture', 'Nature'],
        'is_trending': True,
        'sort_order': 1,
    },
    {
        'id': 'phnom-penh',
        'name': 'Phnom Penh',
        'province': 'Capital City',
        'tagline': 'Vibrant Capital on the Mekong',
        'image': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=420&fit=crop',
        'rating_avg': 4.7,
        'review_count': 5230,
        'listing_count': 620,
        'price_from': 22,
        'tag': '',
        'categories': ['Urban', 'Culture'],
        'is_trending': False,
        'sort_order': 2,
    },
    {
        'id': 'sihanoukville',
        'name': 'Sihanoukville',
        'province': 'Preah Sihanouk Province',
        'tagline': 'Pristine Beaches & Islands',
        'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=420&fit=crop',
        'rating_avg': 4.6,
        'review_count': 3980,
        'listing_count': 310,
        'price_from': 25,
        'tag': 'BEACH ESCAPE',
        'categories': ['Beach', 'Nature'],
        'is_trending': False,
        'sort_order': 3,
    },
    {
        'id': 'kampot',
        'name': 'Kampot & Kep',
        'province': 'Kampot Province',
        'tagline': 'Riverside Charm & Pepper Farms',
        'image': 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=420&fit=crop',
        'rating_avg': 4.8,
        'review_count': 2740,
        'listing_count': 180,
        'price_from': 15,
        'tag': 'HIDDEN GEM',
        'categories': ['Nature', 'Culture'],
        'is_trending': False,
        'sort_order': 4,
    },
    {
        'id': 'battambang',
        'name': 'Battambang',
        'province': 'Battambang Province',
        'tagline': 'Colonial Architecture & Art',
        'image': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=420&fit=crop',
        'rating_avg': 4.6,
        'review_count': 1890,
        'listing_count': 140,
        'price_from': 12,
        'tag': '',
        'categories': ['Culture', 'Urban'],
        'is_trending': False,
        'sort_order': 5,
    },
    {
        'id': 'mondulkiri',
        'name': 'Mondulkiri',
        'province': 'Mondulkiri Province',
        'tagline': 'Wild Highlands & Waterfalls',
        'image': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=420&fit=crop',
        'rating_avg': 4.7,
        'review_count': 1240,
        'listing_count': 65,
        'price_from': 20,
        'tag': 'ECO ADVENTURE',
        'categories': ['Nature'],
        'is_trending': False,
        'sort_order': 6,
    },
    {
        'id': 'ratanakiri',
        'name': 'Ratanakiri',
        'province': 'Ratanakiri Province',
        'tagline': 'Volcanic Lakes & Indigenous Culture',
        'image': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=420&fit=crop',
        'rating_avg': 4.7,
        'review_count': 890,
        'listing_count': 45,
        'price_from': 18,
        'tag': '',
        'categories': ['Nature', 'Culture'],
        'is_trending': False,
        'sort_order': 7,
    },
    {
        'id': 'kratie',
        'name': 'Kratie',
        'province': 'Kratie Province',
        'tagline': 'Irrawaddy Dolphins & Mekong',
        'image': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=420&fit=crop',
        'rating_avg': 4.5,
        'review_count': 720,
        'listing_count': 38,
        'price_from': 10,
        'tag': '',
        'categories': ['Nature'],
        'is_trending': False,
        'sort_order': 8,
    },
]


def make_deals(now):
    return [
        {
            'title': 'Angkor Wat Sunrise Tour',
            'description': 'Private guided tour + breakfast, departing Siem Reap',
            'image': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=500&h=320&fit=crop',
            'original_price': 85,
            'sale_price': 49,
            'discount_pct': 42,
            'listing_type': 'tour',
            'badge': 'flash',
            'location': 'Siem Reap',
            'destination_id': 'siem-reap',
            'expires_at': now + timedelta(hours=4, minutes=15),
            'priority': 10,
        },
        {
            'title': 'Phnom Penh Boutique Hotel',
            'description': 'Superior room with city view, breakfast included',
            'image': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=320&fit=crop',
            'original_price': 75,
            'sale_price': 42,
            'discount_pct': 44,
            'listing_type': 'hotel',
            'badge': 'member',
            'location': 'Phnom Penh',
            'destination_id': 'phnom-penh',
            'expires_at': now + timedelta(hours=9, minutes=30),
            'priority': 9,
        },
        {
            'title': 'Koh Rong Island Escape',
            'description': 'Beach bungalow + speedboat transfer, 3 nights',
            'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=320&fit=crop',
            'original_price': 220,
            'sale_price': 138,
            'discount_pct': 37,
            'listing_type': 'package',
            'badge': '',
            'location': 'Sihanoukville',
            'destination_id': 'sihanoukville',
            'expires_at': now + timedelta(days=1, hours=7),
            'priority': 8,
        },
        {
            'title': 'Kampot River Resort',
            'description': 'Garden villa with pool, riverside breakfast buffet',
            'image': 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=500&h=320&fit=crop',
            'original_price': 90,
            'sale_price': 56,
            'discount_pct': 38,
            'listing_type': 'hotel',
            'badge': 'hot',
            'location': 'Kampot',
            'destination_id': 'kampot',
            'expires_at': now + timedelta(days=2, hours=3),
            'priority': 7,
        },
        {
            'title': 'Elephant Valley Day Trip',
            'description': 'Full-day ethical elephant experience, lunch & transport',
            'image': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=320&fit=crop',
            'original_price': 120,
            'sale_price': 79,
            'discount_pct': 34,
            'listing_type': 'tour',
            'badge': '',
            'location': 'Mondulkiri',
            'destination_id': 'mondulkiri',
            'expires_at': now + timedelta(hours=6, minutes=45),
            'priority': 6,
        },
        {
            'title': 'Siem Reap 3-Night Package',
            'description': 'Boutique hotel + Angkor pass + tuk-tuk for 3 days',
            'image': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=500&h=320&fit=crop',
            'original_price': 280,
            'sale_price': 168,
            'discount_pct': 40,
            'listing_type': 'package',
            'badge': 'bestseller',
            'location': 'Siem Reap',
            'destination_id': 'siem-reap',
            'expires_at': now + timedelta(hours=12),
            'priority': 10,
        },
    ]


class Command(BaseCommand):
    help = 'Seed sample destinations and deals for development/testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete all existing destinations and deals before seeding',
        )

    def handle(self, *args, **options):
        if options['reset']:
            Deal.objects.all().delete()
            Destination.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared all deals and destinations.'))

        # ── Destinations ──────────────────────────────────────────────────────
        dest_created = 0
        dest_skipped = 0
        for data in DESTINATIONS:
            _, created = Destination.objects.update_or_create(
                id=data['id'],
                defaults={k: v for k, v in data.items() if k != 'id'},
            )
            if created:
                dest_created += 1
            else:
                dest_skipped += 1

        self.stdout.write(
            self.style.SUCCESS(f'Destinations: {dest_created} created, {dest_skipped} updated.')
        )

        # ── Deals ─────────────────────────────────────────────────────────────
        now = timezone.now()
        deals_data = make_deals(now)

        deals_created = 0
        for data in deals_data:
            deal, created = Deal.objects.update_or_create(
                title=data['title'],
                defaults=data,
            )
            if created:
                deals_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Deals: {deals_created} created. '
                f'{Deal.objects.filter(is_active=True).count()} total active deals.'
            )
        )
        self.stdout.write(self.style.SUCCESS('\nSeed complete. Run your dev server and check:'))
        self.stdout.write('  GET http://localhost:8000/api/v1/destinations/')
        self.stdout.write('  GET http://localhost:8000/api/v1/deals/?active=true&limit=6')
