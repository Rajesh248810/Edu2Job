#!/usr/bin/env python
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Setup Django
django.setup()

from users.models import Education
from users.utils import EncryptionUtil

def test_encryption():
    print("Testing encryption/decryption:")
    test_data = "Test University"
    encrypted = EncryptionUtil.encrypt(test_data)
    decrypted = EncryptionUtil.decrypt(encrypted)
    print(f"Original: {test_data}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
    print(f"Round-trip success: {test_data == decrypted}")
    print()

def show_encrypted_data():
    educations = Education.objects.all()
    print(f"Total education records: {educations.count()}")
    print("\nChecking if any data is actually encrypted:")

    encrypted_count = 0
    for edu in educations:
        try:
            # Try to decrypt - if it succeeds and gives different result, it's encrypted
            decrypted_spec = EncryptionUtil.decrypt(edu.specialization)
            if decrypted_spec != edu.specialization:
                encrypted_count += 1
                print(f"Found encrypted data in record {edu.education_id}:")
                print(f"  Specialization (raw): '{edu.specialization}'")
                print(f"  Specialization (decrypted): '{decrypted_spec}'")
                break
        except:
            pass

    if encrypted_count == 0:
        print("No encrypted data found. All data appears to be stored in plain text.")
        print("This suggests data was inserted before encryption was implemented.")

if __name__ == "__main__":
    test_encryption()
    show_encrypted_data()