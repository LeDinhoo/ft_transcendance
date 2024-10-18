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
