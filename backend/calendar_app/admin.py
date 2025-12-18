from django.contrib import admin
from .models import ScheduledEvent, Course, Room, Major

@admin.register(ScheduledEvent)
class ScheduledEventAdmin(admin.ModelAdmin):
    list_display = ("course", "event_type", "start_time", "end_time", "status", "tutor", "room")
    list_filter = ("status", "event_type", "start_time")
    search_fields = ("course__name", "tutor__username")

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Major)
class MajorAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)
