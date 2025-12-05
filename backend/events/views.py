from rest_framework import generics, permissions
from rest_framework.response import Response
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import Event
from .serializers import EventSerializer
from .permission import IsDAA, IsAA
import json
from django.core.serializers.json import DjangoJSONEncoder

class UserEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Return approved events assigned to current user
    def get_queryset(self):
        return Event.objects.filter(assigned_to=self.request.user, status='approved')
class CreateEventView(generics.CreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAA]

    # Create event and set assigned_to to request.user and status to pending
    def perform_create(self, serializer):
        serializer.save(assigned_to=self.request.user, status='pending')
class ApproveEventView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsDAA]

    # Approve or reject event based on `action` in request data
    def patch(self, request, *args, **kwargs):
        event = self.get_object()
        action = request.data.get("action")

        if action == "approve":
            event.status = "approved"
            event.approved_by = request.user
        elif action == "reject":
            event.status = "rejected"
            event.approved_by = request.user
        else:
            return Response({"error": "Invalid action"}, status=400)

        event.save()
        return Response(EventSerializer(event).data, status=200)


@login_required(login_url='/users/api/login/')
def calendar_week_view(request):
    """Render the week calendar with all approved events"""
    # Query approved events for display in calendar
    events = Event.objects.filter(status='approved')
    
    # Serialize events to JSON for the template's JavaScript
    events_data = []
    for event in events:
        events_data.append({
            'id': event.id,
            'title': event.title,
            'description': event.description,
            'start_time': event.start_time.isoformat(),
            'end_time': event.end_time.isoformat(),
        })
    
    context = {
        'events': json.dumps(events_data, cls=DjangoJSONEncoder),
    }
    return render(request, 'events/week.html', context)

