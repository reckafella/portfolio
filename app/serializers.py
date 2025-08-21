from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    """ Serializer for the Message Model """
    class Meta:
        model = Message
        fields = ('id', 'name', 'subject', 'email',
                  'message', 'created_at', 'is_read')
        read_only_fields = ('id', 'created_at', 'is_read')
