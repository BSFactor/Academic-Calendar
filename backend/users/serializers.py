from rest_framework import serializers

from .models import StudentProfile, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "role")


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        # accept user as optional; save() will create the user if missing
        fields = ("id", "user", "name", "email", "dob", "student_id", "major", "year")
        read_only_fields = ("id",)

    def create(self, validated_data):
        # Leave creation logic to model.save() which creates a User when user is None
        profile = StudentProfile(**validated_data)
        profile.save()
        return profile
