from rest_framework import serializers
from .models import User, Education, Certification, Predictionhistory, Skill, JobPlacement, SupportTicket, TicketChat, Notification, ChatReport, Message

# 1. Serializer for Education Data
from .utils import EncryptionUtil
import re
import datetime

# 1. Serializer for Education Data
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['education_id', 'degree', 'specialization', 'university', 'cgpa', 'year_of_completion']

    def validate_cgpa(self, value):
        """
        Validate CGPA is within 0-10 or 0-100.
        Note: Value comes in as string from frontend or already string from CharField definition,
        but since we changed model to CharField, DRF might treat input as string.
        """
        try:
            val_float = float(value)
        except ValueError:
            raise serializers.ValidationError("CGPA must be a valid number.")
        
        if not (0 <= val_float <= 100):
             raise serializers.ValidationError("CGPA must be between 0 and 100.")
        return value

    def validate_year_of_completion(self, value):
        current_year = datetime.datetime.now().year
        if not (1950 <= value <= current_year + 10):
            raise serializers.ValidationError(f"Year of completion must be between 1950 and {current_year + 10}.")
        return value

    def to_representation(self, instance):
        """
        Decrypt data when sending to frontend.
        """
        ret = super().to_representation(instance)
        # Decrypt sensitive fields
        ret['cgpa'] = EncryptionUtil.decrypt(ret['cgpa'])
        ret['university'] = EncryptionUtil.decrypt(ret['university'])
        ret['specialization'] = EncryptionUtil.decrypt(ret['specialization'])
        # degree is not encrypted per plan, but let's stick to the plan (only cgpa, univ, spec mentioned)
        return ret

    def create(self, validated_data):
        """
        Encrypt data before saving.
        """
        try:
            # Encrypt sensitive fields
            if 'cgpa' in validated_data:
                validated_data['cgpa'] = EncryptionUtil.encrypt(validated_data['cgpa'])
            if 'university' in validated_data:
                validated_data['university'] = EncryptionUtil.encrypt(validated_data['university'])
            if 'specialization' in validated_data:
                validated_data['specialization'] = EncryptionUtil.encrypt(validated_data['specialization'])
                
            return super().create(validated_data)
        except Exception as e:
            with open('debug_errors.log', 'a') as f:
                import traceback
                f.write(f"\nError in Education Create: {e}\n")
                f.write(traceback.format_exc())
            raise e

    def update(self, instance, validated_data):
        """
        Encrypt data before updating.
        """
        if 'cgpa' in validated_data:
            validated_data['cgpa'] = EncryptionUtil.encrypt(validated_data['cgpa'])
        if 'university' in validated_data:
            validated_data['university'] = EncryptionUtil.encrypt(validated_data['university'])
        if 'specialization' in validated_data:
            validated_data['specialization'] = EncryptionUtil.encrypt(validated_data['specialization'])
            
        return super().update(instance, validated_data)

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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        def parse_field(value):
            if isinstance(value, str):
                import json
                import ast
                # 1. Try JSON (handling single quotes check first)
                try:
                    # If it starts with [ and contains ', try replacing ' with " ONLY if not part of a word?
                    # The simple replace("'", '"') is risky for "Developer's". 
                    # Let's try ast.literal_eval first for Python list strings, it is safer for ['a', 'b']
                    return ast.literal_eval(value)
                except:
                    pass

                try:
                    return json.loads(value)
                except:
                    pass
                
                try:
                     # Attempt to fix single quotes for JSON if ast failed
                     return json.loads(value.replace("'", '"'))
                except:
                    pass

                # 2. If it is a plain string but not a list representation
                if value.strip() and not value.strip().startswith('['):
                    return [value.strip()]
                
                # 3. If it starts with [ but failed parsing, return empty or raw?
                # Let's return raw string if we can't parse, but better to return empty list to avoid frontend crash
                return [] 
            return value

        ret['predicted_roles'] = parse_field(ret['predicted_roles'])
        
        # confidence scores might be dict or list
        # For simplicity, let's just try to parse it, if plain string return as is or in list?
        # Confidence scores are complex. Let's just try basic parse.
        cs = ret['confidence_scores']
        if isinstance(cs, str):
            try:
                import ast
                ret['confidence_scores'] = ast.literal_eval(cs)
            except:
                try:
                     import json
                     ret['confidence_scores'] = json.loads(cs.replace("'", '"'))
                except:
                     pass

        return ret

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

# 6. Serializer for Support Tickets
class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ['ticket_id', 'subject', 'message', 'status', 'created_at']
        read_only_fields = ['created_at']

# 7. Chat and Notification Serializers


class TicketChatSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = TicketChat
        fields = ['chat_id', 'ticket', 'sender', 'sender_name', 'sender_role', 'message', 'attachment', 'timestamp', 'is_read']
        read_only_fields = ['timestamp', 'sender', 'ticket']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['notification_id', 'message', 'is_read', 'created_at', 'type']
        read_only_fields = ['created_at']

# 6. Main User Serializer (Combines everything)
class UserSerializer(serializers.ModelSerializer):
    # This fetches the related data automatically!
    # Note: 'education_set' is the default name Django gives to the reverse link
    education = EducationSerializer(many=True, source='education_set', read_only=True)
    certifications = CertificationSerializer(many=True, source='certification_set', read_only=True)
    predictions = PredictionSerializer(many=True, source='predictionhistory_set', read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    placements = JobPlacementSerializer(many=True, read_only=True)
    # Assuming we might want to send unread notifications count or something, but let's keep it simple for now


    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'role', 'education', 'certifications', 'predictions', 'skills', 'placements', 'profile_picture', 'banner_image', 'about_me']

class ChatReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.name', read_only=True)
    chat_message_content = serializers.CharField(source='chat_message.message', read_only=True)

    class Meta:
        model = ChatReport
        fields = ['report_id', 'reported_by', 'reported_by_name', 'chat_message', 'chat_message_content', 'reason', 'timestamp', 'status']
        read_only_fields = ['timestamp']

        read_only_fields = ['timestamp']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.name', read_only=True)
    sender_profile_picture = serializers.ImageField(source='sender.profile_picture', read_only=True)

    class Meta:
        model = Message
        fields = ['message_id', 'sender', 'recipient', 'sender_name', 'recipient_name', 'sender_profile_picture', 'content', 'attachment', 'timestamp', 'is_read']
        read_only_fields = ['timestamp', 'is_read', 'sender']
