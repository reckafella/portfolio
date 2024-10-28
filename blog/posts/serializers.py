from rest_framework import serializers
from ..models import Post

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    cover_image_url = serializers.CharField(source='cover_image.url', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'content_html', 'cover_image',
            'cover_image_url', 'author_name', 'created_at', 'updated_at',
            'published', 'slug'
        ]
        read_only_fields = ['content_html', 'author_name', 'cover_image_url']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)