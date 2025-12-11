from rest_framework import serializers
from .models import ScheduledEvent, Course, Room
from django.contrib.auth import get_user_model

User = get_user_model()

class ScheduledEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledEvent
        fields = "__all__"
        read_only_fields = ["status"]
    
    def validate_tutor(self, value):
        """Ensure tutor has the tutor role"""
        if value.role != "tutor":
            raise serializers.ValidationError(f"User must have tutor role, but has {value.role} role.")
        return value
