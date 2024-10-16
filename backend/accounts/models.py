from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    avatar= models.ImageField(upload_to='avatars/', max_length=255, default='assets/avatars/ladybug.png')
    
    # Email unique pour chaque utilisateur
    email = models.EmailField(unique=True)

    # Ajout de related_name pour éviter les conflits avec le modèle User de Django
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',  # Change le related_name pour éviter les conflits
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions_set',  # Change le related_name pour éviter les conflits
        blank=True
    )

    def __str__(self):
        return self.username
