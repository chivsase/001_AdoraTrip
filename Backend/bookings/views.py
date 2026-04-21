from django.db import transaction
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from rest_framework import views, status, response, permissions
from decimal import Decimal

from inventory.models.base import PriceRule
from inventory.models.hotel import RoomType, RoomInventory
from inventory.models.tour import Tour, TourSlot
from .models import Booking, BookingItem, BookingStatus, BookingLock
from .serializers import CreateBookingSerializer, BookingSerializer


class CreateBookingView(views.APIView):
    """
    POST /api/v1/bookings/order/
    Creates a new booking, validates availability, and locks inventory.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        items_data = serializer.validated_data['items']
        special_requests = serializer.validated_data.get('special_requests', '')
        
        # 1. Total calculation and initial validation
        subtotal = Decimal('0.00')
        booking_items_to_create = []
        locks_to_create = []
        
        # We need a primary organization for the booking. 
        # Typically travel platforms split by organization, but here we'll 
        # assume the first item's org is the primary one for the record.
        primary_org = None

        for item in items_data:
            l_id = item['listing_id']
            l_type = item['listing_type']
            qty = item['quantity']
            
            unit_price = Decimal('0.00')
            listing_name = ""
            listing_obj = None
            
            if l_type == 'hotel':
                room_type = RoomType.objects.get(id=l_id)
                listing_obj = room_type.hotel
                listing_name = f"{room_type.hotel.name} - {room_type.name}"
                check_in = item['check_in']
                check_out = item['check_out']
                
                # Check room inventory for each night (simplified for this demo)
                # In a real app, you'd aggregate all relevant RoomInventory rows
                unit_price = self._calculate_effective_price(room_type, check_in)
                
                # Create a lock for each night? 
                # For now, let's lock the room_type + date_range string
                locks_to_create.append(BookingLock(
                    content_type=ContentType.objects.get_for_model(RoomType),
                    object_id=room_type.id,
                    date_or_slot=f"{check_in}/{check_out}",
                    quantity=qty,
                    locked_until=timezone.now() + timezone.timedelta(minutes=15)
                ))

            elif l_type == 'tour':
                slot = TourSlot.objects.get(id=l_id)
                listing_obj = slot.tour
                listing_name = slot.tour.name
                
                if slot.available_seats < qty:
                    return response.Response(
                        {'error': f'Not enough seats available for {listing_name}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                unit_price = slot.effective_price
                
                locks_to_create.append(BookingLock(
                    content_type=ContentType.objects.get_for_model(TourSlot),
                    object_id=slot.id,
                    date_or_slot=str(slot.id),
                    quantity=qty,
                    locked_until=timezone.now() + timezone.timedelta(minutes=15)
                ))

            if not primary_org:
                primary_org = listing_obj.organization

            line_total = unit_price * qty
            subtotal += line_total
            
            booking_items_to_create.append({
                'content_type': ContentType.objects.get_for_model(listing_obj.__class__),
                'object_id': listing_obj.id,
                'listing_name': listing_name,
                'listing_snapshot': {}, # Placeholder for actual snapshot logic
                'unit_price': unit_price,
                'quantity': qty,
                'line_total': line_total,
                'check_in': item.get('check_in'),
                'check_out': item.get('check_out'),
                'slot_id': item.get('slot_id')
            })

        # 2. Finalize Booking record
        total = subtotal # Minus discounts/rewards later
        
        booking = Booking.objects.create(
            user=request.user,
            organization=primary_org,
            status=BookingStatus.PENDING_PAYMENT,
            subtotal=subtotal,
            total=total,
            special_requests=special_requests,
            expires_at=timezone.now() + timezone.timedelta(minutes=15)
        )
        
        # 3. Save items and associate locks
        for itm in booking_items_to_create:
            BookingItem.objects.create(booking=booking, **itm)
            
        for lock in locks_to_create:
            lock.booking = booking
            # We check uniqueness here to prevent double-booking
            try:
                lock.save()
            except Exception:
                # If unique constraint fails, someone else just locked it
                transaction.set_rollback(True)
                return response.Response(
                    {'error': 'Inventory is currently held by another customer. Please try again in 15 minutes.'},
                    status=status.HTTP_409_CONFLICT
                )

        return response.Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    def _calculate_effective_price(self, listing, date):
        """
        Calculates price including seasonal adjustments from PriceRule.
        """
        base = listing.base_price
        # Find active price rules for this listing and date
        ct = ContentType.objects.get_for_model(listing.__class__)
        rules = PriceRule.objects.filter(
            content_type=ct,
            object_id=listing.id,
            start_date__lte=date,
            end_date__gte=date,
            is_active=True
        ).order_by('-priority')
        
        if not rules.exists():
            return base
            
        # Apply the highest priority rule
        rule = rules.first()
        if rule.adjustment_pct != 0:
            base = base * (1 + (rule.adjustment_pct / 100))
        if rule.adjustment_fixed != 0:
            base = base + rule.adjustment_fixed
            
        return base
