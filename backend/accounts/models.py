from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Champs existants
    email = models.EmailField(unique=True)
    
    # Nouveaux champs pour l'authentification 42
    # intra_login = models.CharField(max_length=255, unique=True, null=True, blank=True)
    intra_email = models.EmailField(unique=True, null=True, blank=True)
    image_url = models.URLField(max_length=255, blank=True, null=True)

    # Garder les related_name personnalisés pour éviter les conflits
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions_set',
        blank=True
    )

    def __str__(self):
        return self.username or self.intra_login

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'