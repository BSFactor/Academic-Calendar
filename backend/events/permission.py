from rest_framework.permissions import BasePermission

class IsDAA(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "DAA"

class IsAA(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "AA"
