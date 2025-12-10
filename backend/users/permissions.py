from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users with role='admin' to access the view.
    """

    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has 'admin' role
        # Note: Adjust 'role' attribute access based on your User model
        return getattr(request.user, 'role', '') == 'admin'
