#from django.urls import path
#from . import views
#
#urlpatterns = [
#    path('', views.index_view, name='index'),  # URL pour la page d'accueil (login/registration)
#    path('game/', views.game_view, name='game'),  # URL pour la page du jeu après connexion
#]
#

#from django.urls import path
#from . import views
#
#urlpatterns = [
#    path('', views.index_view, name='index'),  # Page d'accueil avec les formulaires de login/register
#    path('register/', views.register_view, name='register'),  # Vue d'inscription
#    path('login/', views.login_view, name='login'),  # Vue de connexion
#    path('game/', views.game_view, name='game'),  # Vue du jeu, accessible après connexion
#]


from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),  # Page d'accueil avec les formulaires de login/register
    path('register/', views.register_view, name='register'),  # Vue d'inscription
    path('login/', views.login_view, name='login'),  # Vue de connexion
    path('profil/', views.profile_view, name='profile_view'),
    path('profil/update/', views.update_profile_view, name='update_profile'),  # Vue pour mise à jour du profil (PATCH)
    path('logout/', views.logout_view, name='logout'),  # Route pour le logout
    #path('game/', views.game_view, name='game'),  # Vue du jeu, accessible après connexion
    # JWT Token URLs
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Obtenir un token (login)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Rafraîchir le token
]
