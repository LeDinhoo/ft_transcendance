from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .views import Toggle2FAView, Verify2FAView, TestEmailView
from .views import get_game_settings, set_game_settings
from .views import cleanup_test_users

urlpatterns = [
    path('', views.index_view, name='index'),  # Page d'accueil avec les formulaires de login/register
    path('register/', views.register_view, name='register'),  # Vue d'inscription
    path('login/', views.login_view, name='login'),  # Vue de connexion
    path('profil/', views.profile_view, name='profile_view'),
    path('profil/update/', views.update_profile_view, name='update_profile'),  # Vue pour mise à jour du profil (PATCH)
    path('logout/', views.logout_view, name='logout'),  # Route pour le logout
    path('auth-check/', views.auth_check, name='auth-check'),
    path('check-cookies/', views.check_cookies, name='check-cookies'),
    path('record-game/', views.record_game, name='record_game'),
    path("match-history/", views.match_history, name="match_history"),
    path("user/statistics/", views.get_user_statistics, name="get_user_statistics"),
    path('game-settings/', get_game_settings, name='get_game_settings'),
    path('game-settings/set/', set_game_settings, name='set_game_settings'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Obtenir un token (login)
    path('token/refresh/', views.refresh_token_view, name='token_refresh'),  # Utilise la vue basée sur les cookies

    path('get_auth_url/', views.get_auth_url, name='get_auth_url'),
    path('callback-42/', views.callback_42, name='callback_42'),  # Callback après autorisation
    path('check-auth/', views.check_auth, name='check_auth'),
    path('2fa/toggle/', Toggle2FAView.as_view(), name='toggle_2fa'),
    path('2fa/verify/', views.verify_2fa, name='verify_2fa'),
    path('test-email/', TestEmailView.as_view(), name='test_email'),

    ################################FOR TEST################################################
    path('cleanup-test-users/', views.cleanup_test_users, name='cleanup_test_users'),

]
