"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import RedirectView
from users.views import login_page, signup_page
from events.views import calendar_week_view
# def root_view(request):
#     return JsonResponse({
#         "message": "Welcome to Academic Calendar API",
#         "available_endpoints": [
#             "/api/users/signup/",
#             "/api/users/login/",
#             "/api/events/my-events/"
#         ]
#     })

urlpatterns = [
    path('', RedirectView.as_view(url='/users/api/signup/', permanent=False)),
    path('admin/', admin.site.urls),
    # web login and signup pages
    path('users/api/login/', login_page, name='web_login'),
    path('users/api/signup/', signup_page, name='web_signup'),
    path('calendar/', calendar_week_view, name='calendar'),
    path('api/users/', include('users.urls')),
    path('api/events/', include('events.urls')),
]
