import uuid
from django.utils import timezone
from rest_framework import views, status, response, permissions
from django.shortcuts import get_object_or_404
from django.conf import settings

from bookings.models import Booking, BookingStatus
from .models import Payment, PaymentStatus, PaymentGateway
from .utils.payway_utils import PayWayService


class CreatePayWayCheckoutView(views.APIView):
    """
    POST /api/v1/payments/payway/checkout-payload/
    Generates the signed payload for the frontend to submit to ABA PayWay.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        if not booking_id:
            return response.Response({'error': 'booking_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the booking
        booking = get_object_or_404(Booking, id=booking_id, user=request.user)
        
        if booking.status not in [BookingStatus.CART, BookingStatus.PENDING_PAYMENT]:
            return response.Response({'error': f'Booking cannot be paid (status: {booking.status})'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure a Payment record exists for the tran_id
        # We use a UUID for the PayWay tran_id (max 20 chars). UUID hex is 32. 
        # Let's use booking reference or a short hex.
        tran_id = booking.reference.replace('-', '')[:20]
        
        payment, created = Payment.objects.get_or_create(
            booking=booking,
            gateway=PaymentGateway.ABA,
            defaults={
                'amount': booking.total,
                'currency': 'USD',
                'status': PaymentStatus.PENDING
            }
        )

        # Prepare PayWay payload
        req_time = timezone.now().strftime('%Y%m%d%H%M%S')
        
        # Prepare items JSON and base64 encode
        items_data = []
        for item in booking.items.all():
            items_data.append({
                'name': item.listing_name,
                'quantity': str(item.quantity),
                'price': str(item.unit_price)
            })
        
        items_b64 = PayWayService.encode_base64(items_data)
        
        # Return URL (frontend success page)
        # In production this would be a real URL. For now, we'll use a placeholder
        # and assume the frontend will handle the redirect if it's not base64 in the form.
        frontend_base = request.build_absolute_uri('/')  # Placeholder
        return_url = PayWayService.encode_base64(f"{frontend_base}checkout/status")

        # Generate hash
        aba_hash = PayWayService.generate_purchase_hash(
            req_time=req_time,
            tran_id=tran_id,
            amount=booking.total,
            items=items_b64,
            currency='USD',
            return_url=return_url
        )

        payload = {
            'req_time': req_time,
            'merchant_id': settings.ABA_PAYWAY_MERCHANT_ID,
            'tran_id': tran_id,
            'amount': str(booking.total),
            'items': items_b64,
            'currency': 'USD',
            'return_url': return_url,
            'hash': aba_hash,
            'aba_url': f"{settings.ABA_PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/purchase"
        }

        return response.Response(payload)


class PayWayWebhookView(views.APIView):
    """
    POST /api/v1/payments/payway/webhook/
    Handles the asynchronous status update from ABA (Pushback).
    """
    permission_classes = [permissions.AllowAny]  # ABA calls this without auth

    def post(self, request):
        data = request.data
        tran_id = data.get('tran_id')
        status_val = data.get('status')
        aba_tran_id = data.get('ap_transaction_id')
        
        # 1. Verification (Check sum/hash)
        # Note: In a real implementation, we would calculate the hash of the payload 
        # and compare it with the 'hash' parameter provided by ABA.
        
        # 2. Update status
        payment = Payment.objects.filter(booking__reference__icontains=tran_id).first()
        if not payment:
            return response.Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        payment.gateway_payment_id = aba_tran_id
        payment.gateway_response = data
        
        if status_val == '0': # Approved
            payment.status = PaymentStatus.COMPLETED
            payment.booking.status = BookingStatus.CONFIRMED
            payment.booking.save()
        else:
            payment.status = PaymentStatus.FAILED
            # Optional: handle cancellation logic
            
        payment.save()
        
        return response.Response({'status': 'ok'})


class CheckPaymentStatusView(views.APIView):
    """
    GET /api/v1/payments/payway/check-status/{tran_id}/
    Frontend polling endpoint to check local payment state.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tran_id):
        payment = get_object_or_404(Payment, booking__reference__icontains=tran_id, booking__user=request.user)
        return response.Response({
            'status': payment.status,
            'booking_status': payment.booking.status,
            'reference': payment.booking.reference
        })
