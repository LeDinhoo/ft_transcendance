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
    # Nouveaux champs pour 2FA
    is_2fa_enabled = models.BooleanField(default=False)
    two_factor_code = models.CharField(max_length=6, null=True, blank=True)
    two_factor_code_timestamp = models.DateTimeField(null=True, blank=True)

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


from django.conf import settings
from django.db import models

class GameHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='games_as_player')
    opponent_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='games_as_opponent'
    )  # Opposant enregistré
    opponent_name = models.CharField(max_length=100, null=True, blank=True)  # Nom de l'opposant temporaire ou IA
    score_user = models.IntegerField()
    score_opponent = models.IntegerField()
    result = models.BooleanField()
    date_played = models.DateTimeField(auto_now_add=True)

    # Statistiques supplémentaires
    power_catch = models.IntegerField(default=0)  # Exemple : puissance de la prise
    ball_speed = models.FloatField(default=0.0)  # Exemple : vitesse de la balle
    longest_rally = models.IntegerField(default=0)  # Exemple : durée du rallye le plus long
    
    def __str__(self):
        return f"{self.user.username} vs {self.opponent_name or self.opponent_user.username if self.opponent_user else 'Unknown'}"
