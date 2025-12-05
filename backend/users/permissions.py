from rest_framework.permissions import BasePermission


class IsDAAOrAdminOrHasModelPerm(BasePermission):
    """Allow access only to users with role 'department_assistant' or 'administrator',
    or who have the model permission 'users.can_create_student'.

    This is intentionally simple: it checks a user's `role` attribute (from the
    custom User model) or Django's model permissions.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # fast role check
        try:
            role = getattr(user, "role", None)
        except Exception:
            role = None

        if role in ("department_assistant", "administrator"):
            return True

