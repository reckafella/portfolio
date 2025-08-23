from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.core.paginator import Paginator
from django.conf import settings

from ..models import Projects, Image, Video
from ..serializers import ProjectSerializer, ProjectCreateSerializer, ImageSerializer, VideoSerializer
from ..permissions import IsStaffOrReadOnly, IsAuthenticatedStaff


class ProjectListAPIView(generics.ListAPIView):
    """
    API endpoint for listing projects with filtering and pagination
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Projects.objects.filter(live=True).select_related().prefetch_related('images', 'videos')

        # Filtering
        category = self.request.query_params.get('category', None)
        project_type = self.request.query_params.get('project_type', None)
        client = self.request.query_params.get('client', None)
        search = self.request.query_params.get('q', None)

        if category and category != 'all':
            queryset = queryset.filter(category=category)

        if project_type and project_type != 'all':
            queryset = queryset.filter(project_type=project_type)

        if client and client != 'all':
            queryset = queryset.filter(client=client)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(client__icontains=search)
            )

        # Sorting
        sort_by = self.request.query_params.get('sort_by', '-created_at')
        if sort_by in ['-created_at', 'created_at', 'title', '-title', 'category', '-category']:
            queryset = queryset.order_by(sort_by)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Pagination
        page_size = int(request.query_params.get('page_size', 12))
        paginator = Paginator(queryset, page_size)
        page_number = request.query_params.get('page', 1)
        page_obj = paginator.get_page(page_number)

        serializer = self.get_serializer(page_obj, many=True)

        return Response({
            'results': serializer.data,
            'pagination': {
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'current_page': page_obj.number,
                'has_next': page_obj.has_next(),
                'has_previous': page_obj.has_previous(),
                'next_page_number': page_obj.next_page_number() if page_obj.has_next() else None,
                'previous_page_number': page_obj.previous_page_number() if page_obj.has_previous() else None,
            },
            'filters': {
                'categories': list(Projects.objects.values_list('category', flat=True).distinct()),
                'project_types': [choice[0] for choice in Projects.PROJECT_TYPES],
                'clients': list(Projects.objects.values_list('client', flat=True).distinct()),
            }
        })


class ProjectDetailAPIView(generics.RetrieveAPIView):
    """
    API endpoint for retrieving a single project
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        return Projects.objects.filter(live=True).select_related().prefetch_related('images', 'videos')


class ProjectCreateAPIView(generics.CreateAPIView):
    """
    API endpoint for creating new projects (Staff only)
    """
    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticatedStaff]

    def perform_create(self, serializer):
        serializer.save()


class ProjectUpdateAPIView(generics.UpdateAPIView):
    """
    API endpoint for updating projects (Staff only)
    """
    serializer_class = ProjectCreateSerializer
    permission_classes = [IsAuthenticatedStaff]
    lookup_field = 'slug'

    def get_queryset(self):
        return Projects.objects.all()


class ProjectDeleteAPIView(generics.DestroyAPIView):
    """
    API endpoint for deleting projects (Staff only)
    """
    permission_classes = [IsAuthenticatedStaff]
    lookup_field = 'slug'

    def get_queryset(self):
        return Projects.objects.all()


@api_view(['GET'])
def project_form_config(request):
    """
    API endpoint to get project form configuration
    """
    return Response({
        "form_title": "Add New Project",
        "form_description": "Create a new project to showcase in your portfolio",
        "submit_text": "Create Project",
        "fields": [
            {
                "name": "title",
                "label": "Project Title",
                "type": "text",
                "required": True,
                "placeholder": "Enter a descriptive title for your project",
                "help_text": "A clear, concise title that describes your project",
                "max_length": 200,
                "widget": {
                    "type": "TextInput",
                    "attrs": {"class": "form-control"}
                }
            },
            {
                "name": "description",
                "label": "Description",
                "type": "textarea",
                "required": True,
                "placeholder": "Provide a detailed description of the project...",
                "help_text": "Describe what the project does, technologies used, and key features",
                "max_length": 2000,
                "widget": {
                    "type": "Textarea",
                    "attrs": {"class": "form-control", "rows": 6}
                }
            },
            {
                "name": "project_type",
                "label": "Project Type",
                "type": "select",
                "required": True,
                "help_text": "Select the type of project",
                "choices": list(Projects.PROJECT_TYPES),
                "widget": {
                    "type": "Select",
                    "attrs": {"class": "form-select"}
                }
            },
            {
                "name": "category",
                "label": "Category",
                "type": "select",
                "required": True,
                "help_text": "Choose the project category",
                "choices": list(Projects.CATEGORY_CHOICES),
                "widget": {
                    "type": "Select",
                    "attrs": {"class": "form-select"}
                }
            },
            {
                "name": "client",
                "label": "Client",
                "type": "text",
                "required": False,
                "placeholder": "Client name (optional)",
                "help_text": "Client name for commissioned work (leave blank for personal projects)",
                "max_length": 200,
                "widget": {
                    "type": "TextInput",
                    "attrs": {"class": "form-control"}
                }
            },
            {
                "name": "project_url",
                "label": "Project URL",
                "type": "url",
                "required": False,
                "placeholder": "https://example.com",
                "help_text": "Link to the live project (optional)",
                "widget": {
                    "type": "URLInput",
                    "attrs": {"class": "form-control"}
                }
            },
            {
                "name": "live",
                "label": "Make Live",
                "type": "checkbox",
                "required": False,
                "help_text": "Check to make this project visible to the public",
                "widget": {
                    "type": "CheckboxInput",
                    "attrs": {"class": "form-check-input"}
                }
            }
        ]
    })


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for full CRUD operations on projects
    """
    queryset = Projects.objects.filter(live=True).select_related().prefetch_related('images', 'videos')
    serializer_class = ProjectSerializer
    permission_classes = [IsStaffOrReadOnly]
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateSerializer
        return ProjectSerializer

    def get_queryset(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            # For modification actions, allow access to all projects if authenticated
            if self.request.user.is_authenticated:
                return Projects.objects.all()
        return Projects.objects.filter(live=True)
