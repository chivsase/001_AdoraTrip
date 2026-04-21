from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DestinationViewSet

app_name = 'cms'

router = DefaultRouter()
router.register(r'destinations', DestinationViewSet, basename='destination')

urlpatterns = [
    path('', include(router.urls)),
]
