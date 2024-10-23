#from django.contrib.auth import login, authenticate
#from django.contrib.auth.forms import UserCreationForm
#from django.shortcuts import render, redirect
#
#
#def register(request):
#    if request.method == 'POST':
#        form = UserCreationForm(request.POST)
#        if form.is_valid():
#            form.save()
#            username = form.cleaned_data.get('username')
#            password = form.cleaned_data.get('password1')
#            user = authenticate(username=username, password=password)
#            login(request, user)
#            return redirect('index')  # Redirection vers la page d'accueil après inscription
#    else:
#        form = UserCreationForm()
#    return render(request, 'accounts/register.html', {'form': form})
#
#def signin(request):
#    if request.method == 'POST':
#        username = request.POST['username']
#        password = request.POST['password']
#        user = authenticate(request, username=username, password=password)
#        if user is not None:
#            login(request, user)
#            return redirect('index')  # Redirection vers la page d'accueil après connexion
#        else:
#            return render(request, 'accounts/signin.html', {'error': 'Invalid username or password'})
#    return render(request, 'accounts/signin.html')
#
#def index(request):
#    return render(request, 'index.html')


#FICHIER AVANT INTEGRATION DES JWT

#import json
#from django.views.decorators.csrf import csrf_exempt
#from django.http import JsonResponse
#from django.db import IntegrityError  # Import de l'exception IntegrityError
#from django.contrib.auth import authenticate, login
#from django.shortcuts import render, redirect
#from .forms import RegisterForm, LoginForm
#import logging
#
#
## Vue pour la page d'accueil (login/register)
#def index_view(request):
#    login_form = LoginForm()
#    register_form = RegisterForm()
#    return render(request, 'index.html', {'login_form': login_form, 'register_form': register_form})
#
## Vue pour la connexion (avec gestion des requêtes JSON)
#@csrf_exempt
#def login_view(request):
#    if request.method == 'POST':
#        try:
#            # Récupérer les données JSON envoyées dans la requête
#            data = json.loads(request.body)
#            username = data.get('username')
#            password = data.get('password')
#            
#            # Authentifier l'utilisateur
#            user = authenticate(request, username=username, password=password)
#            if user is not None:
#                login(request, user)
#                return JsonResponse({'success': True, 'message': 'Login successful'})
#            else:
#                return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=401)
#        
#        except json.JSONDecodeError:
#            return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)
#        except Exception as e:
#            return JsonResponse({'success': False, 'message': str(e)}, status=500)
#
#    return JsonResponse({'success': False, 'message': 'Only POST method allowed'}, status=405)
#
#logger = logging.getLogger(__name__)
#import logging
#
#logger = logging.getLogger(__name__)
#
#@csrf_exempt
#def register_view(request):
#    print("coucou", flush=True)
#    if request.method == 'POST':
#        try:
#            logger.info("Requête d'inscription reçue")
#            data = json.loads(request.body)
#            logger.info(f"Données reçues : {data}")
#            
#            register_form = RegisterForm(data)
#            
#            if register_form.is_valid():
#                user = register_form.save()
#                logger.info(f"Utilisateur créé : {user.username}")
#                return JsonResponse({'success': True, 'message': 'User registered successfully'})
#            else:
#                logger.warning(f"Erreurs dans le formulaire : {register_form.errors}")
#                return JsonResponse({
#                    'success': False,
#                    'message': 'Form is not valid',
#                    'errors': register_form.errors
#                }, status=400)
#        except json.JSONDecodeError:
#            logger.error("Erreur de parsing JSON")
#            return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)
#        except IntegrityError as e:
#            logger.error(f"Erreur d'intégrité : {str(e)}")
#            return JsonResponse({
#                'success': False,
#                'message': f'Integrity error: {str(e)}'
#            }, status=400)
#        except Exception as e:
#            logger.exception(f"Erreur inattendue : {str(e)}")
#            return JsonResponse({
#                'success': False,
#                'message': f'Unexpected error: {str(e)}'
#            }, status=500)
#    return JsonResponse({
#        'success': False,
#        'message': 'Only POST method allowed'
#    }, status=405)
#
## Vue pour le jeu (accessible uniquement après connexion)
#def game_view(request):
#    if not request.user.is_authenticated:
#        return redirect('index')
#    return render(request, 'game.html')  # Page dédiée au jeu après connexion
#


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
from rest_framework_simplejwt.tokens import RefreshToken
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
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'access': str(refresh.access_token),
                'refresh': str(refresh)
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
                'access': str(refresh.access_token),
                'refresh': str(refresh)
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



#@api_view(['GET'])
#@permission_classes([IsAuthenticated])  # Vérifie que l'utilisateur est authentifié
#def profile_view(request):
#    print(request.headers) 
#    user = request.user
#
#    # Renvoyer uniquement le nom d'utilisateur et l'email
#    return JsonResponse({
#        'username': user.username,
#        'email': user.email,
#        'avatar': f"/static/{user.avatar}" if user.avatar else None  # Renvoie l'URL de l'avatar depuis le dossier static
#    }, status=200)
#

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

## Vue pour le jeu (accessible uniquement après authentification JWT)
#@api_view(['GET'])
#@permission_classes([IsAuthenticated])  # Protéger cette vue avec JWT
#def game_view(request):
#    return render(request, 'game.html')
#    #return JsonResponse({'message': 'Vous êtes authentifié et avez accès au jeu !'})



