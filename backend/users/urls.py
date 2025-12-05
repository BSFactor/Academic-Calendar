from django.urls import path
from .views import StudentProfileCreateView

urlpatterns = [
    path("create-student/", StudentProfileCreateView.as_view(), name="create-student"),
]
