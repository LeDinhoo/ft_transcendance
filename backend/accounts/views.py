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
from django.shortcuts import render
from .forms import RegisterForm, LoginForm
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

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


# Vue pour l'inscription avec gestion des erreurs et création de token JWT
@api_view(['POST'])
@permission_classes([AllowAny])  # Inscription doit être accessible à tous
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
                'errors': register_form.errors
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


## Vue pour le jeu (accessible uniquement après authentification JWT)
#@api_view(['GET'])
#@permission_classes([IsAuthenticated])  # Protéger cette vue avec JWT
#def game_view(request):
#    return render(request, 'game.html')
#    #return JsonResponse({'message': 'Vous êtes authentifié et avez accès au jeu !'})



def game_view(request):
    # Authentifier l'utilisateur via JWT
    jwt_auth = JWTAuthentication()
    try:
        user, token = jwt_auth.authenticate(request)
    except AuthenticationFailed:
        return JsonResponse({'detail': 'Authentication failed'}, status=401)

    # Si l'authentification est réussie, rendre le template game.html
    return render(request, 'game.html')


# Dans votre fichier views.py du backend

from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth import get_user_model, login

# Imports de la bibliothèque standard Python
from urllib.parse import urlencode
import logging
import json

# Imports tiers
import requests

UID = "u-s4t2ud-b1a5ece0fe08f8b2d1855de9824f719221dc07ba3f3815b6591ee841972b28b8"
SECRET = "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"
REDIRECT_URI = "https://localhost:4430/api/callback-42/"
AUTH_URL = "https://api.intra.42.fr/oauth/authorize"
TOKEN_URL = "https://api.intra.42.fr/oauth/token"
USER_INFO_URL = "https://api.intra.42.fr/v2/me"

logger = logging.getLogger(__name__)
User = get_user_model()

@require_http_methods(["GET"])
def get_auth_url(request):
    logger.info("get_auth_url view called")
    try:
        client_id = UID
        redirect_uri = REDIRECT_URI
        
        auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
        
        logger.info(f"Generated auth_url: {auth_url}")
        return redirect(auth_url)
    except Exception as e:
        logger.error(f"Error in get_auth_url: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
    
def callback_42(request):
    """
    Gère le callback de l'API 42 et échange le code contre un token
    """
    try:
        # Récupération du code d'autorisation
        code = request.GET.get('code')
        error = request.GET.get('error')

        # Gestion des erreurs de l'API 42
        if error:
            logger.error(f"OAuth error: {error}")
            return JsonResponse({
                'error': 'OAuth error',
                'detail': error
            }, status=400)

        # Vérification du code
        if not code:
            logger.error("No authorization code received")
            return JsonResponse({
                'error': 'No authorization code',
                'detail': 'Authorization code missing from callback'
            }, status=400)

        logger.info(f"Authorization code received: {code}")

        # Échange du code contre un token
        token_url = 'https://api.intra.42.fr/oauth/token'
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': UID,
            'client_secret': SECRET,
            'code': code,
            'redirect_uri': REDIRECT_URI
        }

        # Requête pour obtenir le token
        token_response = requests.post(
            token_url,
            data=token_data,
            timeout=10,
            verify=True
        )

        # Vérification de la réponse
        if token_response.status_code != 200:
            logger.error(f"Token exchange failed: {token_response.text}")
            return JsonResponse({
                'error': 'Token exchange failed',
                'detail': token_response.text
            }, status=500)

        # Extraction du token
        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            logger.error("No access token in response")
            return JsonResponse({
                'error': 'No access token',
                'detail': 'Access token missing from response'
            }, status=500)

        # Récupération des informations de l'utilisateur
        user_response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10
        )

        if user_response.status_code != 200:
            logger.error(f"User info request failed: {user_response.text}")
            return JsonResponse({
                'error': 'User info request failed',
                'detail': user_response.text
            }, status=500)

        # Traitement des données utilisateur
        user_data = user_response.json()
        
        # Stockez ici les informations de l'utilisateur dans votre système
        # Par exemple, créez ou mettez à jour l'utilisateur dans votre base de données
        
        # Redirection vers la page de succès avec les données de l'utilisateur
        return redirect({
            'success': True,
            'user': {
                'id': user_data.get('id'),
                'email': user_data.get('email'),
                'login': user_data.get('login'),
                'displayname': user_data.get('displayname')
            }
        })

    except requests.exceptions.RequestException as e:
        logger.error(f"Network error during authentication: {str(e)}")
        return JsonResponse({
            'error': 'Network error',
            'detail': str(e)
        }, status=500)
    except Exception as e:
        logger.error(f"Unexpected error in callback_42: {str(e)}")
        return JsonResponse({
            'error': 'Authentication failed',
            'detail': str(e)
        }, status=500)



