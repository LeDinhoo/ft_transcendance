from django.contrib.auth.models import AbstractUser
from django.db import models
import random
import string

class CustomUser(AbstractUser):
    # Vos champs existants
    is_2fa_enabled = models.BooleanField(default=False)
    two_factor_code = models.CharField(max_length=6, null=True, blank=True)
    two_factor_code_timestamp = models.DateTimeField(null=True, blank=True)

    avatar = models.ImageField(upload_to='avatars/', max_length=255, default='assets/avatars/ladybug.png')
    email = models.EmailField(unique=True)
    intra_42_id = models.IntegerField(null=True, blank=True, unique=True)
    is_42_user = models.BooleanField(default=False)
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

    def generate_2fa_code(self):
        """Génère un code 2FA à 6 chiffres"""
        code = ''.join(random.choices(string.digits, k=6))
        return code

    class Meta:
        db_table = 'accounts_customuser'