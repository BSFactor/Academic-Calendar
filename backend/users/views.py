from rest_framework import generics, status
from rest_framework.response import Response

from .models import StudentProfile
from .serializers import StudentProfileSerializer
from .permissions import IsDAAOrAdminOrHasModelPerm


class StudentProfileCreateView(generics.CreateAPIView):
	"""Create a StudentProfile. Only DAA, Admin or users with the
	`users.can_create_student` permission may create student profiles.
	"""
	queryset = StudentProfile.objects.all()
	serializer_class = StudentProfileSerializer
	permission_classes = (IsDAAOrAdminOrHasModelPerm,)

	def create(self, request, *args, **kwargs):
		return super().create(request, *args, **kwargs)

