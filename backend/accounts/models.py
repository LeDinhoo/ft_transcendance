from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Champs existants
    avatar = models.ImageField(upload_to='avatars/', max_length=255, default='assets/avatars/ladybug.png')
    email = models.EmailField(unique=True)
    
    # Nouveaux champs pour l'auth 42
    intra_42_id = models.IntegerField(null=True, blank=True, unique=True)
    is_42_user = models.BooleanField(default=False)
    
    # Relations existantes
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
        return self.username

    class Meta:
        db_table = 'accounts_customuser'  # ou le nom que vous utilisez déjà




