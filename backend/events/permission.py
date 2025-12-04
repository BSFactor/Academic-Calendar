from rest_framework.permissions import BasePermission

class IsDAA(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="DAA").exists()

class IsAA(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="AA").exists()
