from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        # Expose API fields; make `approved_by` read-only so approvals happen via endpoint
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'assigned_to', 'status', 'approved_by']
        read_only_fields = ['approved_by']
