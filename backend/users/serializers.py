from rest_framework import serializers
from .models import User, Education, Certification, Predictionhistory, Skill, JobPlacement

# 1. Serializer for Education Data
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['education_id', 'degree', 'specialization', 'university', 'cgpa', 'year_of_completion']

# 2. Serializer for Certification Data
class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['cert_id', 'cert_name', 'issuing_organization', 'issue_date']

# 3. Serializer for Prediction History
class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Predictionhistory
        fields = ['predicted_roles', 'confidence_scores', 'timestamp']

# 4. Serializer for Skills
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['skill_id', 'skill_name']

# 5. Serializer for Job Placement
class JobPlacementSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPlacement
        fields = ['placement_id', 'role', 'company', 'placement_type', 'date_of_joining']

# 6. Main User Serializer (Combines everything)
class UserSerializer(serializers.ModelSerializer):
    # This fetches the related data automatically!
    # Note: 'education_set' is the default name Django gives to the reverse link
    education = EducationSerializer(many=True, source='education_set', read_only=True)
    certifications = CertificationSerializer(many=True, source='certification_set', read_only=True)
    predictions = PredictionSerializer(many=True, source='predictionhistory_set', read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    placements = JobPlacementSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'role', 'education', 'certifications', 'predictions', 'skills', 'placements', 'profile_picture', 'banner_image']