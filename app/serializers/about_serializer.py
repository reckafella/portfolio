from rest_framework import serializers
from app.models import Profile, Education, Experience, Skill


class AboutPageSerializer(serializers.Serializer):
    """Serializer for the About page data - now database-driven"""
    
    @property
    def data(self):
        """Return about page data from database"""
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

        # Get education data
        try:
            education_queryset = Education.objects.filter(is_active=True).order_by('order', '-created_at')
            education_data = []
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

        # Get skills data
        try:
            skills_queryset = Skill.objects.filter(is_active=True).order_by('order', 'name')
            skills_data = [skill.name for skill in skills_queryset]
        except Exception:
            skills_data = []

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

        # Combine all data
        return {
            **profile_data,
            "education": education_data,
            "skills": skills_data,
            "experience": experience_data
        }
