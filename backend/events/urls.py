from django.urls import path
from .views import UserEventsView, CreateEventView

urlpatterns = [
    path('my-events/', UserEventsView.as_view(), name='user-events'),
    path('create/', CreateEventView.as_view(), name='create-event'),

]
