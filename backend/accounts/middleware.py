import logging
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from urllib.parse import parse_qs

logger = logging.getLogger(__name__)
User = get_user_model()

import logging
from rest_framework_simplejwt.tokens import AccessToken
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)


class JWTAuthMiddleware(MiddlewareMixin):
    def process_request(self, request):
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        user = None

        if access_token:
            try:
                # Valider le token d'accès
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                jwt_authenticator = JWTAuthentication()
                user, _ = jwt_authenticator.authenticate(request)
            except Exception as e:
                # Token d'accès invalide ou expiré
                logger.warning(f"Access token invalide ou expiré: {e}")

        # Si le token d'accès est expiré, tenter de le rafraîchir
        if not user and refresh_token:
            try:
                token = RefreshToken(refresh_token)
                new_access_token = str(token.access_token)

                # Mettre à jour le cookie et authentifier
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_access_token}'
                jwt_authenticator = JWTAuthentication()
                user, _ = jwt_authenticator.authenticate(request)

                # Mettre à jour le cookie avec le nouveau token
                request.new_access_token = new_access_token
            except Exception as e:
                logger.error(f"Erreur lors du rafraîchissement du token : {e}")

        # Définir l'utilisateur sur la requête
        request.user = user or AnonymousUser()

    def process_response(self, request, response):
        # Si un nouveau token d'accès a été généré, l'ajouter dans les cookies
        if hasattr(request, 'new_access_token'):
            response.set_cookie(
                key='access_token',
                value=request.new_access_token,
                httponly=True,
                secure=True,
                samesite='Lax'
            )
        return response

from django.http import JsonResponse
import re

class AntiInjectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Intercepter seulement les requêtes POST
        if request.method == 'POST' and request.path in ["/register/", "/login/"]:
            # Valider les données POST
            validation_error = self.validate_input(request.POST)
            if validation_error:
                # Retourner une erreur si des injections sont détectées
                return JsonResponse({
                    "success": False,
                    "message": f"Entrée invalide détectée : {validation_error}"
                }, status=400)

        # Continuer le traitement normal si tout est OK
        return self.get_response(request)

    def validate_input(self, data):
        """
        Valide les champs pour détecter des motifs d'injection.
        """
        for field, value in data.items():
            if not isinstance(value, str):  # Ignorer les champs non textuels
                continue

            # Vérifier si l'entrée contient des caractères ou motifs suspects
            if self.contains_injection(value):
                return f"Le champ '{field}' contient une valeur invalide."

        return None

    def contains_injection(self, value):
        """
        Vérifie si une valeur contient des motifs communs d'injection.
        """
        # Motifs suspects : SQL, XSS ou shell injections
        patterns = [
            r"(?i)select\s.*from",       # Requêtes SQL
            r"(?i)union\s.*select",     # UNION SQL injection
            r"(?i)drop\s.*table",       # DROP TABLE
            r"<script.*?>.*?</script>", # XSS
            r"(on\w+\s*=\s*['\"].*?['\"])", # Attributs d'événements XSS
            r"['\";`]|--",              # Caractères communs pour SQL injection
        ]

        for pattern in patterns:
            if re.search(pattern, value):
                return True

        return False



# class JWTAuthFromCookieMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         access_token = request.COOKIES.get('access_token')
#         if access_token:
#             try:
                
#                 request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                
                
#                 jwt_authenticator = JWTAuthentication()
#                 user, _ = jwt_authenticator.authenticate(request)

                
#                 if user is not None:
#                     request.user = user
                    
#             except Exception as e:
#                 logger.error(f"Erreur lors de la vérification du token : {e}")
#                 request.user = None


# class TokenRefreshMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         access_token = request.COOKIES.get('access_token')

#         if access_token:
#             try:
                
#                 AccessToken(access_token)
#             except Exception:
                
#                 refresh_token = request.COOKIES.get('refresh_token')
#                 if refresh_token:
#                     try:
#                         token = RefreshToken(refresh_token)
#                         new_access_token = str(token.access_token)

                        
#                         response = self.get_response(request)
#                         response.set_cookie(
#                             key='access_token',
#                             value=new_access_token,
#                             httponly=True,
#                             secure=True,
#                             samesite='Lax'
#                         )
#                         return response
#                     except Exception as e:
#                         logger.error(f"Erreur lors du rafraîchissement du token : {e}")
#                         return JsonResponse({'error': 'Invalid or expired refresh token'}, status=403)

        
#         return self.get_response(request)

class JWTWebSocketMiddleware(BaseMiddleware):
    def get_cookie_from_scope(self, scope, cookie_name):
        """Utilitaire pour récupérer un cookie spécifique du scope"""
        for name, value in scope.get('headers', []):
            if name == b'cookie':
                cookie_string = value.decode()
                for cookie in cookie_string.split(';'):
                    if '=' in cookie:
                        key, val = cookie.strip().split('=', 1)
                        if key.strip() == cookie_name:
                            return val.strip()
        return None

    async def __call__(self, scope, receive, send):
        print("JWTWebSocketMiddleware: Traitement de la requête WebSocket")
        
        access_token = self.get_cookie_from_scope(scope, 'access_token')
        
        if access_token:
            try:
                token = AccessToken(access_token)
                user_id = token.payload.get('user_id')
                if user_id:
                    scope['user'] = await self.get_user(user_id)
                    print(f"JWTWebSocketMiddleware: Utilisateur authentifié: {scope['user'].username}")
                    return await super().__call__(scope, receive, send)
            except Exception as e:
                print(f"JWTWebSocketMiddleware: Erreur d'authentification: {str(e)}")
                scope['user'] = AnonymousUser()
        else:
            print("JWTWebSocketMiddleware: Pas de token trouvé")
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()
