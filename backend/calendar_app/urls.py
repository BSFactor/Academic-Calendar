from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.create_event),
    path("edit/<int:event_id>/", views.edit_event),
    path("approve/<int:event_id>/", views.approve_event),
    path("reject/<int:event_id>/", views.reject_event),
    path("tutor-events/", views.tutor_events),
    path("approved/", views.approved_events),
]
