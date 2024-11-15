import json
import logging
from django.http import JsonResponse
from django.db import IntegrityError  # Import de l'exception IntegrityError
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import render
from .forms import RegisterForm, LoginForm
from .validators import ComplexPasswordValidator  # Importer le validateur de mot de passe
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.conf import settings
import os


import random
from django.utils import timezone
from datetime import timedelta

from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import random
import string
from django.utils import timezone



@api_view(['GET'])
@permission_classes([AllowAny])
def check_cookies(request):
    logger.info("Accès à la vue check_cookies")
    return JsonResponse({
        "cookies": request.COOKIES,
        "access_token": request.COOKIES.get('access_token')
    })


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])  # S'assure que le token est valide
# def auth_check(request):
#     # Si l'utilisateur est authentifié, retourner une réponse 200 OK
#     return Response({"authenticated": True}, status=status.HTTP_200_OK)



from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Vérifie le token via le middleware JWT
def auth_check(request):
    """
    Vérifie si l'utilisateur est authentifié avec un token valide.
    """
    try:
        # Vérification supplémentaire si nécessaire
        JWTAuthentication().authenticate(request)
        return Response({"authenticated": True}, status=status.HTTP_200_OK)

    except TokenError as e:
        # Gestion des erreurs liées au token
        return Response({"error": "Token invalide ou expiré.", "details": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        # Autres erreurs inattendues
        return Response({"error": "Erreur inattendue.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

# Vue pour la page d'accueil (login/register)
@api_view(['GET'])
@permission_classes([AllowAny])  # Page publique
def index_view(request):
    login_form = LoginForm()
    register_form = RegisterForm()
    return render(request, 'index.html', {'login_form': login_form, 'register_form': register_form})

# def set_jwt_cookies(response, access_token, refresh_token):
#     # Configurer les cookies sécurisés pour les tokens
#     response.set_cookie(
#         key='access_token',
#         value=access_token,
#         httponly=True,  # Empêche l'accès via JavaScript
#         secure=True,    # Utilise HTTPS uniquement
#         samesite='Strict'  # Paramètre SameSite pour CSRF
#     )
#     response.set_cookie(
#         key='refresh_token',
#         value=refresh_token,
#         httponly=True,
#         secure=True,
#         samesite='Strict'
#     )

def set_jwt_cookies(response, access_token, refresh_token):
    # Configurer les cookies sécurisés pour les tokens
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,  # Empêche l'accès via JavaScript
        secure=True,    # Utilise HTTPS uniquement
        samesite='None'  # Autorise l'accès intersite pour les fenêtres popup
    )
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='None'  # Autorise l'accès intersite pour les fenêtres popup
    )



# Vue pour la connexion (utilisation des tokens JWT)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        user = authenticate(request, email=email, password=password)
        if user is not None:
            # Vérifier si l'utilisateur a activé le 2FA
            if user.is_2fa_enabled:  # On utilise is_2fa_enabled au lieu de two_factor_enabled
                # Générer un code 2FA (6 chiffres)
                code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

                # Sauvegarder le code et son timestamp
                user.two_factor_code = code
                user.two_factor_code_timestamp = timezone.now()
                user.save()

                # Envoyer l'email avec le code
                if send_2fa_email(user, code):
                    return JsonResponse({
                        'success': True,
                        'requires_2fa': True,
                        'user_id': user.id,
                        'message': 'Code 2FA envoyé'
                    })
                else:
                    return JsonResponse({
                        'success': False,
                        'message': 'Erreur lors de l\'envoi du code 2FA'
                    }, status=500)
            else:
                # Connexion sans 2FA
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                response = JsonResponse({
                    'success': True,
                    'message': 'Login successful',

                }, status=200)
                set_jwt_cookies(response, access_token, refresh_token)
                return response
        else:
            return JsonResponse({
                'success': False,
                'message': 'Invalid credentials'
            }, status=401)

    except Exception as e:
        logger.error(f"Erreur de connexion : {str(e)}")
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        logger.info("Requête d'inscription reçue")
        data = json.loads(request.body)

        register_form = RegisterForm(data)
        if register_form.is_valid():
            user = register_form.save()
            logger.info(f"Utilisateur créé : {user.username}")

            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'success': True,
                'message': 'User registered successfully',
                #'access': str(refresh.access_token),
                #'refresh': str(refresh)
            }, status=201)
        else:
            logger.warning(f"Erreurs dans le formulaire : {register_form.errors}")
            return JsonResponse({
                'success': False,
                'message': 'Form is not valid',
                'errors': register_form.errors.get_json_data()  # Utiliser get_json_data pour formater les erreurs
            }, status=400)

    except json.JSONDecodeError:
        logger.error("Erreur de parsing JSON")
        return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)
    except IntegrityError as e:
        logger.error(f"Erreur d'intégrité : {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Integrity error: {str(e)}'
        }, status=400)
    except Exception as e:
        logger.exception(f"Erreur inattendue : {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Unexpected error: {str(e)}'
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    print("Chargement du profil pour l'utilisateur:", user.username)  # Debug
    print("Avatar actuel:", user.avatar)  # Debug

    # Gérer le chemin de l'avatar
    avatar_url = None
    if user.avatar:
        if str(user.avatar).startswith('assets/avatars/'):
            # Si l'avatar est un avatar prédéfini
            avatar_url = f"/static/{user.avatar}"
        else:
            # Si l'avatar est un fichier uploadé
            avatar_url = f"/media/{user.avatar}"

    response_data = {
        'username': user.username,
        'email': user.email,
        'avatar': avatar_url,
        'is_2fa_enabled': user.is_2fa_enabled
    }

    return JsonResponse(response_data, status=200)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    user = request.user
    data = request.data
    #print("Données reçues:", data)  # Debug
    #print("Files reçus:", request.FILES)  # Debug

    # Valider et mettre à jour le nom d'utilisateur si présent dans les données
    if 'username' in data:
        new_username = data['username']
        if new_username.strip():  # Vérifie que le nom d'utilisateur n'est pas vide
            user.username = new_username
        else:
            return JsonResponse({'error': 'Le nom d\'utilisateur ne peut pas être vide.'}, status=400)

    # Valider et mettre à jour l'email si présent dans les données
    if 'email' in data:
        new_email = data['email']
        try:
            validate_email(new_email)  # Utilise le validateur intégré de Django
            user.email = new_email
        except ValidationError:
            return JsonResponse({'error': 'L\'adresse email est invalide.'}, status=400)

    # Changement de mot de passe
    if 'old_password' in data and 'new_password' in data:
        old_password = data['old_password']
        new_password = data['new_password']

        # Vérifier si l'ancien mot de passe est correct
        if not check_password(old_password, user.password):
            return JsonResponse({'error': 'L\'ancien mot de passe est incorrect.'}, status=400)

        # Utiliser le validateur de mot de passe personnalisé
        password_validator = ComplexPasswordValidator()
        try:
            password_validator.validate(new_password)
        except ValidationError as e:
            return JsonResponse({'error': e.messages[0]}, status=400)

        # Hacher le nouveau mot de passe et le sauvegarder
        user.password = make_password(new_password)

    # Gérer l'avatar uploadé si présent
    if 'avatar' in request.FILES:
        avatar = request.FILES['avatar']
        valid_image_extensions = ['png', 'jpg', 'jpeg']
        ext = avatar.name.split('.')[-1].lower()
        if ext not in valid_image_extensions:
            return JsonResponse({'error': 'Seuls les fichiers PNG, JPG ou JPEG sont acceptés.'}, status=400)
        user.avatar = avatar

    elif 'selected_avatar' in data:
        selected_avatar = data['selected_avatar']
        print("Avatar sélectionné:", selected_avatar)  # Debug
        # Vérifier si le chemin correspond au format attendu
        expected_prefix = 'assets/avatars/'
        if selected_avatar.startswith(expected_prefix):
            user.avatar = selected_avatar
            print("Avatar après assignation:", user.avatar)  # Debug
        else:
            print("Chemin d'avatar invalide:", selected_avatar)  # Debug
            return JsonResponse({
                'error': f'Chemin d\'avatar invalide. Le chemin doit commencer par {expected_prefix}'
            }, status=400)

    try:
        user.save()  # Sauvegarder les modifications dans la base de données
    except Exception as e:
        return JsonResponse({'error': 'Une erreur s\'est produite lors de la mise à jour du profil.'}, status=500)

    avatar_url = None
    if user.avatar:
        if str(user.avatar).startswith('assets/avatars/'):
            avatar_url = f"/static/{user.avatar}"
        else:
            avatar_url = f"/media/{user.avatar}"
    
    print("URL de l'avatar renvoyée:", avatar_url)  # Debug

    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'avatar': avatar_url
    }, status=200)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def logout_view(request):
