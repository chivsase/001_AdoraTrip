from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    path('order/', views.CreateBookingView.as_view(), name='create-booking'),
]
