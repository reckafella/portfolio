from rest_framework import serializers
from app.models import Profile, Education, Experience, Skill


class AboutPageSerializer(serializers.Serializer):
    """Serializer for the About page data - now database-driven"""

    @property
    def data(self):
        """Return about page data from database"""
        profile_data = self.get_profile_data()
        education_data = self.get_education_data()
        skills_data = self.get_skills_data()
        experience_data = self.get_experience_data()

        # Combine all data
        return {
            **profile_data,
            "education": education_data,
            "skills": skills_data,
            "experience": experience_data
        }

    def get_education_data(self):
        education_data = []
        # Get education data
        try:
            education_queryset = Education.objects.filter(is_active=True).order_by('order', '-created_at')
            for edu in education_queryset:
                education_data.append({
                    "id": edu.id,  # Include ID for updates
                    "degree": edu.degree,
                    "start_date": edu.start_date.isoformat(),
                    "end_date": edu.end_date.isoformat() if edu.end_date else None,
                    "is_current": edu.is_current,
                    "period": edu.period,
                    "institution": edu.institution,
                    "description": edu.description
                })
        except Exception:
            education_data = []
        return education_data

    def get_skills_data(self):
        # Get skills data
        skills_data = []
        try:
            skills_queryset = Skill.objects.filter(is_active=True).order_by('order', 'name')
            skills_data = [skill.name for skill in skills_queryset]
        except Exception:
            skills_data = []
        return skills_data

    def get_profile_data(self):
        # Get profile data (singleton)
        try:
            profile = Profile.objects.first()
            if not profile:
                # Fallback to default values if no profile exists
                profile_data = {
                    "name": "Ethan Wanyoike",
                    "title": "Software Engineer",
                    "location": "Nairobi, Kenya",
                    "email": "ethanmuthoni@gmail.com",
                    "summary": (
                        "A software engineer with a passion for building scalable applications and improving user "
                        "experiences. Experienced in both frontend and backend development, and always eager to "
                        "learn new technologies and improve my skills."
                    )
                }
            else:
                profile_data = {
                    "name": profile.name,
                    "title": profile.title,
                    "location": profile.location,
                    "email": profile.email,
                    "summary": profile.summary
                }
        except Exception:
            # Fallback for any database errors
            profile_data = {
                "name": "Ethan Wanyoike",
                "title": "Software Engineer",
                "location": "Nairobi, Kenya",
                "email": "ethanmuthoni@gmail.com",
                "summary": "A software engineer with a passion for building scalable applications."
            }
        return profile_data

    def get_experience_data(self):
        # Get experience data
        try:
            experience_queryset = Experience.objects.filter(is_active=True).order_by('order', '-created_at')
            experience_data = []
            for exp in experience_queryset:
                experience_data.append({
                    "id": exp.id,  # Include ID for updates
                    "title": exp.title,
                    "start_date": exp.start_date.isoformat(),
                    "end_date": exp.end_date.isoformat() if exp.end_date else None,
                    "is_current": exp.is_current,
                    "period": exp.period,
                    "company": exp.company,
                    "type": exp.icon_type,
                    "responsibilities": exp.responsibilities
                })
        except Exception:
            experience_data = []
        return experience_data


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
    period = serializers.ReadOnlyField()

    class Meta:
        model = Experience
        fields = ['id', 'title', 'start_date', 'end_date', 'is_current',
                  'period', 'company', 'icon_type', 'responsibilities',
                  'order', 'is_active']
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
            raise serializers.ValidationError(
                "Job title must be at least 3 characters long.")
        return value

    def validate_company(self, value):
        """Validate company name"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Company name must be at least 2 characters long.")
        return value

    def validate_responsibilities(self, value):
        """Validate responsibilities array"""
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Responsibilities must be a list.")

        if len(value) < 1:
            raise serializers.ValidationError(
                "At least one responsibility is required.")

        for resp in value:
            if not isinstance(resp, str) or len(resp.strip()) < 10:
                raise serializers.ValidationError(
                    "Each responsibility must be at least 10 characters long.")

        return value


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for skill entries"""

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'proficiency_level',
                  'order', 'is_active']
        extra_kwargs = {
            'name': {'required': True}, 'category': {'required': False},
            'order': {'required': False}, 'is_active': {'required': False},
            'proficiency_level': {'required': False}
        }

    def validate_name(self, value):
        """Validate skill name"""
        if len(value.strip()) < 1:
            raise serializers.ValidationError("Skill name cannot be empty.")
        return value

    def validate_proficiency_level(self, value):
        """Validate proficiency level"""
        if value not in [1, 2, 3, 4]:
            raise serializers.ValidationError(
                "Proficiency level must be between 1 and 4.")
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
                raise serializers.ValidationError(
                    "Each skill name must be at least 1 character long.")
            cleaned_skills.append(skill.strip())

        # Remove duplicates while preserving order
        return list(dict.fromkeys(cleaned_skills))