#     try:
#         refresh_token = request.COOKIES.get('refresh_token')
#         if refresh_token:
#             token = RefreshToken(refresh_token)
#             token.blacklist()
        
#         response = JsonResponse({'success': True, 'message': 'Logout successful'}, status=200)
#         response.delete_cookie('access_token')
#         response.delete_cookie('refresh_token')
#         return response
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception as e:
        logger.error(f"Erreur lors du blacklistage du refresh token : {str(e)}")

    response = JsonResponse({'success': True, 'message': 'Logout successful'}, status=200)
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])  # Accessible uniquement pour les utilisateurs authentifiés
# def logout_view(request):
#     try:
#         # Récupérer le refresh token de la requête
#         refresh_token = request.data.get('refresh_token')

#         if not refresh_token:
#             return JsonResponse({'success': False, 'message': 'Refresh token is required'}, status=400)

#         # Invalider le refresh token
#         try:
#             refresh_token_instance = RefreshToken(refresh_token)
#             refresh_token_instance.blacklist()
#         except Exception as e:
#             return JsonResponse({'success': False, 'message': f'Error blacklisting refresh token: {str(e)}'}, status=500)

#         return JsonResponse({'success': True, 'message': 'Logout successful'}, status=200)

#     except Exception as e:
#         return JsonResponse({'success': False, 'message': str(e)}, status=400)

