from rest_framework import serializers
from app.models import Profile, Education, Experience, Skill


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating profile information"""
    
    class Meta:
        model = Profile
        fields = ['name', 'title', 'location', 'email', 'phone', 'summary']
        extra_kwargs = {
            'name': {'required': True},
            'title': {'required': True}, 
            'location': {'required': True},
            'email': {'required': True},
            'phone': {'required': False},
            'summary': {'required': True}
        }

    def validate_email(self, value):
        """Validate email format"""
        if not value or '@' not in value:
            raise serializers.ValidationError("Please enter a valid email address.")
        return value

    def validate_summary(self, value):
        """Validate summary length"""
        if len(value.strip()) < 50:
            raise serializers.ValidationError("Summary must be at least 50 characters long.")
        return value


class EducationSerializer(serializers.ModelSerializer):
    """Serializer for education entries"""
    period = serializers.ReadOnlyField()  # Computed from start_date, end_date, is_current
    
    class Meta:
        model = Education
        fields = ['id', 'degree', 'start_date', 'end_date', 'is_current', 'period', 'institution', 'description', 'order', 'is_active']
        extra_kwargs = {
            'degree': {'required': True},
            'start_date': {'required': True},
            'end_date': {'required': False},
            'is_current': {'required': False},
            'institution': {'required': True},
            'description': {'required': True},
            'order': {'required': False},
            'is_active': {'required': False}
        }

    def validate_degree(self, value):
        """Validate degree field"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Degree name must be at least 3 characters long.")
        return value

    def validate_institution(self, value):
        """Validate institution field"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Institution name must be at least 3 characters long.")
        return value

    def validate_description(self, value):
        """Validate description field"""
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Description must be at least 20 characters long.")
        return value


class ExperienceSerializer(serializers.ModelSerializer):
    """Serializer for experience entries"""
    period = serializers.ReadOnlyField()  # Computed from start_date, end_date, is_current
    
    class Meta:
        model = Experience
        fields = ['id', 'title', 'start_date', 'end_date', 'is_current', 'period', 'company', 'icon_type', 'responsibilities', 'order', 'is_active']
        extra_kwargs = {
            'title': {'required': True},
            'start_date': {'required': True},
            'end_date': {'required': False},
            'is_current': {'required': False},
            'company': {'required': True},
            'icon_type': {'required': False},
            'responsibilities': {'required': True},
            'order': {'required': False},
            'is_active': {'required': False}
        }

    def validate_title(self, value):
        """Validate job title"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Job title must be at least 3 characters long.")
        return value

    def validate_company(self, value):
        """Validate company name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long.")
        return value

    def validate_responsibilities(self, value):
        """Validate responsibilities array"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Responsibilities must be a list.")
        
        if len(value) < 1:
            raise serializers.ValidationError("At least one responsibility is required.")
        
        for responsibility in value:
            if not isinstance(responsibility, str) or len(responsibility.strip()) < 10:
                raise serializers.ValidationError("Each responsibility must be at least 10 characters long.")
        
        return value


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for skill entries"""
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'proficiency_level', 'order', 'is_active']
        extra_kwargs = {
            'name': {'required': True},
            'category': {'required': False},
            'proficiency_level': {'required': False},
            'order': {'required': False},
            'is_active': {'required': False}
        }

    def validate_name(self, value):
        """Validate skill name"""
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Skill name cannot be empty.")
        return value

    def validate_proficiency_level(self, value):
        """Validate proficiency level"""
        if value not in [1, 2, 3, 4]:
            raise serializers.ValidationError("Proficiency level must be between 1 and 4.")
        return value


class BulkSkillsSerializer(serializers.Serializer):
    """Serializer for bulk skill operations"""
    skills = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        help_text="List of skill names"
    )
    category = serializers.CharField(
        max_length=100, 
        required=False, 
        default="Technical Skills"
    )
    proficiency_level = serializers.IntegerField(
        min_value=1, 
        max_value=4, 
        required=False, 
        default=3
    )

    def validate_skills(self, value):
        """Validate skills list"""
        cleaned_skills = []
        for skill in value:
            if len(skill.strip()) < 1:
                raise serializers.ValidationError("Each skill name must be at least 1 character long.")
            cleaned_skills.append(skill.strip())
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(cleaned_skills))
