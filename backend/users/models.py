from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("AA", "Academic Assistant"),
        ("DAA", "Department Academic Assistant"),
    )
    role = models.CharField(max_length=3, choices=ROLE_CHOICES)