from rest_framework_simplejwt.exceptions import TokenError

# @api_view(['POST'])
# @permission_classes([AllowAny])
# def refresh_token_view(request):
#     refresh_token = request.COOKIES.get('refresh_token')
#     if not refresh_token:
#         return JsonResponse({'error': 'Refresh token not found'}, status=403)

#     try:
#         token = RefreshToken(refresh_token)
#         access_token = str(token.access_token)

#         response = JsonResponse({'success': True}, status=200)
#         response.set_cookie(
#             key='access_token',
#             value=access_token,
#             httponly=True,
#             secure=True,
#             samesite='Lax'
#         )

#         return response

#     except Exception as e:
#         return JsonResponse({'error': 'Invalid refresh token'}, status=403)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def refresh_token_view(request):
#     refresh_token = request.COOKIES.get('refresh_token')
#     if not refresh_token:
#         return JsonResponse({'error': 'Refresh token not found in cookies'}, status=403)

#     try:
#         token = RefreshToken(refresh_token)
#         access_token = str(token.access_token)

#         response = JsonResponse({'success': True, 'access': access_token}, status=200)
#         response.set_cookie(
#             key='access_token',
#             value=access_token,
#             httponly=True,
#             secure=True,
#             samesite='Lax'
#         )
#         return response

#     except TokenError as e:
#         logger.error(f"Invalid refresh token: {e}")
#         return JsonResponse({'error': 'Invalid or expired refresh token'}, status=403)

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return JsonResponse({'error': 'Refresh token not found in cookies'}, status=403)

    try:
        token = RefreshToken(refresh_token)
        access_token = str(token.access_token)

        response = JsonResponse({'success': True, 'access': access_token}, status=200)
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=True,
            samesite='Lax'
        )
        return response

    except TokenError as e:
        logger.error(f"Invalid refresh token: {e}")
        return JsonResponse({'error': 'Invalid or expired refresh token'}, status=403)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed

@api_view(['POST'])
@permission_classes([AllowAny])
def auto_refresh_token_view(request):
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=400)
    
    try:
        token = RefreshToken(refresh_token)
        new_access_token = str(token.access_token)
        
        return Response({
            'access': new_access_token
        }, status=200)
    except Exception as e:
        return Response({'error': 'Invalid or expired refresh token'}, status=403)



# @api_view(['POST'])
# def token_refresh_view(request):
#     refresh_token = request.data.get('refresh')
    
#     try:
#         token = RefreshToken(refresh_token)
        
#         # Vérifier si le token est blacklisté
#         if token.check_blacklist():
#             return JsonResponse({'error': 'Token is blacklisted'}, status=400)
        
#         # Générer un nouveau token d'accès
#         new_access_token = str(token.access_token)
#         return JsonResponse({'access': new_access_token}, status=200)
        
#     except TokenError as e:
#         return JsonResponse({'error': 'Invalid token'}, status=400)

#################################API 42 ####################################################

from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.views.decorators.csrf import ensure_csrf_cookie
# Imports de la bibliothèque standard Python
from urllib.parse import urlencode
from django.db import transaction
from .models import CustomUser
from django.contrib.auth import login
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

import logging
import json

# Imports tiers
import requests


AUTH_URL = "https://api.intra.42.fr/oauth/authorize"
TOKEN_URL = "https://api.intra.42.fr/oauth/token"
USER_INFO_URL = "https://api.intra.42.fr/v2/me"

logger = logging.getLogger(__name__)
User = get_user_model()


