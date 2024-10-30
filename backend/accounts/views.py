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




logger = logging.getLogger(__name__)

# Vue pour la page d'accueil (login/register)
@api_view(['GET'])
@permission_classes([AllowAny])  # Page publique
def index_view(request):
    login_form = LoginForm()
    register_form = RegisterForm()
    return render(request, 'index.html', {'login_form': login_form, 'register_form': register_form})


# Vue pour la connexion (utilisation des tokens JWT)
@api_view(['POST'])
@permission_classes([AllowAny])  # Connexion doit être accessible à tous
def login_view(request):
    try:
        # Récupérer les données JSON envoyées dans la requête
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        # Authentifier l'utilisateur
        user = authenticate(request, email=email, password=password)
        if user is not None:
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            print('access token:  ==> ', access_token)

            logger.info(f"Access token: {access_token}")
            logger.info(f"Refresh token: {refresh_token}")

            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'access' : access_token,
                'refresh': refresh_token
                #'access': str(refresh.access_token),
                #'refresh': str(refresh)
            }, status=200)
        else:
            return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)
    except Exception as e:
        logger.error(f"Erreur de connexion : {str(e)}")
        return JsonResponse({'success': False, 'message': str(e)}, status=500)


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

    # Gérer le chemin de l'avatar : 
    if user.avatar and user.avatar.name.startswith('assets/avatars/'):
        # Si l'avatar est dans le répertoire static
        avatar_url = f"/static/{user.avatar}"
    else:
        # Si l'avatar est un fichier uploadé (dans media)
        avatar_url = user.avatar.url if user.avatar else None

    # Renvoi des données de l'utilisateur avec l'URL de l'avatar
    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'avatar': avatar_url
    }, status=200)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    user = request.user
    data = request.data

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

        # Optionnel : Valider le type de fichier (seulement PNG ou JPEG)
        valid_image_extensions = ['png', 'jpg', 'jpeg']
        ext = avatar.name.split('.')[-1].lower()
        if ext not in valid_image_extensions:
            return JsonResponse({'error': 'Seuls les fichiers PNG, JPG ou JPEG sont acceptés.'}, status=400)

        # Attribuer l'avatar uploadé à l'utilisateur (Django gérera l'upload dans le dossier MEDIA_ROOT)
        user.avatar = avatar

    try:
        user.save()  # Sauvegarder les modifications dans la base de données
    except Exception as e:
        return JsonResponse({'error': 'Une erreur s\'est produite lors de la mise à jour du profil.'}, status=500)

    # Gérer le chemin de l'avatar : 
    if user.avatar and user.avatar.name.startswith('assets/avatars/'):
        avatar_url = f"/static/{user.avatar}"
    else:
        avatar_url = f"/media/{user.avatar}"

    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'avatar': avatar_url  # Renvoie l'URL correcte de l'avatar
    }, status=200)



@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Accessible uniquement pour les utilisateurs authentifiés
def logout_view(request):
    try:
        # Récupérer le refresh token de la requête
        refresh_token = request.data.get('refresh_token')

        if not refresh_token:
            return JsonResponse({'success': False, 'message': 'Refresh token is required'}, status=400)

        # Invalider le refresh token
        try:
            refresh_token_instance = RefreshToken(refresh_token)
            refresh_token_instance.blacklist()
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error blacklisting refresh token: {str(e)}'}, status=500)

        return JsonResponse({'success': True, 'message': 'Logout successful'}, status=200)

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

from rest_framework_simplejwt.exceptions import TokenError

@api_view(['POST'])
def token_refresh_view(request):
    refresh_token = request.data.get('refresh')
    
    try:
        token = RefreshToken(refresh_token)
        
        # Vérifier si le token est blacklisté
        if token.check_blacklist():
            return JsonResponse({'error': 'Token is blacklisted'}, status=400)
        
        # Générer un nouveau token d'accès
        new_access_token = str(token.access_token)
        return JsonResponse({'access': new_access_token}, status=200)
        
    except TokenError as e:
        return JsonResponse({'error': 'Invalid token'}, status=400)

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
            # Chercher l'utilisateur par intra_42_id
            user = CustomUser.objects.filter(intra_42_id=user_data['id']).first()
            
            if user is None:
                # Si non trouvé, chercher par email
                existing_user = CustomUser.objects.filter(email=user_data['email']).first()
                
                if existing_user:
                    # Mettre à jour l'utilisateur existant avec les infos 42
                    existing_user.intra_42_id = user_data['id']
                    existing_user.is_42_user = True
                    existing_user.save()
                    user = existing_user
                    logger.info(f"Updated existing user with 42 data: {user.username}")
                else:
                    # Créer un nouvel utilisateur
                    user = CustomUser.objects.create_user(
                        username=user_data['login'],
                        email=user_data['email'],
                        password=CustomUser.objects.make_random_password(),
                        intra_42_id=user_data['id'],
                        is_42_user=True,
                        avatar='assets/avatars/ladybug.png'  # Utilise la valeur par défaut
                    )
                    logger.info(f"Created new user from 42 data: {user.username}")

            # Connecter l'utilisateur
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            
            # Générer les tokens JWT comme dans votre login classique
            refresh = RefreshToken.for_user(user)

            # Création des données pour la réponse
            response_data = {
                'success': True,
                'message': 'Authentication successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_42_user': user.is_42_user,
                    'avatar': user.avatar.url
                },
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }

            # Retourner une page HTML avec les données et la redirection
            return HttpResponse(f"""
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Authentication Successful</title>
                        <script>
                            console.log('Processing authentication response...');
                            
                            // Les données de l'authentification
                            const authData = {json.dumps(response_data)};
                            
                            // Stocker les tokens
                            localStorage.setItem('access_token', authData.access);
                            localStorage.setItem('refresh_token', authData.refresh);
                            
                            // Stocker les données utilisateur
                            localStorage.setItem('user_data', JSON.stringify(authData.user));
                            
                            if (window.opener) {{
                                // Envoyer un message à la fenêtre principale
                                console.log('Sending success message to main window...');
                                window.opener.postMessage({{
                                    type: 'auth_success',
                                    data: authData
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
            # Code existant pour l'activation...
            code = ''.join(random.choices(string.digits, k=6))
            user.two_factor_code = code
            user.two_factor_code_timestamp = timezone.now()
            user.save()

            message = f"""
            Bonjour {user.username},
            
            Voici votre code de vérification pour l'activation de la 2FA : {code}
            
            Ce code est valable pendant 10 minutes.
            """

            try:
                send_mail(
                    subject='Code de vérification 2FA',
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                return Response({
                    'message': 'Code de vérification envoyé par email'
                })
            except Exception as e:
                print(f"Erreur d'envoi d'email: {e}")
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
        
        # Si l'action n'est ni 'enable' ni 'disable'
        return Response({
            'error': "Action non valide"
        }, status=status.HTTP_400_BAD_REQUEST)


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

class TestEmailView(APIView):
    def get(self, request):
        try:
            print("Tentative d'envoi d'email avec les paramètres suivants:")
            print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
            print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
            print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
            print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
            print(f"FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
            
            send_mail(
                subject='Test Email de Pong42',
                message='Ceci est un email de test pour vérifier la configuration SMTP.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['chsiffre@student.42lyon.fr'],
                fail_silently=False,
            )
            return Response({
                'message': 'Email de test envoyé avec succès!',
                'email_host': settings.EMAIL_HOST,
                'email_port': settings.EMAIL_PORT,
                'email_use_tls': settings.EMAIL_USE_TLS,
                'from_email': settings.DEFAULT_FROM_EMAIL
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