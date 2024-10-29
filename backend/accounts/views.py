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
