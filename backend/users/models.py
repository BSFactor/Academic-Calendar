from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
import logging
from datetime import date
import re

logger = logging.getLogger(__name__)
class User(AbstractUser):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("tutor", "Tutor"),
        ("academic_assistant", "Academic Assistant"),
        ("department_assistant", "Department Academic Assistant"),
        ("administrator", "Administrator"),
    ]

    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="student")

    def __str__(self):
        return f"{self.username} ({self.role})"
# Major model moved to calendar_app.models
# Create your models here.
class StudentProfile(models.Model):
    # Make user optional at the DB/form level so admin can create a StudentProfile
    # and let the model's save() create the associated User if missing.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True, default="john@doe.com")
    dob = models.DateField(verbose_name="date of birth")
    student_id = models.CharField(max_length=50, unique=True)
    # link student's major to Major model in calendar_app; allow null to ease migrations and optional students
    major = models.ForeignKey('calendar_app.Major', on_delete=models.SET_NULL, null=True, blank=True, related_name="students")
    year = models.PositiveSmallIntegerField()

    def save(self, *args, **kwargs):
        if not self.user_id:  # If no user assigned yet
            # Build a username from the student's name (sanitized)
            name_clean = (self.name or '').lower()
            base_username = re.sub(r'[^a-z0-9]', '', name_clean)
            if not base_username:
                base_username = re.sub(r'[^a-z0-9]', '', str(self.student_id).lower())

            # ensure username uniqueness by appending student_id if needed
            user_model = get_user_model()
            username = base_username
            if user_model.objects.filter(username=username).exists():
                username = f"{base_username}{self.student_id.lower()}"
                counter = 1
                while user_model.objects.filter(username=username).exists():
                    username = f"{base_username}{self.student_id.lower()}{counter}"
                    counter += 1

            # Create password: student_id + dob in DDMMYYYY format
            try:
                dob_part = self.dob.strftime('%d%m%Y')
            except Exception:
                dob_part = ""
            password = f"{self.student_id}{dob_part}"

            # Create the user (use get_user_model for safety) and set email separately
            user = user_model.objects.create_user(username=username, email=self.email, password=password, role='student')
            # ensure newly created user is active so they can sign in immediately
            user.is_active = True
            user.save()
            self.user = user

            logger.info(f"Created user for student {self.name}: username='{username}', password='[REDACTED]'")
        
        super().save(*args, **kwargs)
    def __str__(self):
        return f"{self.student_id} - {self.name}"


    def delete(self, *args, **kwargs):
        # Delete the associated user when student profile is deleted
        if self.user:
            self.user.delete()
        super().delete(*args, **kwargs)


class TutorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tutor_profile")
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200)
    dob = models.DateField(verbose_name="date of birth")
    tutor_id = models.CharField(max_length=50, unique=True)
    courses = models.ManyToManyField('calendar_app.Course', related_name="tutors", blank=True)
    def delete(self, *args, **kwargs):
        # Delete the associated user when tutor profile is deleted
        if self.user:
            self.user.delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.name

class AcademicAssistantProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="academic_assistant_profile")
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200)
    assistant_id = models.CharField(max_length=50, unique=True)

    def delete(self, *args, **kwargs):
        # Delete the associated user when academic assistant profile is deleted
        if self.user:
            self.user.delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.name
    
class DepartmentAcademicAssistantProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="department_academic_assistant_profile")
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200)
    dassistant_id = models.CharField(max_length=50, unique=True)

    def delete(self, *args, **kwargs):
        # Delete the associated user when department academic assistant profile is deleted
        if self.user:
            self.user.delete()
        super().delete(*args, **kwargs)
    def __str__(self):
        return self.name
    
class AdministratorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="administrator_profile")
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200)
    admin_id = models.CharField(max_length=50, unique=True)

    def delete(self, *args, **kwargs):
        # Delete the associated user when administrator profile is deleted
        if self.user:
            self.user.delete()
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.name