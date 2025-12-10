from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from .models import User

class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            # Header format: "Bearer <token>"
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None

        try:
            # Decode the token
            # NOTE: Using the same hardcoded key as in views.py. 
            # In production, use settings.SECRET_KEY consistently.
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token: no user_id')

            try:
                user = User.objects.get(user_id=user_id)
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')

            # Return (user, token) tuple as required by DRF
            # We attach the custom user object to request.user
            # We also need to add an 'is_authenticated' property to the user object 
            # because DRF permissions checks might rely on it (though IsAdmin checks role directly).
            # However, standard Django user has is_authenticated as a property. 
            # Our custom user is a model instance. We can monkey-patch it or just rely on truthiness.
            user.is_authenticated = True
            return (user, token)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
