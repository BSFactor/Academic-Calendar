from rest_framework import generics, permissions
from .models import Event
from .serializers import EventSerializer

class UserEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(assigned_to=self.request.user)
