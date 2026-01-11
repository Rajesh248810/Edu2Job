import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def create_admin_user():
    email = "admin@edu2job.com"
    password = "AdminPassword123!" # Plain text as per LoginView logic
    name = "System Admin"
    
    if User.objects.filter(email=email).exists():
        print(f"User {email} already exists. Updating password.")
        user = User.objects.get(email=email)
        user.password_hash = password # Storing plain text
        user.role = 'Admin' # Ensure role is set (though model case might differ 'admin' vs 'Admin')
        # Let's normalize role to lowercase 'admin' as per views usage usually
        user.role = 'admin' 
        user.save()
    else:
        print(f"Creating new user {email}")
        User.objects.create(
            email=email,
            password_hash=password, # Storing plain text
            name=name,
            role='admin'
        )
    print("Admin user created/updated successfully with PLAIN TEXT password.")

if __name__ == '__main__':
    create_admin_user()
