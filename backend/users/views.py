from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

import openpyxl

from .models import StudentProfile
from .serializers import StudentProfileSerializer, UserSerializer
from .permissions import IsDAAOrAdminOrHasModelPerm
from rest_framework.permissions import IsAuthenticated

class UserProfileView(generics.RetrieveUpdateAPIView):
	"""Retrieve or update the current user's profile.
	Allows the authenticated user to view and edit their own `username`/`email`.
	"""
	serializer_class = UserSerializer
	permission_classes = [IsAuthenticated]

	def get_object(self):
		return self.request.user


class StudentProfileCreateView(generics.CreateAPIView):
	"""Create a StudentProfile. Only DAA, Admin or users with the
	`users.can_create_student` permission may create student profiles.
	"""
	queryset = StudentProfile.objects.all()
	serializer_class = StudentProfileSerializer
	permission_classes = (IsDAAOrAdminOrHasModelPerm,)

	def create(self, request, *args, **kwargs):
		return super().create(request, *args, **kwargs)


class BulkStudentUploadView(APIView):
	"""Upload an Excel file (xlsx) with columns: name, student id, student email, dob
	Rows will be validated and `StudentProfile` rows will be created. Passwords are
	generated as `student_id + dob(YYYYMMDD)` per requirements.
	"""
	permission_classes = (IsDAAOrAdminOrHasModelPerm,)
	parser_classes = (MultiPartParser, FormParser)

	def post(self, request, format=None):
		upload = request.FILES.get('file')
		if not upload:
			return Response({'detail': 'No file provided (use form field "file")'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			wb = openpyxl.load_workbook(upload)
		except Exception as e:
			return Response({'detail': 'Invalid Excel file', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

		ws = wb.active
		rows = list(ws.iter_rows(values_only=True))
		if not rows or len(rows) < 2:
			return Response({'detail': 'No data rows found'}, status=status.HTTP_400_BAD_REQUEST)

		header = [str(h).strip().lower() if h is not None else '' for h in rows[0]]

		def find_col(names):
			for n in names:
				if n in header:
					return header.index(n)
			return None

		name_i = find_col(['name', 'student name'])
		id_i = find_col(['student id', 'student_id', 'id'])
		email_i = find_col(['student email', 'email', 'studentemail'])
		dob_i = find_col(['dob', 'date of birth', 'birthdate', 'birth date'])

		if None in (name_i, id_i, email_i, dob_i):
			return Response({'detail': 'Header missing. Required columns: name, student id, student email, dob', 'header': header}, status=status.HTTP_400_BAD_REQUEST)

		successes = []
		errors = []
		from datetime import datetime, date

		for idx, row in enumerate(rows[1:], start=2):
			try:
				name = row[name_i] or ''
				student_id = str(row[id_i]).strip() if row[id_i] is not None else ''
				email = row[email_i] or ''
				dob_cell = row[dob_i]

				if isinstance(dob_cell, datetime):
					dob = dob_cell.date()
				elif isinstance(dob_cell, date):
					dob = dob_cell
				else:
					dob_str = str(dob_cell).strip()
					# try common formats
					parsed = None
					for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%d/%m/%y', '%d-%m-%y'):
						try:
							parsed = datetime.strptime(dob_str, fmt).date()
							break
						except Exception:
							continue
					if not parsed:
						raise ValueError(f'Unable to parse DOB: {dob_cell}')
					dob = parsed

				if not (name and student_id and email and dob):
					raise ValueError('Missing required field(s)')

				# avoid duplicates
				if StudentProfile.objects.filter(student_id=student_id).exists():
					raise ValueError('Student with this student_id already exists')
				if StudentProfile.objects.filter(email=email).exists():
					raise ValueError('Student with this email already exists')

				profile = StudentProfile(name=name, student_id=student_id, email=email, dob=dob, year=1)
				profile.save()
				successes.append({'row': idx, 'student_id': student_id, 'email': email})
			except Exception as e:
				errors.append({'row': idx, 'error': str(e)})

		return Response({'created': len(successes), 'errors': errors, 'details': successes}, status=status.HTTP_200_OK)

