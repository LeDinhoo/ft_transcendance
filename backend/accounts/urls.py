import logging
from . import views
from .views import Toggle2FAView, Verify2FAView, TestEmailView
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

logger = logging.getLogger(__name__)

urlpatterns = [
    path('', views.index_view, name='index'),
    path('api/', views.index_view, name='index'),
    path('register/', views.register_view, name='register'),  
    path('login/', views.login_view, name='login'),  
    path('profil/', views.profile_view, name='profile_view'),
    path('profil/update/', views.update_profile_view, name='update_profile'),
    path('logout/', views.logout_view, name='logout'),
    path('auth-check/', views.auth_check, name='auth-check'),
    path('check-cookies/', views.check_cookies, name='check-cookies'),
    path('record-game/', views.record_game, name='record_game'),
    path("match-history/", views.match_history, name="match_history"),
    path("user/statistics/", views.get_user_statistics, name="get_user_statistics"),
    path('game-settings/', views.get_game_settings, name='get_game_settings'),
    path('set-game-settings/', views.set_game_settings, name='set_game_settings'),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.refresh_token_view, name='token_refresh'),

    path('get_auth_url/', views.get_auth_url, name='get_auth_url'),
    path('callback-42/', views.callback_42, name='callback_42'),
    path('check-auth/', views.check_auth, name='check_auth'),
    path('2fa/toggle/', Toggle2FAView.as_view(), name='toggle_2fa'),
    path('2fa/verify/', views.verify_2fa, name='verify_2fa'),

    path('test-email/', TestEmailView.as_view(), name='test_email'),

    path('friends/send-request/', views.send_friend_request, name='send_friend_request'),
    path('friends/handle-request/', views.handle_friend_request, name='handle_friend_request'),
    path('friends/list/', views.get_friends, name='get_friends'),
    path('friends/pending/', views.get_pending_requests, name='get_pending_requests'),

	path('language/get/', views.get_preferred_language, name='get_preferred_language'),
    path('language/set/', views.set_preferred_language, name='set_preferred_language'),


	path('user/profile-stats/<int:user_id>/', views.get_user_profile_stats, name='get_user_profile_stats'),

	path('blocked/list/', views.get_blocked_users, name='blocked-users-list'),
	path('blocked/block/', views.block_user, name='block-user'),
	path('blocked/unblock/', views.unblock_user, name='unblock-user'),
]
