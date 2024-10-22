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


## Vue pour l'inscription avec gestion des erreurs et création de token JWT
#@api_view(['POST'])
#@permission_classes([AllowAny])  # Inscription doit être accessible à tous
#def register_view(request):
#    try:
#        logger.info("Requête d'inscription reçue")
#        data = json.loads(request.body)
#
#        register_form = RegisterForm(data)
#        if register_form.is_valid():
#            user = register_form.save()
#            logger.info(f"Utilisateur créé : {user.username}")
#            
#            # Générer les tokens JWT
#            refresh = RefreshToken.for_user(user)
#            return JsonResponse({
#                'success': True,
#                'message': 'User registered successfully',
#                'access': str(refresh.access_token),
#                'refresh': str(refresh)
#            }, status=201)
#        else:
#            logger.warning(f"Erreurs dans le formulaire : {register_form.errors}")
#            return JsonResponse({
#                'success': False,
#                'message': 'Form is not valid',
#                'errors': register_form.errors
#            }, status=400)
#
#    except json.JSONDecodeError:
#        logger.error("Erreur de parsing JSON")
#        return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)
#    except IntegrityError as e:
#        logger.error(f"Erreur d'intégrité : {str(e)}")
#        return JsonResponse({
#            'success': False,
#            'message': f'Integrity error: {str(e)}'
#        }, status=400)
#    except Exception as e:
#        logger.exception(f"Erreur inattendue : {str(e)}")
#        return JsonResponse({
#            'success': False,
#            'message': f'Unexpected error: {str(e)}'
#        }, status=500)


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
            f'?client_id={UID}'
            f'&redirect_uri={REDIRECT_URI}'
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

def callback_42(request):
    try:
        code = request.GET.get('code')
        if not code:
            return HttpResponse("""
                <script>
                    window.close();
                </script>
                <h1>No code provided</h1>
            """)
        error = request.GET.get('error')

        # Gestion des erreurs de l'API 42
        if error:
            logger.error(f"OAuth error: {error}")
            return JsonResponse({
                'success': False,
                'error': error
            }, status=400)

        # Vérification du code
        if not code:
            logger.error("No authorization code received")
            return JsonResponse({
                'success': False,
                'error': 'No authorization code received'
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

        if token_response.status_code != 200:
            logger.error(f"Token exchange failed: {token_response.text}")
            return JsonResponse({
                'success': False,
                'error': 'Token exchange failed'
            }, status=500)

        # Extraction du token
        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            logger.error("No access token in response")
            return JsonResponse({
                'success': False,
                'error': 'No access token received'
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
                'success': False,
                'error': 'Failed to get user info'
            }, status=500)

        # Traitement des données utilisateur
        user_data = user_response.json()
    
        return HttpResponse(f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authentication Successful</title>
                <script>
                    console.log('Setting completion cookie...');
                    // Définir le cookie avec les bons attributs
                    document.cookie = "auth_complete=true; path=/; SameSite=Lax; Secure";
                    
                    // Envoyer un message à la fenêtre principale
                    if (window.opener) {{
                        try {{
                            window.opener.postMessage({{ type: 'auth_success' }}, 'https://localhost:4430');
                        }} catch (e) {{
                            console.error('Error sending message:', e);
                        }}
                    }}
                    
                    // Fermer après un court délai
                    setTimeout(() => {{
                        console.log('Closing popup...');
                        window.close();
                        
                        // Si la fenêtre ne se ferme pas, forcer la redirection
                        setTimeout(() => {{
                            window.location.href = 'about:blank';
                        }}, 100);
                    }}, 500);
                </script>
            </head>
            <body>
                <h1>Authentication Successful!</h1>
                <p>This window will close automatically...</p>
                <p>If not redirected, <a href="https://localhost:4430/home">click here</a></p>
            </body>
            </html>
        """)

    except Exception as e:
        logger.error(f"Callback error: {str(e)}")
        return HttpResponse(f"""
            <script>
                window.close();
            </script>
            <h1>Authentication failed: {str(e)}</h1>
        """)
