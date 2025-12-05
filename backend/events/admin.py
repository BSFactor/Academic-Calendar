from django.contrib import admin
from .models import Event

# Register Event model in admin to allow manual create/edit operations
admin.site.register(Event)
