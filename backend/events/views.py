from rest_framework import generics, permissions
from .models import Event
from .serializers import EventSerializer
from .permission import IsDAA, IsAA

class UserEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(assigned_to=self.request.user,status='approved')
class CreateEventView(generics.CreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAA]

    def perform_create(self, serializer):
        serializer.save(assigned_to=self.request.user, status='pending')
class ApproveEventView(generics.UpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsDAA]

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

