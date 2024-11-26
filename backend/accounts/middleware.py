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

class JWTAuthFromCookieMiddleware(MiddlewareMixin):
    def process_request(self, request):
        access_token = request.COOKIES.get('access_token')
        if access_token:
            try:
                # Définir l'en-tête d'autorisation pour être compatible avec l'authentification JWT
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                
                # Appeler explicitement l'authentification JWT
                jwt_authenticator = JWTAuthentication()
                user, _ = jwt_authenticator.authenticate(request)

                # Si l'utilisateur est authentifié, le définir sur la requête
                if user is not None:
                    request.user = user
                    
            except Exception as e:
                logger.error(f"Erreur lors de la vérification du token : {e}")
                request.user = None


class TokenRefreshMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access_token = request.COOKIES.get('access_token')

        if access_token:
            try:
                # Vérifier la validité du token d'accès
                AccessToken(access_token)
            except Exception:
                # Si le token est invalide ou expiré, essayer de le rafraîchir
                refresh_token = request.COOKIES.get('refresh_token')
                if refresh_token:
                    try:
                        token = RefreshToken(refresh_token)
                        new_access_token = str(token.access_token)

                        # Mettre à jour le token dans les cookies
                        response = self.get_response(request)
                        response.set_cookie(
                            key='access_token',
                            value=new_access_token,
                            httponly=True,
                            secure=True,
                            samesite='Lax'
                        )
                        return response
                    except Exception as e:
                        logger.error(f"Erreur lors du rafraîchissement du token : {e}")
                        return JsonResponse({'error': 'Invalid or expired refresh token'}, status=403)

        # Si aucun token ou si le rafraîchissement échoue
        return self.get_response(request)

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
