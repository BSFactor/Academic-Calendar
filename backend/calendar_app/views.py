from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ScheduledEvent
from .serializers import ScheduledEventSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ScheduledEvent, Course, Room
from .serializers import ScheduledEventSerializer

# 1. AA - Create Event
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_event(request):
    # Ensure dummy course and room exist
    course, _ = Course.objects.get_or_create(name="Dummy Course")
    room, _ = Room.objects.get_or_create(name="Dummy Room")
    
    # Add dummy course and room if not provided
    data = request.data.copy()
    if "course" not in data or not data["course"]:
        data["course"] = course.id
    if "room" not in data or not data["room"]:
        data["room"] = room.id
    
    serializer = ScheduledEventSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# 2. AA - Edit Event (only pending)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def edit_event(request, event_id):
    try:
        event = ScheduledEvent.objects.get(id=event_id)
    except ScheduledEvent.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)

    if event.status != "pending":
        return Response({"error": "Only pending events can be edited"}, status=400)

    serializer = ScheduledEventSerializer(event, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# 3. DAA - Approve Event
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_event(request, event_id):
    try:
        event = ScheduledEvent.objects.get(id=event_id)
    except ScheduledEvent.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)

    event.status = "approved"
    event.save()

    return Response({"message": "Event approved"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def approved_events(request):
    events = ScheduledEvent.objects.filter(status="approved")
    serializer = ScheduledEventSerializer(events, many=True)
    return Response(serializer.data)

# 4. DAA - Reject Event
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_event(request, event_id):
    try:
        event = ScheduledEvent.objects.get(id=event_id)
    except ScheduledEvent.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)

    event.status = "rejected"
    event.save()

    return Response({"message": "Event rejected"})

# 5. Lecturer - get assigned events
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def tutor_events(request):
    events = ScheduledEvent.objects.filter(tutor=request.user)
    serializer = ScheduledEventSerializer(events, many=True)
    return Response(serializer.data)