import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

logger = logging.getLogger(__name__)
User = get_user_model()


class IntraBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        logger.info(f"IntraBackend: Attempting to authenticate user: {username}")
        try:
            user = User.objects.get(username=username)
            logger.info(f"IntraBackend: User found: {user.username}")
            logger.info(f"IntraBackend: User is_active: {user.is_active}")
            logger.info(f"IntraBackend: User is_staff: {user.is_staff}")
            logger.info(f"IntraBackend: User is_superuser: {user.is_superuser}")
            
            # Vérifiez si l'utilisateur peut s'authentifier
            can_authenticate = self.user_can_authenticate(user)
            logger.info(f"IntraBackend: User can authenticate: {can_authenticate}")
            
            if can_authenticate:
                return user
            else:
                logger.warning(f"IntraBackend: User {username} cannot authenticate")
                return None
        except User.DoesNotExist:
            logger.error(f"IntraBackend: User not found: {username}")
            return None

    def user_can_authenticate(self, user):
        can_authenticate = user.is_active
        logger.info(f"IntraBackend: Checking if user {user.username} can authenticate: {can_authenticate}")
        return can_authenticate

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
            logger.info(f"IntraBackend: Retrieved user: {user.username}")
            return user
        except User.DoesNotExist:
            logger.error(f"IntraBackend: User with id {user_id} not found")
            return None


# def home(request):
#     logger.info(f"Received {request.method} request to /home/")
#     logger.debug(f"Request headers: {request.headers}")
#     logger.debug(f"Request body: {request.body}")
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             code = data.get('code')
            
#             if not code:
#                 return JsonResponse({'error': 'No authorization code provided'}, status=400)
            
#             # Échange du code contre un token d'accès
#             token_response = requests.post('https://api.intra.42.fr/oauth/token', data={
                # 'grant_type': 'authorization_code',
                # 'client_id': 'YOUR_CLIENT_ID',
                # 'client_secret': 'YOUR_CLIENT_SECRET',
                # 'code': code,
                # 'redirect_uri': 'https://localhost:4430/home'
#             })
#             token_data = token_response.json()
            
#             # Utilisation du token pour obtenir les informations de l'utilisateur
#             user_response = requests.get('https://api.intra.42.fr/v2/me', headers={
#                 'Authorization': f"Bearer {token_data['access_token']}"
#             })
#             user_data = user_response.json()
            
#             # Ici, vous pouvez traiter les données de l'utilisateur
#             # Par exemple, créer ou mettre à jour l'utilisateur dans votre base de données
            
#             return JsonResponse({
#                 'success': True,
#                 'message': 'Authentication successful',
#                 'user_data': user_data
#             })
        
#         except json.JSONDecodeError:
#             logger.error("Invalid JSON received")
#             return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)
#         except requests.RequestException as e:
#             logger.error(f"Error during API request: {str(e)}")
#             return JsonResponse({'error': f'Error during API request: {str(e)}'}, status=400)
#         except Exception as e:
#             logger.error(f"Unexpected error: {str(e)}")
#             return JsonResponse({'error': f'An unexpected error occurred: {str(e)}'}, status=500)
    
#     elif request.method == "GET":
#         # Gérer la redirection initiale de l'API 42 si nécessaire
#         code = request.GET.get('code')
#         if code:
#             # Vous pouvez choisir de traiter le code ici ou de le renvoyer au frontend
#             return JsonResponse({"success": True, "message": "Code received", "code": code})
#         return JsonResponse({"success": True, "message": "Ready for authentication"})