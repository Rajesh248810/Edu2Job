import os
import django
import requests
from django.core.files.base import ContentFile
import time

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def get_gender(name):
    """
    Determines gender based on name using heuristics and genderize.io API.
    """
    name_lower = name.lower()
    parts = name_lower.split()
    first_name = parts[0]
    
    # 1. Heuristics for common Indian suffixes/names
    if "kaur" in name_lower or "devi" in name_lower or "begum" in name_lower or "kumari" in name_lower:
        return "female"
    if "singh" in name_lower or "kumar" in name_lower or "lal" in name_lower or "khan" in name_lower or "ali" in name_lower:
        return "male"
        
    # 2. API Check
    try:
        response = requests.get(f"https://api.genderize.io/?name={first_name}&country_id=IN", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('gender') and data.get('probability', 0) > 0.6:
                return data['gender']
    except Exception as e:
        print(f"  Gender API error: {e}")
    
    # 3. Fallback
    return "male" # Default fallback

def get_indian_image_url(gender):
    """
    Fetches a random Indian person's image URL based on gender.
    """
    try:
        response = requests.get(f"https://randomuser.me/api/?gender={gender}&nat=IN", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data['results'][0]['picture']['large']
    except Exception as e:
        print(f"  RandomUser API error: {e}")
    return None

def populate_images():
    users = User.objects.all()
    print(f"Found {users.count()} users.")

    for user in users:
        print(f"Processing user: {user.name}")
        
        # Determine Gender
        gender = get_gender(user.name)
        print(f"  Identified as: {gender}")

        # 1. Profile Picture (Indian, Gender-specific)
        try:
            print(f"  Fetching {gender} Indian profile picture...")
            image_url = get_indian_image_url(gender)
            
            if image_url:
                img_response = requests.get(image_url)
                if img_response.status_code == 200:
                    # Delete old image if it exists (optional, but good for cleanup)
                    # if user.profile_picture:
                    #     user.profile_picture.delete(save=False)
                        
                    file_name = f"profile_{user.user_id}.jpg"
                    user.profile_picture.save(file_name, ContentFile(img_response.content), save=False)
                    print("  Profile picture updated.")
                else:
                    print(f"  Failed to download image: {img_response.status_code}")
            else:
                print("  Could not get image URL.")
                
        except Exception as e:
            print(f"  Error setting profile pic: {e}")

        # 2. Banner Image (Keep random abstract/landscape, or maybe specific?)
        # User only asked for "profile image" to be gender/indian specific. 
        # "add random profile image and banner... if the name is male then add male image"
        # I'll keep the banner random abstract/nature as before, or maybe office/tech related?
        # Let's stick to picsum for banners but maybe add a 'tech' or 'office' keyword if possible, 
        # but picsum is just random. Let's leave banners as is or re-generate them to be fresh.
        try:
            if not user.banner_image: # Only if missing, or should we update all? User said "add... to every person".
                # Let's update all to be safe and fresh.
                print("  Downloading banner image...")
                # Using a seed based on user_id ensures consistency
                response = requests.get(f'https://picsum.photos/seed/{user.user_id}/800/200')
                if response.status_code == 200:
                    file_name = f"banner_{user.user_id}.jpg"
                    user.banner_image.save(file_name, ContentFile(response.content), save=False)
                    print("  Banner updated.")
                else:
                    print(f"  Failed to download banner: {response.status_code}")
        except Exception as e:
            print(f"  Error setting banner: {e}")

        user.save()
        print("  User saved.\n")
        # Be nice to the APIs
        time.sleep(0.5)

if __name__ == '__main__':
    print("Starting Indian image population...")
    try:
        populate_images()
        print("Done!")
    except Exception as e:
        print(f"An error occurred: {e}")
