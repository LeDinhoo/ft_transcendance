"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from accounts import views  # Importer les vues si tu souhaites utiliser `game_view` sans le préfixe /api/

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),  # Inclure toutes les URLs de l'application accounts avec le préfixe /api/
    path('game/', views.game_view, name='game'),
	path('', views.index_view, name='index'),  # Inclure la route /game/ ici sans le préfixe /api/
    # path('get-auth-url/', views.get_auth_url, name='get_auth_url'),  # Slash supplémentaire supprimé
    # path('login-register', views.login_register, name='login_register'),
    
]