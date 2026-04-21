from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
app_name = 'inventory'

# Public Endpoints
router.register('hotels', views.HotelViewSet, basename='public-hotels')
router.register('tours', views.TourViewSet, basename='public-tours')
router.register('attractions', views.AttractionViewSet, basename='public-attractions')
router.register('restaurants', views.RestaurantViewSet, basename='public-restaurants')
router.register('transfers', views.TransferRouteViewSet, basename='public-transfers')

# Vendor / Partner Management Endpoints
router.register('vendor/hotels', views.VendorHotelViewSet, basename='vendor-hotels')
router.register('vendor/tours', views.VendorTourViewSet, basename='vendor-tours')
router.register('vendor/attractions', views.VendorAttractionViewSet, basename='vendor-attractions')
router.register('vendor/restaurants', views.VendorRestaurantViewSet, basename='vendor-restaurants')
router.register('vendor/transfers', views.VendorTransferViewSet, basename='vendor-transfers')
router.register('vendor/rooms', views.VendorRoomTypeViewSet, basename='vendor-rooms')
router.register('vendor/slots', views.VendorTourSlotViewSet, basename='vendor-slots')

# Super Admin / Platform Management Endpoints
router.register('admin/hotels', views.AdminHotelViewSet, basename='admin-hotels')
router.register('admin/tours', views.AdminTourViewSet, basename='admin-tours')
router.register('admin/attractions', views.AdminAttractionViewSet, basename='admin-attractions')
router.register('admin/restaurants', views.AdminRestaurantViewSet, basename='admin-restaurants')
router.register('admin/transfers', views.AdminTransferViewSet, basename='admin-transfers')

urlpatterns = [
    path('', include(router.urls)),
]