#@api_view(['PATCH'])
#@permission_classes([IsAuthenticated])
#def update_profile_view(request):
#    user = request.user
#    data = request.data
#
#    # Valider et mettre à jour le nom d'utilisateur si présent dans les données
#    if 'username' in data:
#        new_username = data['username']
#        if new_username.strip():  # Vérifie que le nom d'utilisateur n'est pas vide
#            user.username = new_username
#        else:
#            return JsonResponse({'error': 'Le nom d\'utilisateur ne peut pas être vide.'}, status=400)
#
#    # Valider et mettre à jour l'email si présent dans les données
#    if 'email' in data:
#        new_email = data['email']
#        try:
#            validate_email(new_email)  # Utilise le validateur intégré de Django
#            user.email = new_email
#        except ValidationError:
#            return JsonResponse({'error': 'L\'adresse email est invalide.'}, status=400)
#
##    if 'avatar' in data:
##        avatar = data['avatar']
##
##        # Optionnel : Vérification que l'avatar appartient à un ensemble prédéfini
##        avatar_path = os.path.join('static/assets/avatars/', avatar)
##        if not os.path.exists(avatar_path):
##            return JsonResponse({'error': 'Avatar non valide ou inexistant.'}, status=400)
##
##        # Mettre à jour l'avatar de l'utilisateur
##        user.avatar = avatar
##
#    # Gérer l'avatar uploadé si présent
#    if 'avatar' in request.FILES:
#        avatar = request.FILES['avatar']
#
#        # Optionnel : Valider le type de fichier (seulement PNG ou JPEG)
#        valid_image_extensions = ['png', 'jpg', 'jpeg']
#        ext = avatar.name.split('.')[-1].lower()
#        if ext not in valid_image_extensions:
#            return JsonResponse({'error': 'Seuls les fichiers PNG, JPG ou JPEG sont acceptés.'}, status=400)
#
#        # Attribuer l'avatar uploadé à l'utilisateur (Django gérera l'upload dans le dossier MEDIA_ROOT)
#        user.avatar = avatar
#
#    try:
#        user.save()  # Sauvegarder les modifications dans la base de données
#    except Exception as e:
#        return JsonResponse({'error': 'Une erreur s\'est produite lors de la mise à jour du profil.'}, status=500)
#
#    return JsonResponse({
#        'username': user.username,
#        'email': user.email,
#        'avatar': f"/media/{user.avatar}" if user.avatar else None  # Renvoie l'URL de l'avatar depuis le dossier static
#    }, status=200)
#


####ANCIENNE VERSION QUI FONCTIONNE SANS LES MOTS DE PASSE#######
#@api_view(['PATCH'])
#@permission_classes([IsAuthenticated])
#def update_profile_view(request):
#    user = request.user
#    data = request.data
#
#    # Valider et mettre à jour le nom d'utilisateur si présent dans les données
#    if 'username' in data:
#        new_username = data['username']
#        if new_username.strip():  # Vérifie que le nom d'utilisateur n'est pas vide
#            user.username = new_username
#        else:
#            return JsonResponse({'error': 'Le nom d\'utilisateur ne peut pas être vide.'}, status=400)
#
#    # Valider et mettre à jour l'email si présent dans les données
#    if 'email' in data:
#        new_email = data['email']
#        try:
#            validate_email(new_email)  # Utilise le validateur intégré de Django
#            user.email = new_email
#        except ValidationError:
#            return JsonResponse({'error': 'L\'adresse email est invalide.'}, status=400)
#
#    # Gérer l'avatar uploadé si présent
#    if 'avatar' in request.FILES:
#        avatar = request.FILES['avatar']
#
#        # Optionnel : Valider le type de fichier (seulement PNG ou JPEG)
#        valid_image_extensions = ['png', 'jpg', 'jpeg']
#        ext = avatar.name.split('.')[-1].lower()
#        if ext not in valid_image_extensions:
#            return JsonResponse({'error': 'Seuls les fichiers PNG, JPG ou JPEG sont acceptés.'}, status=400)
#
#        # Attribuer l'avatar uploadé à l'utilisateur (Django gérera l'upload dans le dossier MEDIA_ROOT)
#        user.avatar = avatar
#
#    try:
#        user.save()  # Sauvegarder les modifications dans la base de données
#    except Exception as e:
#        return JsonResponse({'error': 'Une erreur s\'est produite lors de la mise à jour du profil.'}, status=500)
#
#    # Gérer le chemin de l'avatar : 
#    if user.avatar and user.avatar.name.startswith('assets/avatars/'):
#        avatar_url = f"/static/{user.avatar}"
#    else:
#        avatar_url = f"/media/{user.avatar}"
#
#    return JsonResponse({
#        'username': user.username,
#        'email': user.email,
#        'avatar': avatar_url  # Renvoie l'URL correcte de l'avatar
#    }, status=200)
#

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

def game_view(request):
    # Authentifier l'utilisateur via JWT
    jwt_auth = JWTAuthentication()
    try:
        user, token = jwt_auth.authenticate(request)
    except AuthenticationFailed:
        return JsonResponse({'detail': 'Authentication failed'}, status=401)

    # Si l'authentification est réussie, rendre le template game.html
    return render(request, 'game.html')



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