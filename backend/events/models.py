from django.db import models
from django.conf import settings

# Store calendar events created by AA users.
# - Use `status` to control workflow: pending -> approved -> rejected
# - Store `assigned_to` as the user the event belongs to (usually creator)
# - Record `approved_by` as the DAA/admin user who approved the event
class Event(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_events'
    )
    approved = models.BooleanField(default=False)

    def __str__(self):
        return self.title
