from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework.permissions import AllowAny

from app.models import Profile, Education, Experience, Skill
from app.api.serializers.about_serializer import (
    AboutPageSerializer, ProfileUpdateSerializer, EducationSerializer,
    ExperienceSerializer, SkillSerializer, BulkSkillsSerializer
)


class AboutPageAPIView(APIView):
    """API view for the About page data"""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """Handle GET request to retrieve about page data"""
        serializer = AboutPageSerializer()
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileUpdateView(APIView):
    """Update profile information"""
    permission_classes = [IsAuthenticated]

    def put(self, request):
        """Update profile data"""
        try:
            # Get or create profile (singleton)
            profile = Profile.objects.first()
            if not profile:
                profile = Profile()

            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=False)
            if serializer.is_valid():
                profile = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Profile updated successfully',
                    'data': {
                        'name': profile.name,
                        'title': profile.title,
                        'location': profile.location,
                        'email': profile.email,
                        'phone': profile.phone,
                        'summary': profile.summary
                    }
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error updating profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request):
        """Partially update profile data"""
        try:
            profile = Profile.objects.first()
            if not profile:
                return Response({
                    'success': False,
                    'message': 'Profile not found'
                }, status=status.HTTP_404_NOT_FOUND)

            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                profile = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Profile updated successfully',
                    'data': {
                        'name': profile.name,
                        'title': profile.title,
                        'location': profile.location,
                        'email': profile.email,
                        'phone': profile.phone,
                        'summary': profile.summary
                    }
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error updating profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EducationListCreateView(APIView):
    """List and create education entries"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all education entries"""
        education = Education.objects.filter(is_active=True).order_by('order', '-created_at')
        serializer = EducationSerializer(education, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def post(self, request):
        """Create new education entry"""
        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            education = serializer.save()
            return Response({
                'success': True,
                'message': 'Education entry created successfully',
                'data': EducationSerializer(education).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class EducationDetailView(APIView):
    """Retrieve, update and delete education entries"""
    permission_classes = [IsAuthenticated]

    def get(self, request, education_id):
        """Get specific education entry"""
        education = get_object_or_404(Education, id=education_id)
        serializer = EducationSerializer(education)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def put(self, request, education_id):
        """Update education entry"""
        education = get_object_or_404(Education, id=education_id)
        serializer = EducationSerializer(education, data=request.data)
        if serializer.is_valid():
            education = serializer.save()
            return Response({
                'success': True,
                'message': 'Education entry updated successfully',
                'data': EducationSerializer(education).data
            })
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, education_id):
        """Delete education entry"""
        education = get_object_or_404(Education, id=education_id)
        education.delete()
        return Response({
            'success': True,
            'message': 'Education entry deleted successfully'
        })


class ExperienceListCreateView(APIView):
    """List and create experience entries"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all experience entries"""
        experience = Experience.objects.filter(is_active=True).order_by('order', '-created_at')
        serializer = ExperienceSerializer(experience, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def post(self, request):
        """Create new experience entry"""
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            experience = serializer.save()
            return Response({
                'success': True,
                'message': 'Experience entry created successfully',
                'data': ExperienceSerializer(experience).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class ExperienceDetailView(APIView):
    """Retrieve, update and delete experience entries"""
    permission_classes = [IsAuthenticated]

    def get(self, request, experience_id):
        """Get specific experience entry"""
        experience = get_object_or_404(Experience, id=experience_id)
        serializer = ExperienceSerializer(experience)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def put(self, request, experience_id):
        """Update experience entry"""
        experience = get_object_or_404(Experience, id=experience_id)
        serializer = ExperienceSerializer(experience, data=request.data)
        if serializer.is_valid():
            experience = serializer.save()
            return Response({
                'success': True,
                'message': 'Experience entry updated successfully',
                'data': ExperienceSerializer(experience).data
            })
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, experience_id):
        """Delete experience entry"""
        experience = get_object_or_404(Experience, id=experience_id)
        experience.delete()
        return Response({
            'success': True,
            'message': 'Experience entry deleted successfully'
        })


class SkillsListCreateView(APIView):
    """List and create skill entries"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all skills"""
        skills = Skill.objects.filter(is_active=True).order_by('order', 'name')
        serializer = SkillSerializer(skills, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def post(self, request):
        """Create new skill"""
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            skill = serializer.save()
            return Response({
                'success': True,
                'message': 'Skill created successfully',
                'data': SkillSerializer(skill).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


class SkillDetailView(APIView):
    """Retrieve, update and delete skill entries"""
    permission_classes = [IsAuthenticated]

    def get(self, request, skill_id):
        """Get specific skill"""
        skill = get_object_or_404(Skill, id=skill_id)
        serializer = SkillSerializer(skill)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def put(self, request, skill_id):
        """Update skill"""
        skill = get_object_or_404(Skill, id=skill_id)
        serializer = SkillSerializer(skill, data=request.data)
        if serializer.is_valid():
            skill = serializer.save()
            return Response({
                'success': True,
                'message': 'Skill updated successfully',
                'data': SkillSerializer(skill).data
            })
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, skill_id):
        """Delete skill"""
        skill = get_object_or_404(Skill, id=skill_id)
        skill.delete()
        return Response({
            'success': True,
            'message': 'Skill deleted successfully'
        })


class BulkSkillsView(APIView):
    """Bulk operations for skills"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Bulk create/update skills"""
        serializer = BulkSkillsSerializer(data=request.data)
        if serializer.is_valid():
            skills_data = serializer.validated_data
            created_skills = []

            with transaction.atomic():
                for i, skill_name in enumerate(skills_data['skills']):
                    skill, created = Skill.objects.get_or_create(
                        name=skill_name,
                        defaults={
                            'category': skills_data.get('category', 'Technical Skills'),
                            'proficiency_level': skills_data.get('proficiency_level', 3),
                            'order': i,
                            'is_active': True
                        }
                    )
                    if created:
                        created_skills.append(skill)
                    else:
                        # Update existing skill
                        skill.category = skills_data.get('category', skill.category)
                        skill.proficiency_level = skills_data.get('proficiency_level', skill.proficiency_level)
                        skill.is_active = True
                        skill.save()
                        created_skills.append(skill)

            return Response({
                'success': True,
                'message': f'Successfully processed {len(created_skills)} skills',
                'data': SkillSerializer(created_skills, many=True).data
            })
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_items(request):
    """Reorder education, experience, or skills"""
    try:
        item_type = request.data.get('type')  # 'education', 'experience', 'skills'
        items = request.data.get('items')  # [{'id': 1, 'order': 0}, ...]

        if not item_type or not items:
            return Response({
                'success': False,
                'message': 'Type and items are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        model_map = {
            'education': Education,
            'experience': Experience,
            'skills': Skill
        }

        if item_type not in model_map:
            return Response({
                'success': False,
                'message': 'Invalid item type'
            }, status=status.HTTP_400_BAD_REQUEST)

        Model = model_map[item_type]

        with transaction.atomic():
            for item in items:
                Model.objects.filter(id=item['id']).update(order=item['order'])

        return Response({
            'success': True,
            'message': f'{item_type.title()} items reordered successfully'
        })

    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error reordering items: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