@csrf_exempt
@ensure_csrf_cookie
def get_auth_url(request):
    if request.method == "OPTIONS":
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "https://localhost:4430"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    try:
        logger.info("Generating 42 authentication URL")

        auth_url = (
            'https://api.intra.42.fr/oauth/authorize'
            f'?client_id={settings.FORTYTWO_CLIENT_ID}'
            f'&redirect_uri={settings.FORTYTWO_REDIRECT_URI}'
            '&response_type=code'
            '&scope=public'
        )

        logger.info(f"Generated auth URL: {auth_url}")

        response = JsonResponse({
            'success': True,
            'auth_url': auth_url
        })

        # Ajout manuel des headers CORS
        response["Access-Control-Allow-Origin"] = "https://localhost:4430"
        response["Access-Control-Allow-Credentials"] = "true"

        return response

    except Exception as e:
        logger.error(f"Error generating auth URL: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

from django.http import JsonResponse
import requests
import logging

logger = logging.getLogger(__name__)

# @api_view(['GET'])
# @permission_classes([AllowAny])
# def callback_42(request):
#     try:
#         code = request.GET.get('code')
#         if not code:
#             logger.error("No authorization code received")
#             return JsonResponse({
#                 'success': False,
#                 'message': 'No authorization code received'
#             }, status=400)

#         # Échange du code contre un token
#         token_url = 'https://api.intra.42.fr/oauth/token'
#         token_data = {
#             'grant_type': 'authorization_code',
#             'client_id': settings.FORTYTWO_CLIENT_ID,
#             'client_secret': settings.FORTYTWO_CLIENT_SECRET,
#             'code': code,
#             'redirect_uri': settings.FORTYTWO_REDIRECT_URI
#         }

#         try:
#             token_response = requests.post(token_url, data=token_data, timeout=10)
#             token_response.raise_for_status()
#         except requests.exceptions.RequestException as e:
#             logger.error(f"Token exchange failed: {str(e)}")
#             return JsonResponse({
#                 'success': False,
#                 'message': 'Failed to exchange authorization code'
#             }, status=400)

#         access_token = token_response.json().get('access_token')

#         try:
#             user_response = requests.get(
#                 'https://api.intra.42.fr/v2/me',
#                 headers={'Authorization': f'Bearer {access_token}'},
#                 timeout=10
#             )
#             user_response.raise_for_status()
#             user_data = user_response.json()

#         except requests.exceptions.RequestException as e:
#             logger.error(f"Failed to get user info: {str(e)}")
#             return JsonResponse({
#                 'success': False,
#                 'message': 'Failed to get user information'
#             }, status=400)

#         try:
#             # Chercher l'utilisateur par intra_42_id
#             user = CustomUser.objects.filter(intra_42_id=user_data['id']).first()

#             if user is None:
#                 # Si non trouvé, chercher par email
#                 existing_user = CustomUser.objects.filter(email=user_data['email']).first()

#                 if existing_user:
#                     # Mettre à jour l'utilisateur existant avec les infos 42
#                     existing_user.intra_42_id = user_data['id']
#                     existing_user.is_42_user = True
#                     existing_user.save()
#                     user = existing_user
#                     logger.info(f"Updated existing user with 42 data: {user.username}")
#                 else:
#                     # Créer un nouvel utilisateur
#                     user = CustomUser.objects.create_user(
#                         username=user_data['login'],
#                         email=user_data['email'],
#                         password=CustomUser.objects.make_random_password(),
#                         intra_42_id=user_data['id'],
#                         is_42_user=True,
#                         avatar='assets/avatars/ladybug.png'  # Utilise la valeur par défaut
#                     )
#                     logger.info(f"Created new user from 42 data: {user.username}")

#             # Connecter l'utilisateur
#             user.backend = 'django.contrib.auth.backends.ModelBackend'
#             login(request, user)

#             # Générer les tokens JWT comme dans votre login classique
#             refresh = RefreshToken.for_user(user)
#             access_token = str(refresh.access_token)
#             refresh_token = str(refresh)

#             # Création des données pour la réponse
#             response_data = {
#                 'success': True,
#                 'message': 'Authentication successful',
#                 'user': {
#                     'id': user.id,
#                     'username': user.username,
#                     'email': user.email,
#                     'is_42_user': user.is_42_user,
#                     'avatar': user.avatar.url
#                 },
#                 # 'access': str(refresh.access_token),
#                 # 'refresh': str(refresh)
#             }
#             # set_jwt_cookies(response_data, access_token, refresh_token)


#             # # Retourner une page HTML avec les données et la redirection
#             # return HttpResponse(f"""
#             #     <!DOCTYPE html>
#             #     <html>
#             #         <head>
#             #             <title>Authentication Successful</title>
#             #             <script>
#             #                 console.log('Processing authentication response...');

#             #                 // Les données de l'authentification
#             #                 const authData = {json.dumps(response_data)};

#             #                 // Stocker les tokens
#             #                 localStorage.setItem('access_token', authData.access);
#             #                 localStorage.setItem('refresh_token', authData.refresh);

#             #                 // Stocker les données utilisateur
#             #                 localStorage.setItem('user_data', JSON.stringify(authData.user));

#             #                 if (window.opener) {{
#             #                     // Envoyer un message à la fenêtre principale
#             #                     console.log('Sending success message to main window...');
#             #                     window.opener.postMessage({{
#             #                         type: 'auth_success',
#             #                         data: authData
#             #                     }}, 'https://localhost:4430');

#             #                     // Rediriger la fenêtre principale
#             #                     console.log('Redirecting main window...');
#             #                     window.opener.location.href = 'https://localhost:4430/home';

#             #                     // Fermer cette fenêtre après un court délai
#             #                     setTimeout(() => {{
#             #                         console.log('Closing popup window...');
#             #                         window.close();
#             #                     }}, 300);
#             #                 }}
#             #             </script>
#             #         </head>
#             #         <body>
#             #             <h1>Authentication Successful!</h1>
#             #             <p>Redirecting...</p>
#             #         </body>
#             #     </html>
#             # """)

#             response = HttpResponse(f"""
#                 <!DOCTYPE html>
#                 <html>
#                     <head>
#                         <title>Authentication Successful</title>
#                         <script>
#                             if (window.opener) {{
#                                 // Envoyer un message à la fenêtre principale
#                                 console.log('Sending success message to main window...');
#                                 window.opener.postMessage({{
#                                     type: 'auth_success'
#                                 }}, 'https://localhost:4430');

#                                 // Rediriger la fenêtre principale
#                                 console.log('Redirecting main window...');
#                                 window.opener.location.href = 'https://localhost:4430/home';

#                                 // Fermer cette fenêtre après un court délai
#                                 setTimeout(() => {{
#                                     console.log('Closing popup window...');
#                                     window.close();
#                                 }}, 300);
#                             }}
#                         </script>
#                     </head>
#                     <body>
#                         <h1>Authentication Successful!</h1>
#                         <p>Redirecting...</p>
#                     </body>
#                 </html>
#             """)

#         # Définir les cookies de jetons sur la réponse HTML
#         set_jwt_cookies(response, access_token, refresh_token)
#         return response


#         except Exception as e:
#             logger.error(f"Database error: {str(e)}")
#             return JsonResponse({
#                 'success': False,
#                 'message': f'Database error: {str(e)}'
#             }, status=500)

#     except Exception as e:
#         logger.exception(f"Unexpected error in callback_42: {str(e)}")
#         return JsonResponse({
#             'success': False,
#             'message': f'Unexpected error: {str(e)}'
#         }, status=500)

from django.core.files.base import ContentFile

@api_view(['GET'])
@permission_classes([AllowAny])
def callback_42(request):
    try:
        code = request.GET.get('code')
        if not code:
            logger.error("No authorization code received")
            return JsonResponse({
                'success': False,
                'message': 'No authorization code received'
            }, status=400)

        # Échange du code contre un token
        token_url = 'https://api.intra.42.fr/oauth/token'
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.FORTYTWO_CLIENT_ID,
            'client_secret': settings.FORTYTWO_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.FORTYTWO_REDIRECT_URI
        }

        try:
            token_response = requests.post(token_url, data=token_data, timeout=10)
            token_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"Token exchange failed: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': 'Failed to exchange authorization code'
            }, status=400)

        access_token = token_response.json().get('access_token')

        try:
            user_response = requests.get(
                'https://api.intra.42.fr/v2/me',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            user_response.raise_for_status()
            user_data = user_response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get user info: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': 'Failed to get user information'
            }, status=400)

        try:
            # Récupérer l'URL de l'avatar depuis l'API 42
            avatar_url = user_data.get('image', {}).get('versions', {}).get('large')
            logger.info(f"Found avatar URL: {avatar_url}")

            # Chercher l'utilisateur par intra_42_id
            user = CustomUser.objects.filter(intra_42_id=user_data['id']).first()
            
            if user is None:
                # Si non trouvé, chercher par email
                existing_user = CustomUser.objects.filter(email=user_data['email']).first()
                
                if existing_user:
                    existing_user.intra_42_id = user_data['id']
                    existing_user.is_42_user = True
                    user = existing_user
                else:
                    user = CustomUser.objects.create_user(
                        username=user_data['login'],
                        email=user_data['email'],
                        password=CustomUser.objects.make_random_password(),
                        intra_42_id=user_data['id'],
                        is_42_user=True,
                        avatar='assets/avatars/ladybug.png'
                    )

            # Télécharger et sauvegarder l'avatar si disponible
            if avatar_url:
                try:
                    logger.info(f"Attempting to download avatar from: {avatar_url}")
                    avatar_response = requests.get(avatar_url, timeout=10)
                    
                    if avatar_response.status_code == 200:
                        logger.info("Avatar download successful")
                        
                        # Créer un nom de fichier unique
                        file_name = f"42_avatar_{user.username}_{user.id}.jpg"
                        
                        # Sauvegarder l'image
                        user.avatar.save(
                            file_name,
                            ContentFile(avatar_response.content),
                            save=True
                        )
                        logger.info(f"Avatar saved to: {user.avatar.path}")
                    else:
                        logger.error(f"Failed to download avatar. Status code: {avatar_response.status_code}")
                
                except Exception as e:
                    logger.error(f"Failed to save avatar: {str(e)}")
                    logger.exception("Detailed error:")

            # Connecter l'utilisateur
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)

            # Générer les tokens JWT comme dans votre login classique
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Préparer la réponse HTML avec les données
            response = HttpResponse(f"""
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Authentication Successful</title>
                        <script>
                            if (window.opener) {{
                                // Envoyer un message à la fenêtre principale
                                console.log('Sending success message to main window...');
                                window.opener.postMessage({{
                                    type: 'auth_success'
                                }}, 'https://localhost:4430');

                                // Rediriger la fenêtre principale
                                console.log('Redirecting main window...');
                                window.opener.location.href = 'https://localhost:4430/home';

                                // Fermer cette fenêtre après un court délai
                                setTimeout(() => {{
                                    console.log('Closing popup window...');
                                    window.close();
                                }}, 300);
                            }}
                        </script>
                    </head>
                    <body>
                        <h1>Authentication Successful!</h1>
                        <p>Redirecting...</p>
                    </body>
                </html>
            """)

            # Définir les cookies de jetons sur la réponse HTML
            set_jwt_cookies(response, access_token, refresh_token)
            return response

        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': f'Database error: {str(e)}'
            }, status=500)

    except Exception as e:
        logger.exception(f"Unexpected error in callback_42: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Unexpected error: {str(e)}'
        }, status=500)



