from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import MyTokenObtainPairSerializer
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .models import User


def login_page(request):
    """Render web login page and handle form POST authentication."""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/calendar/')
        messages.error(request, 'Invalid username or password')
    return render(request, "users/login.html")


def signup_page(request):
    """Render web signup page and handle form POST account creation."""
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Check existing username/email to avoid duplicates
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists')
            return render(request, "users/signup.html")

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
            return render(request, "users/signup.html")

        # Create new user with default role 'USER' and log in
        try:
            user = User.objects.create_user(username=username, email=email, password=password, role='USER')
            login(request, user)
            messages.success(request, 'Account created successfully!')
            return redirect('/calendar/')
        except Exception as e:
            messages.error(request, f'Error creating account: {str(e)}')
            return render(request, "users/signup.html")

    return render(request, "users/signup.html")


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
# Signup endpoint
class SignupView(APIView):
    """
    POST /api/users/signup/
    Creates a new user account and returns an auth token.
    """

    http_method_names = ['post']

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED) 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)