from django.test import SimpleTestCase
from users.utils import EncryptionUtil
from users.serializers import EducationSerializer
from users.models import User, Education
from unittest.mock import MagicMock, patch

class SecurityValidationTests(SimpleTestCase):
    def test_encryption_decryption(self):
        original_text = "3.85"
        encrypted = EncryptionUtil.encrypt(original_text)
        self.assertNotEqual(original_text, encrypted)
        decrypted = EncryptionUtil.decrypt(encrypted)
        self.assertEqual(original_text, decrypted)

    def test_education_validation_valid(self):
        data = {
            'degree': 'B.Tech',
            'specialization': 'CSE',
            'university': 'Test Univ',
            'cgpa': '8.5',
            'year_of_completion': 2024
        }
        serializer = EducationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_education_validation_invalid_cgpa(self):
        data = {
            'degree': 'B.Tech',
            'specialization': 'CSE',
            'university': 'Test Univ',
            'cgpa': '150', # Invalid
            'year_of_completion': 2024
        }
        serializer = EducationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('cgpa', serializer.errors)

    def test_education_validation_invalid_year(self):
        data = {
            'degree': 'B.Tech',
            'specialization': 'CSE',
            'university': 'Test Univ',
            'cgpa': '8.5',
            'year_of_completion': 1900 # Invalid
        }
        serializer = EducationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('year_of_completion', serializer.errors)

    @patch('users.serializers.EducationSerializer.save')
    def test_encryption_logic_in_create(self, mock_save):
        """
        Verify that create method encrypts data.
        Since we can't easily mock the internal create call of ModelSerializer without DB,
        we will test the 'create' method logic directly by instantiating Serializer and calling create manually
        checking what it returns/calls.
        Actually, ModelSerializer.create calls Model.objects.create.
        We can patch Education.objects.create? No, because SimpleTestCase disallows DB access.
        
        Alternative: We verify that the serializer's `create` method modifies the data passed to super().create.
        But super().create does the DB save.
        
        Let's rely on patching the 'create' method of the serializer? No, we are testing it.
        
        Let's patch 'users.serializers.super' ... hard.
        
        Easier: Patch 'users.serializers.EncryptionUtil.encrypt'.
        And Mock 'users.models.Education.objects.create' ? 
        BUT creating Model instance might hit DB validation.
        
        Let's try to verify via 'validate' or just assume if 'encrypt' is called, it works.
        
        Actually, we can test 'to_representation' easily.
        """
        # Test to_representation (Decryption)
        # Mock an Education instance
        mock_edu = MagicMock(spec=Education)
        mock_edu.cgpa = EncryptionUtil.encrypt('9.5')
        mock_edu.university = EncryptionUtil.encrypt('Encrypted Univ')
        mock_edu.specialization = EncryptionUtil.encrypt('Encrypted Spec')
        mock_edu.degree = 'B.Tech'
        mock_edu.year_of_completion = 2023
        mock_edu.education_id = 1
        
        serializer = EducationSerializer()
        data = serializer.to_representation(mock_edu)
        
        self.assertEqual(data['cgpa'], '9.5')
        self.assertEqual(data['university'], 'Encrypted Univ')
        self.assertEqual(data['specialization'], 'Encrypted Spec')

    def test_encryption_call_on_create(self):
         """
         Test that valid data would be encrypted.
         We will manually call the create method of the serializer, BUT we must mock the model saving part.
         """
         data = {
            'degree': 'B.Tech',
            'specialization': 'CSE',
            'university': 'Test Univ',
            'cgpa': '9.0',
            'year_of_completion': 2024
         }
         
         # We want to check if `encrypt` is called with '9.0'.
         with patch('users.serializers.EncryptionUtil.encrypt', side_effect=lambda x: f"ENC_{x}") as mock_encrypt:
             with patch('users.serializers.serializers.ModelSerializer.create') as mock_super_create:
                 # Setup return value so it doesn't crash
                 mock_super_create.return_value = MagicMock()
                 
                 serializer = EducationSerializer()
                 serializer.create(data)
                 
                 # Verify encrypt called
                 self.assertTrue(mock_encrypt.called)
                 # Check arguments
                 # We expect 3 calls (cgpa, univ, spec)
                 # Check if called for cgpa
                 calls = [c[0][0] for c in mock_encrypt.call_args_list]
                 self.assertIn('9.0', calls)
                 self.assertIn('Test Univ', calls)
                 self.assertIn('CSE', calls)
                 
                 # Verify super().create was called with ENCRYPTED data
                 # The 'data' dictionary passed to create should be modified in place or a new one passed.
                 # Our implementation modifies validated_data.
                 args, _ = mock_super_create.call_args
                 passed_data = args[0]
                 self.assertEqual(passed_data['cgpa'], 'ENC_9.0')
                 self.assertEqual(passed_data['university'], 'ENC_Test Univ')

