import random
import string
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

def default_keyboard_settings():
    return {
        'player1': {'moveUp': 'W', 'moveDown': 'S', 'launchPower': 'E'},
        'player2': {'moveUp': 'ArrowUp', 'moveDown': 'ArrowDown', 'launchPower': 'ArrowLeft'}
    }

class UserSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    score_to_win = models.IntegerField(default=5)
    difficulty = models.CharField(max_length=50, default='medium')
    ball_speed_start = models.FloatField(default=10.0)
    ball_speed_max = models.FloatField(default=30.0)
    ball_speed_increase = models.FloatField(default=1.0)
    powerups = models.JSONField(default=list, blank=True)
    keyboard_settings = models.JSONField(default=default_keyboard_settings, blank=True)

    def __str__(self):
        return f"Settings for {self.user.username}"


class CustomUser(AbstractUser):
	LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('fr', 'Français'),
        ('es', 'Español'),
        ('swe', 'Svenska')
    ]
	# Vos champs existants
	is_2fa_enabled = models.BooleanField(default=False)
	two_factor_code = models.CharField(max_length=6, null=True, blank=True)
	two_factor_code_timestamp = models.DateTimeField(null=True, blank=True)

	avatar = models.ImageField(upload_to='avatars/', max_length=255, default='assets/avatars/ladybug.png')
	email = models.EmailField(unique=True)
	intra_42_id = models.IntegerField(null=True, blank=True, unique=True)
	is_42_user = models.BooleanField(default=False)

	preferred_language = models.CharField(
        max_length=3,
        choices=LANGUAGE_CHOICES,
        default='en',
        verbose_name='Preferred Language'
    )

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

	friends = models.ManyToManyField(
		'self',
		through='FriendShip',
		symmetrical=False,
		related_name='user_friends'
	)

	blocked_users = models.ManyToManyField(
		'self',
		symmetrical=False,
		related_name='blocked_by',
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
	)
	opponent_name = models.CharField(max_length=100, null=True, blank=True)
	score_user = models.IntegerField()
	score_opponent = models.IntegerField()
	result = models.BooleanField()
	date_played = models.DateTimeField(auto_now_add=True)

	power_catch = models.IntegerField(default=0)
	max_ball_speed = models.FloatField(default=0.0)
	longest_rally = models.IntegerField(default=0)

	def __str__(self):
		return f"{self.user.username} vs {self.opponent_name or self.opponent_user.username if self.opponent_user else 'Unknown'}"

class FriendShip(models.Model):
	STATUS_CHOICES = [
		('pending', 'Pending'),
		('accepted', 'Accepted'),
		('rejected', 'Rejected')
	]

	from_user = models.ForeignKey(CustomUser, related_name='friendships', on_delete=models.CASCADE)
	to_user = models.ForeignKey(CustomUser, related_name='friend_requests', on_delete=models.CASCADE)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('from_user', 'to_user')


def default_powerups():
    return ['inverse', 'flash', 'tornado']

class GameHostOptions(models.Model):
    scoreToWin = models.IntegerField(default=5)
    difficulty = models.CharField(max_length=50, default='medium')
    ballSpeedStart = models.FloatField(default=10.0)
    ballSpeedMax = models.FloatField(default=30.0)
    ballSpeedIncrease = models.FloatField(default=1.0)
    powerups = models.JSONField(default=default_powerups, blank=True)
    keyboardSettings = models.JSONField(default=dict)

    def __str__(self):
        return (f"scoreToWin={self.scoreToWin}, difficulty={self.difficulty}, "
                f"ballSpeedStart={self.ballSpeedStart}, ballSpeedMax={self.ballSpeedMax}, "
                f"ballSpeedIncrease={self.ballSpeedIncrease}, powerups={self.powerups}, "
                f"keyboardSettings={self.keyboardSettings})")

