from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import StudentProfileCreateView

urlpatterns = [
    # JWT Token endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Student creation endpoint
    path("create-student/", StudentProfileCreateView.as_view(), name="create-student"),
]
