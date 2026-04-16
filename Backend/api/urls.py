from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router
router = DefaultRouter()
router.register(r'tours', views.TourViewSet, basename='tour')
router.register(r'bookings', views.BookingViewSet, basename='booking')

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
]
