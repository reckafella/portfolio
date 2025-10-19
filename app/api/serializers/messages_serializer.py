"""
Serializers for message inbox
"""
from rest_framework import serializers
from app.models import Message


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model
    """
    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        """
        Customize the output representation
        """
        data = super().to_representation(instance)

        # Add a preview of the message (first 100 characters)
        if data.get('message'):
            data['message_preview'] = data['message'][:100] + '...' if len(data['message']) > 100 else data['message']

        return data
