from rest_framework.permissions import BasePermission

# Allow access only to DAA users.
class IsDAA(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "DAA"


# Allow access only to AA users.
class IsAA(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "AA"
