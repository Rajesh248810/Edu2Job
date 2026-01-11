
from cryptography.fernet import Fernet
import os
import base64

# Copy of the class from utils.py to test in isolation
class EncryptionUtil:
    _key = b'6Qd8f2g4h5j6k7l8m9n0p1q2r3s4t5u6v7w8x9y0z1a='

    @staticmethod
    def get_cipher_suite():
        try:
            return Fernet(EncryptionUtil._key)
        except Exception as e:
            print(f"Encryption Key Error: {e}")
            raise e

try:
    print(f"Testing key: {EncryptionUtil._key}")
    suite = EncryptionUtil.get_cipher_suite()
    print("Cipher suite created successfully.")
    enc = suite.encrypt(b"test")
    print(f"Encrypted: {enc}")
except Exception as e:
    print(f"FAIL: {e}")
