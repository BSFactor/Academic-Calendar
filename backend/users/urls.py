from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import StudentProfileCreateView, UserProfileView

print("LOADING USERS URLS MODULE")

urlpatterns = [
    # JWT Token endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # User Profile endpoint
    path("my-profile/", UserProfileView.as_view(), name="user_profile"),
    # Student creation endpoint
    path("create-student/", StudentProfileCreateView.as_view(), name="create-student"),
]