@login_required
def check_auth(request):
    try:
        user = request.user
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_42_user': getattr(user, 'is_42_user', False),
            }
        })
    except Exception as e:
        logger.error(f"Error in check_auth: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=401)


#######################################2FA views#####################################################################

# Imports nécessaires
from django.core.mail import send_mail  # Pour envoyer des emails
from django.conf import settings        # Pour accéder aux paramètres
from django.utils import timezone       # Pour la gestion des timestamps
from datetime import timedelta         # Pour la durée de validité du code
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import random                          # Pour générer le code
import string                          # Pour générer le code

class Toggle2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        action = request.data.get('action')

        if action == 'enable':
            code = ''.join(random.choices(string.digits, k=6))
            user.two_factor_code = code
            user.two_factor_code_timestamp = timezone.now()
            user.save()

            # Utiliser la nouvelle fonction d'envoi d'email
            if send_2fa_email(user, code):
                return Response({
                    'message': 'Code de vérification envoyé par email'
                })
            else:
                return Response(
                    {'error': "Erreur lors de l'envoi de l'email"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        elif action == 'disable':
            if user.is_2fa_enabled:
                user.is_2fa_enabled = False
                user.two_factor_code = None
                user.two_factor_code_timestamp = None
                user.save()
                return Response({
                    'message': '2FA désactivé avec succès',
                    'is_2fa_enabled': False
                })

            return Response({
                'error': "2FA n'est pas activé"
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'error': "Action non valide"
        }, status=status.HTTP_400_BAD_REQUEST)


def send_2fa_email(user, code):
    try:
        print(f"Envoi du code 2FA à {user.email}")

        context = {
            'username': user.username,
            'code': code,
            'valid_minutes': 10,
            'support_email': settings.DEFAULT_FROM_EMAIL
        }

        html_message = render_to_string('email/2fa_code.html', context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject='[Pong42] Code de vérification 2FA',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"Email 2FA envoyé avec succès à {user.email}")
        return True

    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email 2FA: {str(e)}")
        return False


class Verify2FAView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')

        if not code:
            return Response(
                {'error': 'Code requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier si le code est toujours valide (10 minutes)
        if user.two_factor_code_timestamp and \
           timezone.now() > user.two_factor_code_timestamp + timedelta(minutes=10):
            return Response(
                {'error': 'Code expiré'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if code == user.two_factor_code:
            user.is_2fa_enabled = True
            user.two_factor_code = None
            user.two_factor_code_timestamp = None
            user.save()
            return Response({'message': '2FA activé avec succès'})

        return Response(
            {'error': 'Code invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )


from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class TestEmailView(APIView):
    def get(self, request):
        try:
            print("Tentative d'envoi d'email avec les paramètres suivants:")
            print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
            print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
            print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
            print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
            print(f"FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

            # Contexte pour le template
            context = {
                'username': 'Test User',
                'code': '123456',  # Code de test
                'valid_minutes': 10,
                'support_email': settings.DEFAULT_FROM_EMAIL
            }

            # Créer les versions HTML et texte de l'email
            html_message = render_to_string('email/2fa_code.html', context)
            plain_message = strip_tags(html_message)

            send_mail(
                subject='[Pong42] Test Email - Code 2FA',
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['chsiffre@student.42lyon.fr'],
                html_message=html_message,
                fail_silently=False,
            )

            # Garder les informations de debug dans la réponse
            return Response({
                'message': 'Email de test envoyé avec succès!',
                'email_host': settings.EMAIL_HOST,
                'email_port': settings.EMAIL_PORT,
                'email_use_tls': settings.EMAIL_USE_TLS,
                'from_email': settings.DEFAULT_FROM_EMAIL,
                'template_context': context  # Ajouter le contexte pour vérification
            })

        except Exception as e:
            print(f"Erreur détaillée: {str(e)}")
            return Response({
                'error': f'Erreur lors de l\'envoi: {str(e)}',
                'error_type': type(e).__name__,
                'email_host': settings.EMAIL_HOST,
                'email_port': settings.EMAIL_PORT,
                'email_use_tls': settings.EMAIL_USE_TLS,
                'from_email': settings.DEFAULT_FROM_EMAIL
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def send_2fa_email(user, code):
    try:
        print(f"Envoi du code 2FA à {user.email}")

        context = {
            'username': user.username,
            'code': code,
            'valid_minutes': 10,
            'support_email': settings.DEFAULT_FROM_EMAIL
        }

        html_message = render_to_string('email/2fa_code.html', context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject='[Pong42] Code de vérification 2FA',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"Email 2FA envoyé avec succès à {user.email}")
        return True

    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email 2FA: {str(e)}")
        return False




@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa_login(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        code = data.get('code')

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Utilisateur non trouvé'
            }, status=404)

        # Vérifier si le code est expiré (10 minutes)
        if timezone.now() > user.two_factor_code_timestamp + timedelta(minutes=10):
            return JsonResponse({
                'success': False,
                'message': 'Code expiré'
            }, status=400)

        if code == user.two_factor_code:
            # Code valide, générer les tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Nettoyer le code 2FA
            user.two_factor_code = None
            user.two_factor_code_timestamp = None
            user.save()

            logger.info(f"2FA validé pour l'utilisateur: {user.email}")
            response = JsonResponse({
                'success': True,
                'message': 'Login successful',
                # 'access': access_token,
                # 'refresh': refresh_token
            })
            set_jwt_cookies(response, access_token, refresh_token)
            return response
        else:
            return JsonResponse({
                'success': False,
                'message': 'Code invalide'
            }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.error(f"Erreur lors de la vérification 2FA : {str(e)}")
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

#######################################2FA views#####################################################################




# @login_required
# def profile_view(request):
#     try:
#         user = request.user
#         # Vérifier si l'utilisateur est authentifié
#         if user.is_authenticated:
#             return JsonResponse({
#                 'success': True,
#                 'user': {
#                     'id': user.id,
#                     'username': user.username,
#                     'email': user.email,
#                     'avatar': user.avatar.url if user.avatar else None,
#                     'is_42_user': user.is_42_user,
#                     'first_name': user.first_name,
#                     'last_name': user.last_name,
#                 }
#             })
#         else:
#             return JsonResponse({
#                 'success': False,
#                 'error': 'User not authenticated'
#             }, status=401)
#     except Exception as e:
#         return JsonResponse({
#             'success': False,
#             'error': str(e)
#         }, status=500)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .models import GameHistory
import json
import logging

logger = logging.getLogger(__name__)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])  # S'assure que l'utilisateur est authentifié
# def record_game(request):
#     logger.info("Appel de record_game")
    
#     # Charger les données JSON envoyées par le frontend
#     data = request.data
#     logger.info(f"Données reçues pour record_game: {data}")

#     score_user = data.get('score_user')
#     score_opponent = data.get('score_opponent')
#     result = data.get('result')  # True pour victoire, False pour défaite

#     # Vérifier que les données sont présentes
#     if score_user is None or score_opponent is None or result is None:
#         return JsonResponse({'error': 'Missing data'}, status=400)

#     # Créer un nouvel enregistrement de partie pour l'utilisateur connecté
#     game = GameHistory.objects.create(
#         user=request.user,  # L'utilisateur connecté est associé comme `player1`
#         score_user=score_user,
#         score_opponent=score_opponent,
#         result=result
#     )

#     # Retourner une réponse JSON pour confirmer l'enregistrement
#     return JsonResponse({'message': 'Game recorded successfully', 'game_id': game.id})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_game(request):
    logger.info("Appel de record_game")

    data = request.data
    score_user = data.get('score_user')
    score_opponent = data.get('score_opponent')
    result = data.get('result')
    opponent_id = data.get('opponent_id')  # ID de l'opposant si enregistré
    opponent_name = data.get('opponent_name', 'IA')  # Nom de l'opposant, par défaut "IA"

    # Vérifier que les données sont présentes
    if score_user is None or score_opponent is None or result is None:
        return JsonResponse({'error': 'Missing data'}, status=400)

    # Trouver l'opposant si c'est un utilisateur enregistré
    opponent_user = None
    if opponent_id:
        try:
            opponent_user = CustomUser.objects.get(id=opponent_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'Opponent user not found'}, status=404)

    # Créer un nouvel enregistrement de partie
    game = GameHistory.objects.create(
        user=request.user,
        score_user=score_user,
        score_opponent=score_opponent,
        result=result,
        opponent_user=opponent_user,  # Opposant enregistré
        opponent_name=opponent_name if not opponent_user else None  # Nom si opposant temporaire ou IA
    )

    return JsonResponse({'message': 'Game recorded successfully', 'game_id': game.id})


# views.py

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import GameHistory

# @api_view(['GET'])  # Accepter uniquement les requêtes GET
# @permission_classes([IsAuthenticated])
# def match_history(request):
#     games = GameHistory.objects.filter(user=request.user).order_by('-date_played')
#     history = []
#     for game in games:
#         history.append({
#             'score_user': game.score_user,
#             'score_opponent': game.score_opponent,
#             'result': "VICTORY" if game.result else "DEFEAT",
#             'opponent_avatar': game.opponent_user.avatar.url if game.opponent_user and game.opponent_user.avatar else '/static/assets/avatars/default.png',
#             'user_avatar': request.user.avatar.url if request.user.avatar else '/static/assets/avatars/default.png'
#         })
#     return JsonResponse({'history': history})


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def match_history(request):
#     games = GameHistory.objects.filter(user=request.user).order_by('-date_played')
#     history = []

#     for game in games:
#         # Récupérer l'avatar de l'utilisateur
#         user_avatar = request.user.avatar.url if request.user.avatar else 'assets/avatars/ladybug.png'

#         # Récupérer l'avatar de l'adversaire
#         if game.opponent_user:
#             opponent_avatar = game.opponent_user.avatar.url if game.opponent_user.avatar else 'assets/avatars/clown-fish.png'
#         else:
#             # Dans le cas où l'adversaire n'est pas un utilisateur réel, on peut définir un avatar générique
#             opponent_avatar = '/static/assets/avatars/crabe.png'

#         history.append({
#             'score_user': game.score_user,
#             'score_opponent': game.score_opponent,
#             'result': "VICTORY" if game.result else "DEFEAT",
#             'opponent_avatar': opponent_avatar,
#             'user_avatar': user_avatar
#         })

#     return JsonResponse({'history': history})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_history(request):
    games = GameHistory.objects.filter(user=request.user).order_by('-date_played')
    history = []

    for game in games:
        # Récupérer l'avatar de l'utilisateur
        if request.user.avatar:
            if str(request.user.avatar).startswith('assets/avatars/'):
                # Si l'avatar est dans STATIC_URL
                user_avatar = f"/static/{request.user.avatar}"
            else:
                # Si l'avatar est dans MEDIA_URL
                user_avatar = request.user.avatar.url
        else:
            # Si aucun avatar n'est défini, mettre un avatar par défaut
            user_avatar = '/static/assets/avatars/ladybug.png'

        # Récupérer l'avatar de l'adversaire
        if game.opponent_user:
            if game.opponent_user.avatar:
                if str(game.opponent_user.avatar).startswith('assets/avatars/'):
                    # Si l'avatar est dans STATIC_URL
                    opponent_avatar = f"/static/{game.opponent_user.avatar}"
                else:
                    # Si l'avatar est dans MEDIA_URL
                    opponent_avatar = game.opponent_user.avatar.url
            else:
                # Dans le cas où l'adversaire n'a pas d'avatar, définir un avatar générique
                opponent_avatar = '/static/assets/avatars/clown-fish.png'
        else:
            # Si l'adversaire n'est pas un utilisateur réel, définir un avatar générique
            opponent_avatar = '/static/assets/avatars/crabe.png'

        history.append({
            'score_user': game.score_user,
            'score_opponent': game.score_opponent,
            'result': "VICTORY" if game.result else "DEFEAT",
            'opponent_avatar': opponent_avatar,
            'user_avatar': user_avatar
        })

    return JsonResponse({'history': history})


from django.http import JsonResponse
from django.db.models import Count, F, Q, Avg, Max
from .models import GameHistory


# Vue pour récupérer les statistiques de l'utilisateur
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_statistics(request):
    user = request.user

    # Nombre de parties jouées
    total_games = GameHistory.objects.filter(user=user).count()

    # Nombre de victoires
    total_wins = GameHistory.objects.filter(user=user, result=True).count()

    # Calcul du ratio victoires
    win_ratio = (total_wins / total_games * 100) if total_games > 0 else 0

    # Rank basé sur le ratio de victoires
    if win_ratio <= 33:
        rank = "*"
    elif win_ratio <= 66:
        rank = "**"
    else:
        rank = "***"

    # Calcul des autres statistiques (par exemple, power catch, ball speed, longest rally)
    # Ces champs doivent être définis dans votre modèle pour être récupérés
    power_catch_avg = GameHistory.objects.filter(user=user).aggregate(Avg('power_catch'))['power_catch__avg']
    ball_speed_avg = GameHistory.objects.filter(user=user).aggregate(Avg('ball_speed'))['ball_speed__avg']
    longest_rally = GameHistory.objects.filter(user=user).aggregate(Max('longest_rally'))['longest_rally__max']

    # Retourner les statistiques sous forme de JsonResponse
    statistics = {
        'rank': rank,
        'total_games': total_games,
        'total_wins': total_wins,
        'win_ratio': win_ratio,
        'power_catch_avg': power_catch_avg or 0,  # Valeur par défaut si aucune donnée
        'ball_speed_avg': ball_speed_avg or 0,    # Valeur par défaut si aucune donnée
        'longest_rally': longest_rally or 0       # Valeur par défaut si aucune donnée
    }

    return JsonResponse(statistics, status=200)
