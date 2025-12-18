from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin

from .models import (
	StudentProfile,
	TutorProfile,
	AcademicAssistantProfile,
	DepartmentAcademicAssistantProfile,
	AdministratorProfile,
)
 

# Register the custom User model
User = get_user_model()


@admin.register(User)
class CustomUserAdmin(UserAdmin):
	list_display = ("username", "email", "role", "is_staff", "is_active")
	list_filter = ("role", "is_staff", "is_superuser", "is_active")
	search_fields = ("username", "email")
	ordering = ("username",)

	fieldsets = UserAdmin.fieldsets + (("Role", {"fields": ("role",)}),)
	add_fieldsets = UserAdmin.add_fieldsets + ((None, {"fields": ("role",)}),)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
	list_display = ("student_id", "name", "email", "major", "year")
	search_fields = ("student_id", "name", "email")
	list_filter = ("major", "year")


@admin.register(TutorProfile)
class TutorProfileAdmin(admin.ModelAdmin):
	list_display = ("tutor_id", "name", "email", "user")
	search_fields = ("tutor_id", "name", "email")


@admin.register(AcademicAssistantProfile)
class AcademicAssistantProfileAdmin(admin.ModelAdmin):
	list_display = ("assistant_id", "name", "email", "user")
	search_fields = ("assistant_id", "name", "email")


@admin.register(DepartmentAcademicAssistantProfile)
class DepartmentAcademicAssistantProfileAdmin(admin.ModelAdmin):
	list_display = ("dassistant_id", "name", "email", "user")
	search_fields = ("dassistant_id", "name", "email")


@admin.register(AdministratorProfile)
class AdministratorProfileAdmin(admin.ModelAdmin):
	list_display = ("admin_id", "name", "email", "user")
	search_fields = ("admin_id", "name", "email")
