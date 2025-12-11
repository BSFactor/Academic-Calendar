from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    name = models.CharField(max_length=255)

class Room(models.Model):
    name = models.CharField(max_length=255)


class ScheduledEvent(models.Model):
    EVENT_TYPES = [
        ("lecture", "Lecture"),
        ("labwork", "Labwork"),
        ("exam", "Exam"),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)

    status = models.CharField(max_length=20, default="pending")  # pending / approved / rejected

    def __str__(self):
        return f"{self.course.name} - {self.event_type}"
