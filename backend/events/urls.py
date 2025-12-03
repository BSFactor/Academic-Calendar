from django.urls import path
from .views import UserEventsView

urlpatterns = [
    path('my-events/', UserEventsView.as_view(), name='user-events'),
]
