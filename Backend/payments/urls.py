from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # PayWay Endpoints
    path('payway/checkout-payload/', views.CreatePayWayCheckoutView.as_view(), name='payway-checkout-payload'),
    path('payway/webhook/', views.PayWayWebhookView.as_view(), name='payway-webhook'),
    path('payway/check-status/<str:tran_id>/', views.CheckPaymentStatusView.as_view(), name='payway-check-status'),
]
