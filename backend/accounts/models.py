from django.contrib.auth.models import AbstractUser
from django.db import models
import random
import string

class CustomUser(AbstractUser):
	
	is_2fa_enabled = models.BooleanField(default=False)
	two_factor_code = models.CharField(max_length=6, null=True, blank=True)
	two_factor_code_timestamp = models.DateTimeField(null=True, blank=True)

	avatar = models.ImageField(upload_to='avatars/', max_length=255, default='assets/avatars/ladybug.png')
	email = models.EmailField(unique=True)
	intra_42_id = models.IntegerField(null=True, blank=True, unique=True)
	is_42_user = models.BooleanField(default=False)
	
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

	friends = models.ManyToManyField(
		'self',
		through='FriendShip',
		symmetrical=False,
		related_name='user_friends'
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