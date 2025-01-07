# import json
# import logging
# from django.http import JsonResponse
# from django.db import IntegrityError
# from django.contrib.auth import authenticate
# from django.contrib.auth.hashers import check_password, make_password
# from django.shortcuts import render
# from .forms import RegisterForm, LoginForm
# from .validators import ComplexPasswordValidator
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
# from rest_framework.response import Response
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework import status
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework.exceptions import AuthenticationFailed
# from django.core.exceptions import ValidationError
# from django.core.validators import validate_email
# from django.conf import settings
# import os


# import random
# from django.utils import timezone
# from datetime import timedelta

# from django.template.loader import render_to_string
# from django.utils.html import strip_tags
# from rest_framework.response import Response
# from rest_framework import status
# from django.conf import settings
# import random
# import string
# from django.utils import timezone


# from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# from rest_framework_simplejwt.authentication import JWTAuthentication
# from rest_framework.response import Response
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status


# from rest_framework_simplejwt.tokens import RefreshToken

# logger = logging.getLogger(__name__)

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from django.http import JsonResponse
# from django.db import IntegrityError
# from rest_framework_simplejwt.tokens import RefreshToken
# from .forms import RegisterForm
# import logging
# import json

# logger = logging.getLogger(__name__)


# from django.http import JsonResponse
# from django.core.validators import validate_email
# from django.core.exceptions import ValidationError
# from django.contrib.auth.hashers import make_password, check_password
# from django.core.files.storage import default_storage
# from django.conf import settings
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# import os
# import magic
# from datetime import datetime
# import re

# import imghdr
# import magic
# from PIL import Image
# from io import BytesIO

# from PIL import Image
# from django.core.exceptions import ValidationError
# import io



# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.response import Response
# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.exceptions import AuthenticationFailed

# from rest_framework_simplejwt.exceptions import TokenError

# from django.http import JsonResponse, HttpResponse
# from django.shortcuts import redirect
# from django.views.decorators.http import require_http_methods
# from django.views.decorators.csrf import csrf_exempt
# from django.conf import settings
# from django.contrib.auth import get_user_model, login
# from django.views.decorators.csrf import ensure_csrf_cookie

# from urllib.parse import urlencode
# from django.db import transaction
# from .models import CustomUser
# from django.contrib.auth import login
# from django.contrib.auth import authenticate
# from django.contrib.auth.decorators import login_required

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny
# from rest_framework_simplejwt.tokens import RefreshToken

# import logging
# import json


# import requests


# from django.http import JsonResponse
# import requests
# import logging
# logger = logging.getLogger(__name__)
# User = get_user_model()
# logger = logging.getLogger(__name__)

# from django.core.files.base import ContentFile

# from django.core.mail import send_mail
# from django.conf import settings
# from django.utils import timezone
# from datetime import timedelta
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# import random
# import string

# from django.core.mail import send_mail
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.conf import settings
# from django.template.loader import render_to_string
# from django.utils.html import strip_tags


# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.http import JsonResponse
# from .models import GameHistory
# import json
# import logging

# logger = logging.getLogger(__name__)

# from json.decoder import JSONDecodeError
# import json
# from django.http import JsonResponse
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated



# from django.http import JsonResponse
# from django.contrib.auth.decorators import login_required
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from .models import GameHistory


# from django.http import JsonResponse
# from django.db.models import Count, F, Q, Avg, Max
# from .models import GameHistory

# from .models import FriendShip

# from django.http import JsonResponse
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# import json



# import logging
# logger = logging.getLogger(__name__)

# from django.db.models import Q


# import logging
# logger = logging.getLogger(__name__)

# from django.db.models import Q


# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.http import JsonResponse
# from rest_framework.parsers import JSONParser
# import json


# from .models import GameHostOptions
# from rest_framework.parsers import JSONParser
# from .models import UserSettings


# from django.http import JsonResponse
# from django.db import models
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from .models import CustomUser, GameHistory
# import logging
# logger = logging.getLogger(__name__)

# from django.http import JsonResponse
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# import json

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from django.http import JsonResponse




import json
import logging
from django.http import JsonResponse
from django.db import IntegrityError
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.shortcuts import render
from .forms import RegisterForm, LoginForm
from .validators import ComplexPasswordValidator
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


from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_check(request):
    """
    Vérifie si l'utilisateur est authentifié avec un token valide.
    """
    try:

        JWTAuthentication().authenticate(request)
        return Response({"authenticated": True}, status=status.HTTP_200_OK)

    except TokenError as e:

        return Response({"error": "tokenInvalid", "details": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:

        return Response({"error": "errorOccurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def index_view(request):
    # login_form = LoginForm()
    # register_form = RegisterForm()
    return render(request, 'index.html')


def set_jwt_cookies(response, access_token, refresh_token):

    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        secure=True,
        samesite='Strict'
    )
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='Strict'
    )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        logger.info("Requête de connexion reçue")

        # Charger et vérifier les données JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            logger.error("Erreur de parsing JSON")
            return JsonResponse({'success': False, 'message': 'InvalidJSON'}, status=400)

        # Liste des champs autorisés
        allowed_fields = {'email', 'password'}

        # Vérifier les champs supplémentaires
        extra_fields = set(data.keys()) - allowed_fields
        if extra_fields:
            logger.warning(f"Champs non autorisés détectés : {extra_fields}")
            return JsonResponse({
                'success': False,
                'message': 'Invalid fields in request',
                'invalid_fields': list(extra_fields)
            }, status=400)

        # Vérifier que les champs contiennent uniquement des chaînes de caractères
        for field, value in data.items():
            if not isinstance(value, str):
                logger.warning(f"Le champ '{field}' contient une valeur non textuelle : {type(value).__name__}")
                return JsonResponse({
                    'success': False,
                    'message': f"Le champ '{field}' doit être une chaîne de caractères."
                }, status=400)

        # Récupérer les valeurs
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        # Vérifier si les champs sont vides
        if not email or not password:
            logger.warning("Email ou mot de passe manquant")
            return JsonResponse({'success': False, 'message': 'EmailPwdRequired'}, status=400)

        # Authentifier l'utilisateur
        user = authenticate(request, email=email, password=password)
        if user is not None:
            if user.is_2fa_enabled:  
                code = ''.join([str(random.randint(0, 9)) for _ in range(6)])

                user.two_factor_code = code
                user.two_factor_code_timestamp = timezone.now()
                user.save()

                if send_2fa_email(user, code):
                    return JsonResponse({
                        'success': True,
                        'requires_2fa': True,
                        'user_id': user.id,
                        'message': 'Code 2FA envoyé'
                    })
                else:
                    logger.error(f"Échec de l'envoi de l'email 2FA pour l'utilisateur {user.email}")
                    return JsonResponse({
                        'success': False,
                        'message': 'Erreur lors de l\'envoi du code 2FA'
                    }, status=500)
            else:
                # Générer les tokens JWT
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                # Configurer la réponse avec les cookies JWT
                response = JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                }, status=200)
                set_jwt_cookies(response, access_token, refresh_token)
                return response
        else:
            logger.warning(f"Tentative de connexion échouée pour l'email : {email}")
            return JsonResponse({
                'success': False,
                'message': 'Invalid credentials'
            }, status=401)

    except Exception as e:
        logger.exception(f"Erreur inattendue lors de la connexion : {str(e)}")
        return JsonResponse({
            'success': False,
            'message': 'An unexpected error occurred'
        }, status=500)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from django.db import IntegrityError
from rest_framework_simplejwt.tokens import RefreshToken
from .forms import RegisterForm
import logging
import json

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        logger.info("Requête d'inscription reçue")

        # Charger et vérifier les données JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            logger.error("Erreur de parsing JSON")
            return JsonResponse({'success': False, 'message': 'Invalid JSON data'}, status=400)

        # Liste des champs autorisés
        allowed_fields = {'username', 'email', 'password1', 'password2'}

        # Vérifier les champs supplémentaires
        extra_fields = set(data.keys()) - allowed_fields
        if extra_fields:
            logger.warning(f"Champs non autorisés détectés : {extra_fields}")
            return JsonResponse({
                'success': False,
                'message': 'Invalid fields in request',
                'invalid_fields': list(extra_fields)
            }, status=400)

        # Vérifier que les champs contiennent uniquement du texte
        for field, value in data.items():
            if not isinstance(value, str):
                logger.warning(f"Le champ '{field}' contient une valeur non textuelle : {type(value).__name__}")
                return JsonResponse({
                    'success': False,
                    'message': f"Le champ '{field}' doit être une chaîne de caractères."
                }, status=400)

        # Validation des données avec le formulaire
        register_form = RegisterForm(data)
        if register_form.is_valid():
            user = register_form.save()
            logger.info(f"Utilisateur créé : {user.username}")

            # Générer les tokens JWT pour l'utilisateur
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'success': True,
                'message': 'User registered successfully',
            }, status=201)
        else:
            logger.warning(f"Erreurs dans le formulaire : {register_form.errors}")
            return JsonResponse({
                'success': False,
                'message': 'Form is not valid',
                'errors': register_form.errors.get_json_data()
            }, status=400)

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

    avatar_url = None
    if user.avatar:
        if str(user.avatar).startswith('assets/avatars/'):

            avatar_url = f"/static/{user.avatar}"
        else:

            avatar_url = f"/media/{user.avatar}"


    total_games = GameHistory.objects.filter(user=user).count()


    total_wins = GameHistory.objects.filter(user=user, result=True).count()


    win_ratio = (total_wins / total_games * 100) if total_games > 0 else 0


    response_data = {
        'username': user.username,
        'id': user.id,
        'email': user.email,
        'avatar': avatar_url,
        'is_2fa_enabled': user.is_2fa_enabled,
        'total_games': total_games,
        'win_ratio': win_ratio
    }

    return JsonResponse(response_data, status=200)

from django.http import JsonResponse
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
from django.core.files.storage import default_storage
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import os
import magic
from datetime import datetime
import re

import imghdr
import magic
from PIL import Image
from io import BytesIO

from PIL import Image
from django.core.exceptions import ValidationError
import io

def validate_image_thoroughly(image_file):
    try:
        # Copie du fichier en mémoire pour éviter les problèmes de buffer
        image_copy = io.BytesIO(image_file.read())
        image_file.seek(0)  # Remettre le pointeur au début pour usage ultérieur
        
        with Image.open(image_copy) as img:
            # Force le chargement complet de l'image
            img.load()
            
            # Essayer de convertir l'image
            img.convert('RGB')
            
            # Vérifier que l'image peut être parcourue
            list(img.getdata())  # Force l'accès aux données de l'image
            
            # Vérifier les métadonnées basiques
            if not hasattr(img, 'format') or img.format not in ['JPEG', 'PNG']:
                raise ValidationError("Format d'image non supporté (JPEG ou PNG uniquement)")
                
            # Essayer de créer une miniature pour vérifier que l'image est manipulable
            thumbnail = img.copy()
            thumbnail.thumbnail((100, 100))
            
            return True
    except Exception as e:
        raise ValidationError(f"Image corrompue ou invalide: {str(e)}")


logger = logging.getLogger('profile_api')

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    logger.debug("====== Début update_profile_view ======")
    logger.debug(f"Utilisateur: ID={request.user.id} | Username={request.user.username}")
    logger.debug(f"Données reçues: {request.data}")

    try:
        user = request.user
        data = request.data.copy()

        # Traitement username
        if 'username' in data:
            new_username = data['username'].strip()
            logger.debug(f"Tentative mise à jour username: '{new_username}'")
            
            if not new_username:
                logger.warning("Username vide reçu")
                return JsonResponse({'error': 'usernameEmpty'}, status=400)
            
            if len(new_username) > 30:
                logger.warning(f"Username trop long: {len(new_username)} caractères")
                return JsonResponse({'error': 'usernameTooLong'}, status=400)

            if user.__class__.objects.filter(username=new_username).exclude(id=user.id).exists():
                logger.warning(f"Username déjà existant: {new_username}")
                return JsonResponse({'error': 'usernameTaken'}, status=400)

            user.username = new_username
            logger.debug(f"Username mis à jour: {new_username}")

        # Traitement email
        if 'email' in data:
            new_email = data['email'].lower().strip()
            
            # Vérification de la longueur
            if len(new_email) > 70:
                return JsonResponse({
                    'error': 'mailTooLong'
                }, status=400)
            
            try:
                validate_email(new_email)
                if user.__class__.objects.filter(email=new_email).exclude(id=user.id).exists():
                    return JsonResponse({
                        'error': 'mailUsed'
                    }, status=400)
                
                user.email = new_email
            except ValidationError:
                return JsonResponse({
                    'error': 'invalidMail'
                }, status=400)

        # Traitement mot de passe
        # Traitement mot de passe
            if data.get('old_password') and data.get('new_password'):
                logger.debug("Tentative changement mot de passe")
                old_password = data.get('old_password')
                new_password = data.get('new_password')
                
                if not check_password(old_password, user.password):
                    logger.warning("Ancien mot de passe incorrect")
                    return JsonResponse({'error': 'wrongOldPwd'}, status=400)

                password_validator = ComplexPasswordValidator()
                try:
                    password_validator.validate(new_password)
                    user.password = make_password(new_password)
                    logger.debug("Mot de passe mis à jour avec succès")
                except ValidationError as e:
                    return JsonResponse({'error': str(e)}, status=400)


        # Traitement avatar
        if 'avatar' in request.FILES:
            avatar = request.FILES['avatar']
            logger.debug(f"Upload avatar: nom={avatar.name}, taille={avatar.size} bytes")
            
            try:
                # Vérifier la taille
                if avatar.size > 2 * 1024 * 1024:  # 2MB
                    logger.warning(f"Avatar trop volumineux: {avatar.size} bytes")
                    return JsonResponse({'error': 'L\'image est trop volumineuse (max 2MB).'}, status=400)

                # Vérifier le type MIME
                mime = magic.Magic(mime=True)
                file_type = mime.from_buffer(avatar.read())
                avatar.seek(0)

                allowed_types = ['image/jpeg', 'image/png']
                logger.debug(f"Type de fichier détecté: {file_type}")

                if file_type not in allowed_types:
                    logger.warning(f"Type de fichier non autorisé: {file_type}")
                    return JsonResponse({'error': 'Format de fichier non autorisé. Utilisez JPG ou PNG.'}, status=400)

                # Vérifier que c'est une vraie image
                try:
                    avatar.seek(0)
                    validate_image_thoroughly(avatar)
                    avatar.seek(0)

                    # Vérifier les dimensions
                    img = Image.open(avatar)
                    if img.height > 2000 or img.width > 2000:
                        logger.warning(f"Image trop grande: {img.width}x{img.height}")
                        return JsonResponse({'error': 'Dimensions de l\'image trop grandes (max 2000x2000)'}, status=400)

                    if img.height < 100 or img.width < 100:
                        logger.warning(f"Image trop petite: {img.width}x{img.height}")
                        return JsonResponse({'error': 'Dimensions de l\'image trop petites (min 100x100)'}, status=400)

                except Exception as e:
                    logger.error(f"Erreur de validation d'image: {str(e)}")
                    return JsonResponse({'error': 'Fichier image corrompu ou invalide'}, status=400)

                avatar.seek(0)

                # Sauvegarder le fichier validé
                file_path = os.path.join('avatars', f"avatar_{user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
                user.avatar = default_storage.save(file_path, avatar)
                logger.debug(f"Avatar sauvegardé: {file_path}")

            except Exception as e:
                logger.error(f"Erreur lors du traitement de l'avatar: {str(e)}")
                return JsonResponse({'error': 'Erreur lors du traitement de l\'image'}, status=500)

        elif 'selected_avatar' in data:
            selected_avatar = data['selected_avatar']
            print("Avatar sélectionné:", selected_avatar) 
            
            expected_prefix = 'assets/avatars/'
            if selected_avatar.startswith(expected_prefix):
                user.avatar = selected_avatar
                
            else:
                
                return JsonResponse({
                    'error': f'Chemin d\'avatar invalide. Le chemin doit commencer par {expected_prefix}'
                }, status=400)

        try:
            user.save()  
        except Exception as e:
            return JsonResponse({'error': 'Une erreur s\'est produite lors de la mise à jour du profil.'}, status=500)

        # Sauvegarde des modifications
        try:
            user.save()
            logger.debug("Sauvegarde utilisateur réussie")
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde: {str(e)}", exc_info=True)
            return JsonResponse({'error': 'Erreur lors de la sauvegarde des modifications.'}, status=500)

        # Préparation réponse
        avatar_url = None
        if user.avatar:
            if str(user.avatar).startswith('assets/avatars/'):
                avatar_url = f"/static/{user.avatar}"
            else:
                avatar_url = f"/media/{user.avatar}"
            logger.debug(f"URL avatar générée: {avatar_url}")

        response_data = {
            'username': user.username,
            'email': user.email,
            'avatar': avatar_url
        }
        
        logger.debug(f"Réponse finale: {response_data}")
        logger.debug("====== Fin update_profile_view - Succès ======")
        return JsonResponse(response_data, status=200)

    except Exception as e:
        logger.error("====== Erreur Critique ======")
        logger.error(f"Type d'erreur: {type(e).__name__}")
        logger.error(f"Message d'erreur: {str(e)}")
        logger.error("Détails:", exc_info=True)
        logger.error("====== Fin Erreur Critique ======")
        return JsonResponse({'error': 'Une erreur s\'est produite lors de la mise à jour du profil.'}, status=500)

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

from rest_framework_simplejwt.exceptions import TokenError

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


#################################API 42 ####################################################

from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.views.decorators.csrf import ensure_csrf_cookie

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

            avatar_url = user_data.get('image', {}).get('versions', {}).get('large')
            logger.info(f"Found avatar URL: {avatar_url}")


            user = CustomUser.objects.filter(intra_42_id=user_data['id']).first()

            if user is None:

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


            if avatar_url and user.is_42_user and (not user.avatar or user.avatar.name == 'assets/avatars/ladybug.png'):
                try:
                    avatar_response = requests.get(avatar_url, timeout=10)
                    if avatar_response.status_code == 200:
                        logger.info("Avatar download successful")


                        file_name = f"42_avatar_{user.username}_{user.id}.jpg"


                        user.avatar.save(
                            file_name,
                            ContentFile(avatar_response.content),
                            save=True
                        )

                except Exception as e:
                    logger.error(f"Failed to save avatar: {str(e)}")
                    logger.exception("Detailed error:")


            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)


            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)


            response = HttpResponse(f"""
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Authentication Successful</title>
                    <style>
                        /* Style général pour la page */
                        body {{
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background-color: #222225;
                            font-family: "Inter", sans-serif;
                        }}

                        /* Style du cadre principal */
                        .titleFrame {{
                            width: 100%;
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                        }}


                        /* Titre principal */
                        .title2FA {{
                            font-size: 28px;
                            font-weight: 600;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            color: #fbfbfb;
                        }}

                        /* Animation de redirection */
                        .redirecting {{
                            font-size: 16px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            font-style: italic;
                            animation: fadeInOut 1s ease-in-out infinite;
                            color: #ff710d;
                        }}

                        @keyframes fadeInOut {{
                            0%, 100% {{
                                opacity: 1;
                            }}
                            50% {{
                                opacity: 0.5;
                            }}
                        }}
                    </style>
                    <script>
                        if (window.opener) {{
                            window.opener.postMessage({{
                                type: 'auth_success'
                            }}, 'https://localhost:4430');

                            window.opener.location.href = 'https://localhost:4430/home';

                            // Fermer cette fenêtre après un court délai
                            setTimeout(() => {{
                                window.close();
                            }}, 300);
                        }}
                    </script>
                </head>
                <body>
                    <div class="titleFrame">
                        <h1 class="title2FA">Authentication Successful!</h1>
                        <p class="redirecting">Redirecting...</p>
                    </div>
                </body>
            </html>
            """)



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


from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import random
import string

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
            return Response({'message': 'active2FA'})

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


            context = {
                'username': 'Test User',
                'code': '123456',
                'valid_minutes': 10,
                'support_email': settings.DEFAULT_FROM_EMAIL
            }


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


            return Response({
                'message': 'Email de test envoyé avec succès!',
                'email_host': settings.EMAIL_HOST,
                'email_port': settings.EMAIL_PORT,
                'email_use_tls': settings.EMAIL_USE_TLS,
                'from_email': settings.DEFAULT_FROM_EMAIL,
                'template_context': context
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
def verify_2fa(request):
    logger.info("Appel reçu pour verify_2fa avec body : %s", request.body)
    try:

        data = json.loads(request.body)
        code = data.get('code')

        if not code:
            logger.warning("Aucun code 2FA fourni.")
            return JsonResponse({'success': False, 'message': 'Le code 2FA est requis.'}, status=400)


        if request.user.is_authenticated:

            logger.info("Contexte : Profil utilisateur.")
            user = request.user
        else:

            logger.info("Contexte : Login utilisateur.")
            user_id = data.get('user_id')
            if not user_id:
                logger.warning("Aucun identifiant utilisateur fourni pour la connexion.")
                return JsonResponse({
                    'success': False,
                    'message': "L'identifiant utilisateur est requis pour cette opération."
                }, status=400)


            try:
                user = CustomUser.objects.get(id=user_id)
                logger.info("Utilisateur trouvé : %s", user.email)
            except CustomUser.DoesNotExist:
                logger.error("Utilisateur introuvable avec l'ID : %s", user_id)
                return JsonResponse({
                    'success': False,
                    'message': 'Utilisateur non trouvé.'
                }, status=404)


        if not user.two_factor_code or not user.two_factor_code_timestamp:
            logger.warning("Aucun code 2FA actif trouvé pour l'utilisateur : %s", user.email)
            return JsonResponse({
                'success': False,
                'message': "Aucun code 2FA actif trouvé. Réessayez."
            }, status=400)


        if timezone.now() > user.two_factor_code_timestamp + timedelta(minutes=10):
            logger.warning("Code 2FA expiré pour l'utilisateur : %s", user.email)
            return JsonResponse({
                'success': False,
                'message': 'Code expiré.'
            }, status=400)


        if code == user.two_factor_code:
            logger.info("Code 2FA valide pour l'utilisateur : %s", user.email)

            user.two_factor_code = None
            user.two_factor_code_timestamp = None

            if not request.user.is_authenticated:

                logger.info("Génération des tokens pour l'utilisateur : %s", user.email)
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)


                response = JsonResponse({
                    'success': True,
                    'message': 'Login successful',
                })
                set_jwt_cookies(response, access_token, refresh_token)
            else:

                logger.info("Activation du 2FA pour l'utilisateur : %s", user.email)
                user.is_2fa_enabled = True
                response = JsonResponse({
                    'success': True,
                    'message': '2FA activé avec succès.',
                })


            user.save()
            return response
        else:
            logger.warning("Code 2FA invalide pour l'utilisateur : %s", user.email)
            return JsonResponse({'success': False, 'message': 'Code invalide.'}, status=400)

    except json.JSONDecodeError:
        logger.error("Erreur de parsing JSON dans la requête.")
        return JsonResponse({'success': False, 'message': 'Invalid JSON data.'}, status=400)

    except Exception as e:
        logger.error(f"Erreur inattendue lors de la vérification 2FA : {str(e)}")
        return JsonResponse({'success': False, 'message': 'Une erreur est survenue.'}, status=500)


#######################################2FA views#####################################################################



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .models import GameHistory
import json
import logging

logger = logging.getLogger(__name__)

from json.decoder import JSONDecodeError
import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_game(request):
    try:
        # Tenter de lire le body JSON
        try:
            data = json.loads(request.body.decode('utf-8'))
        except JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)

        # Validation des champs nécessaires
        try:
            score_user = int(data.get('score_user', None))
            score_opponent = int(data.get('score_opponent', None))
            result = bool(data.get('result', None))
            longest_rally = int(data.get('longest_rally', 0))
            max_ball_speed = int(data.get('max_ball_speed', 0))
        except (ValueError, TypeError):
            return JsonResponse({
                'error': 'Les champs score_user, score_opponent, result, longest_rally, et max_ball_speed doivent contenir des valeurs valides.'
            }, status=400)

        # Vérification des données obligatoires
        if score_user is None or score_opponent is None or result is None:
            return JsonResponse({'error': 'Les champs score_user, score_opponent et result sont obligatoires.'}, status=400)

        # Récupération de l'adversaire si fourni
        opponent_user = None
        opponent_id = data.get('opponent_id')
        opponent_name = data.get('opponent_name', 'IA')
        if opponent_id:
            try:
                opponent_user = CustomUser.objects.get(id=opponent_id)
            except CustomUser.DoesNotExist:
                return JsonResponse({'error': 'Adversaire introuvable.'}, status=404)

        # Calcul des statistiques utilisateur
        user_longest_rally = GameHistory.objects.filter(user=request.user).aggregate(
            Max('longest_rally')
        )['longest_rally__max'] or 0

        user_max_ball_speed = GameHistory.objects.filter(user=request.user).aggregate(
            Max('max_ball_speed')
        )['max_ball_speed__max'] or 0

        # Création de la partie
        try:
            game = GameHistory.objects.create(
                user=request.user,
                score_user=score_user,
                score_opponent=score_opponent,
                result=result,
                longest_rally=max(longest_rally, user_longest_rally),
                max_ball_speed=max(max_ball_speed, user_max_ball_speed),
                opponent_user=opponent_user,
                opponent_name=opponent_name if not opponent_user else None,
            )
        except Exception as e:
            logger.error(f"Erreur lors de la création du jeu : {str(e)}")
            return JsonResponse({'error': 'Une erreur est survenue lors de l\'enregistrement de la partie.'}, status=500)

        return JsonResponse({'message': 'Partie enregistrée avec succès', 'game_id': game.id})

    except Exception as e:
        # Loguer l'erreur pour déboguer si nécessaire
        logger.error(f"Unhandled exception in record_game: {e}")
        return JsonResponse({'error': 'An error occurred while processing the request'}, status=500)




from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import GameHistory

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_history(request):
    games = GameHistory.objects.filter(user=request.user).order_by('-date_played')
    history = []

    for game in games:

        game_date = game.date_played.strftime('%d/%m/%Y')

        if request.user.avatar:
            if str(request.user.avatar).startswith('assets/avatars/'):

                user_avatar = f"/static/{request.user.avatar}"
            else:

                user_avatar = request.user.avatar.url
        else:

            user_avatar = '/static/assets/avatars/ladybug.png'


        if game.opponent_user:
            if game.opponent_user.avatar:
                if str(game.opponent_user.avatar).startswith('assets/avatars/'):

                    opponent_avatar = f"/static/{game.opponent_user.avatar}"
                else:

                    opponent_avatar = game.opponent_user.avatar.url
            else:

                opponent_avatar = '/static/assets/avatars/clown-fish.png'
        else:

            opponent_avatar = '/static/assets/avatars/crabe.png'

        history.append({
            'score_user': game.score_user,
            'score_opponent': game.score_opponent,
            'result': "VICTORY" if game.result else "DEFEAT",
            'opponent_avatar': opponent_avatar,
            'user_avatar': user_avatar,
            'longest_rally': game.longest_rally,
            'max_ball_speed': game.max_ball_speed,
            'game_date': game_date
        })

    return JsonResponse({'history': history})


from django.http import JsonResponse
from django.db.models import Count, F, Q, Avg, Max
from .models import GameHistory

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_statistics(request):
    user = request.user


    total_games = GameHistory.objects.filter(user=user).count()
    total_wins = GameHistory.objects.filter(user=user, result=True).count()
    win_ratio = (total_wins / total_games * 100) if total_games > 0 else 0

    rank = "***" if win_ratio > 66 else "**" if win_ratio > 33 else "*"


    power_catch_avg = GameHistory.objects.filter(user=user).aggregate(Avg('power_catch'))['power_catch__avg']
    max_ball_speed = GameHistory.objects.filter(user=user).aggregate(Max('max_ball_speed'))['max_ball_speed__max'] or 0
    longest_rally = GameHistory.objects.filter(user=user).aggregate(Max('longest_rally'))['longest_rally__max'] or 0

    statistics = {
        'rank': rank,
        'total_games': total_games,
        'total_wins': total_wins,
        'win_ratio': win_ratio,
        'power_catch_avg': power_catch_avg or 0,
        'max_ball_speed': max_ball_speed,
        'longest_rally': longest_rally
    }

    return JsonResponse(statistics, status=200)

from .models import FriendShip

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    try:
        # Tenter de lire le body JSON
        try:
            body = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)

        # Récupérer et valider le receiver_id
        receiver_id = body.get('receiver_id')

        if not receiver_id:
            return JsonResponse({'message': 'Receiver ID is required'}, status=400)

        # Vérifier que le receiver_id est un entier valide
        try:
            receiver_id = int(receiver_id)
        except (ValueError, TypeError):
            return JsonResponse({'message': 'Invalid Receiver ID'}, status=400)

        if request.user.id == receiver_id:
            return JsonResponse({
                'message': 'You cannot send a friend request to yourself'
            }, status=400)

        # Vérifier si l'utilisateur existe
        try:
            receiver = CustomUser.objects.get(id=receiver_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

        # Vérifier les demandes existantes
        existing_request = FriendShip.objects.filter(
            from_user=request.user,
            to_user=receiver
        ).first()

        if existing_request:
            if existing_request.status == 'pending':
                return JsonResponse({'message': 'friendPending'}, status=400)
            elif existing_request.status == 'accepted':
                return JsonResponse({'message': 'You are already friends'}, status=400)

        # Créer la demande d'ami
        FriendShip.objects.create(
            from_user=request.user,
            to_user=receiver,
            status='pending'
        )

        return JsonResponse({'message': 'friendRequestsSuccess'}, status=200)

    except Exception as e:
        # Loguer l'erreur et répondre avec un message générique
        logger.error(f"Error in send_friend_request: {str(e)}")
        return JsonResponse({'message': 'An error occurred while processing the request'}, status=500)

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_friend_request(request):
    """
    Gère l'acceptation ou le refus des demandes d'ami.
    Attend request_id et action ('accept' ou 'decline') dans le corps de la requête.
    """
    try:
        # Tenter de lire le body JSON
        try:
            body = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON format'}, status=400)

        # Récupérer les données depuis le JSON
        request_id = body.get('request_id')
        action = body.get('action')

        # Validation de `request_id`
        if not request_id:
            return JsonResponse({'message': 'Request ID is required'}, status=400)

        try:
            request_id = int(request_id)
        except (ValueError, TypeError):
            return JsonResponse({'message': 'Request ID must be a valid integer'}, status=400)

        # Validation de `action`
        if action not in ['accept', 'decline']:
            return JsonResponse({'message': 'Invalid action. Use "accept" or "decline"'}, status=400)

        # Récupérer l'objet FriendShip
        try:
            friendship = FriendShip.objects.get(id=request_id, to_user=request.user)
        except FriendShip.DoesNotExist:
            return JsonResponse({'message': 'Friend request not found'}, status=404)

        # Traiter l'action
        if action == 'accept':
            # Accepter la demande d'ami
            friendship.status = 'accepted'
            friendship.save()

            # Assurer la réciprocité de l'amitié
            reverse_friendship, created = FriendShip.objects.get_or_create(
                from_user=friendship.to_user,
                to_user=friendship.from_user,
                defaults={'status': 'accepted'}
            )
            if not created and reverse_friendship.status != 'accepted':
                reverse_friendship.status = 'accepted'
                reverse_friendship.save()

        elif action == 'decline':
            # Refuser la demande d'ami
            friendship.delete()

        return JsonResponse({'message': f'Request {action}ed successfully'}, status=200)

    except Exception as e:
        # Log l'erreur pour déboguer si nécessaire
        print(f"Unhandled exception in handle_friend_request: {e}")
        return JsonResponse({'message': 'An error occurred while processing the request'}, status=500)



import logging
logger = logging.getLogger(__name__)

from django.db.models import Q


import logging
logger = logging.getLogger(__name__)

from django.db.models import Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friends(request):
    try:
        if not request.user:
            logger.error("Utilisateur non authentifié")
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        # Filtrer les amitiés acceptées où l'utilisateur est impliqué
        friendships = FriendShip.objects.filter(
            Q(from_user=request.user, status='accepted') |
            Q(to_user=request.user, status='accepted')
        )

        logger.debug(f"Friendships récupérées : {friendships}")

        # Récupérer les amis (l'autre utilisateur dans chaque relation)
        friends_list = []
        for friendship in friendships:
            friend = friendship.to_user if friendship.from_user == request.user else friendship.from_user
            friend_avatar = (
                f"/static/{friend.avatar}" if str(friend.avatar).startswith('assets/avatars/')
                else friend.avatar.url if friend.avatar
                else '/static/assets/avatars/ladybug.png'
            )
            friends_list.append({
                'id': friend.id,
                'username': friend.username,
                'avatar': friend_avatar
            })

        logger.debug(f"Liste des amis formatée : {friends_list}")
        return JsonResponse({'friends': friends_list}, status=200)

    except Exception as e:
        logger.exception("Erreur dans la vue get_friends")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_requests(request):
    try:
        # Vérifier si l'utilisateur est actif
        if not request.user.is_active:
            return JsonResponse({'error': 'User account is disabled'}, status=403)

        try:
            # Optimiser la requête avec select_related
            pending = request.user.friend_requests.filter(status='pending').select_related('from_user')
        except Exception as db_error:
            logger.error(f"Erreur d'accès à la base de données: {db_error}")
            return JsonResponse({'error': 'Database error'}, status=500)

        pending_requests = []

        for req in pending:
            try:
                # Vérifier si l'utilisateur expéditeur existe toujours
                if not req.from_user:
                    logger.warning(f"Demande d'ami {req.id} sans expéditeur valide")
                    continue

                # Gestion sécurisée de l'avatar
                try:
                    sender_avatar = '/static/assets/avatars/ladybug.png'  # Avatar par défaut
                    if req.from_user.avatar:
                        if str(req.from_user.avatar).startswith('assets/avatars/'):
                            sender_avatar = f"/static/{req.from_user.avatar}"
                        else:
                            sender_avatar = req.from_user.avatar.url
                except Exception as avatar_error:
                    logger.warning(f"Erreur lors de la récupération de l'avatar pour l'utilisateur {req.from_user.id}: {avatar_error}")
                    # Continuer avec l'avatar par défaut

                # Création sécurisée du dictionnaire
                request_data = {
                    'request_id': req.id,
                    'sender': {
                        'id': req.from_user.id,
                        'username': str(req.from_user.username)[:150],  # Limiter la taille
                        'avatar': sender_avatar
                    }
                }
                pending_requests.append(request_data)

            except Exception as request_error:
                logger.error(f"Erreur lors du traitement de la demande {req.id}: {request_error}")
                continue

        return JsonResponse({
            'pending_requests': pending_requests
        }, status=200)

    except Exception as e:
        logger.exception("Erreur critique dans la vue get_pending_requests")
        return JsonResponse({'error': 'Internal Server Error'}, status=500)



from .models import GameHostOptions
from rest_framework.parsers import JSONParser
from .models import UserSettings

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_game_settings(request):
    try:
        # Récupérer ou créer les paramètres spécifiques à l'utilisateur
        settings, created = UserSettings.objects.get_or_create(user=request.user)

        # Préparer les données pour la réponse
        data = {
            'scoreToWin': settings.score_to_win,
            'difficulty': settings.difficulty,
            'ballSpeedStart': settings.ball_speed_start,
            'ballSpeedMax': settings.ball_speed_max,
            'ballSpeedIncrease': settings.ball_speed_increase,
            'powerups': settings.powerups,
            'keyboardSettings': settings.keyboard_settings,
        }
        return JsonResponse(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from rest_framework.parsers import JSONParser
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_game_settings(request):
    try:
        # Tenter de parser le JSON envoyé
        try:
            data = JSONParser().parse(request)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            # Gestion de toute autre erreur liée au parsing
            return JsonResponse({'error': f'Unexpected error parsing JSON: {str(e)}'}, status=400)

        # Récupérer ou créer les paramètres de l'utilisateur
        settings, created = UserSettings.objects.get_or_create(user=request.user)

        # Mettre à jour uniquement les champs envoyés
        if 'scoreToWin' in data:
            try:
                settings.score_to_win = int(data['scoreToWin'])
            except (ValueError, TypeError):
                return JsonResponse({'error': 'scoreToWin must be an integer'}, status=400)

        if 'difficulty' in data:
            if isinstance(data['difficulty'], str):
                settings.difficulty = data['difficulty']
            else:
                return JsonResponse({'error': 'difficulty must be a string'}, status=400)

        if 'ballSpeedStart' in data:
            try:
                settings.ball_speed_start = float(data['ballSpeedStart'])
            except (ValueError, TypeError):
                return JsonResponse({'error': 'ballSpeedStart must be a number'}, status=400)

        if 'ballSpeedMax' in data:
            try:
                settings.ball_speed_max = float(data['ballSpeedMax'])
            except (ValueError, TypeError):
                return JsonResponse({'error': 'ballSpeedMax must be a number'}, status=400)

        if 'ballSpeedIncrease' in data:
            try:
                settings.ball_speed_increase = float(data['ballSpeedIncrease'])
            except (ValueError, TypeError):
                return JsonResponse({'error': 'ballSpeedIncrease must be a number'}, status=400)

        if 'powerups' in data:
            # Validation : vérifier que `powerups` est une liste
            if isinstance(data['powerups'], list):
                # Vérifiez que chaque élément de la liste est une chaîne
                if all(isinstance(item, str) for item in data['powerups']):
                    settings.powerups = data['powerups']
                else:
                    return JsonResponse({'error': 'All powerups must be strings'}, status=400)
            else:
                return JsonResponse({'error': 'powerups must be a list'}, status=400)

        if 'keyboardSettings' in data:
            if isinstance(data['keyboardSettings'], dict):
                settings.keyboard_settings = data['keyboardSettings']
            else:
                return JsonResponse({'error': 'keyboardSettings must be a dictionary'}, status=400)

        # Sauvegarder les modifications
        settings.save()
        return JsonResponse({'message': 'Settings updated successfully'}, status=200)

    except Exception as e:
        # Logger l'erreur pour le débogage
        print(f"Unhandled exception in set_game_settings: {e}")
        return JsonResponse({'error': 'An error occurred while processing the request'}, status=500)


from django.http import JsonResponse
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser, GameHistory
import logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile_stats(request, user_id):
    try:
        logger.debug(f"Fetching stats for user_id: {user_id}")

        user = CustomUser.objects.get(id=user_id)
        logger.debug(f"Found user: {user.username}")

        try:
            games_queryset = GameHistory.objects.filter(user=user)
            total_games = games_queryset.count()
            logger.debug(f"Total games found: {total_games}")

            total_wins = games_queryset.filter(result=True).count()
            logger.debug(f"Total wins found: {total_wins}")

            stats = games_queryset.aggregate(
                max_ball_speed=models.Max('max_ball_speed'),
                longest_rally=models.Max('longest_rally')
            )
            logger.debug(f"Aggregated stats: {stats}")

        except Exception as e:
            logger.error(f"Error during game statistics calculation: {str(e)}")
            raise Exception(f"Game statistics error: {str(e)}")

        logger.debug(f"Total games: {total_games}, Total wins: {total_wins}")

        win_ratio = (total_wins / total_games * 100) if total_games > 0 else 0

        # Statistiques supplémentaires avec gestion des None
        stats = games_queryset.aggregate(
            max_ball_speed=models.Max('max_ball_speed'),
            longest_rally=models.Max('longest_rally')
        )

        max_ball_speed = stats['max_ball_speed'] or 0
        longest_rally = stats['longest_rally'] or 0

        logger.debug(f"Stats: max_ball_speed={max_ball_speed}, longest_rally={longest_rally}")

        # Déterminer le rang
        if win_ratio >= 80 and total_games >= 5:
            rank = "Platinium"
        elif (win_ratio >= 66 and win_ratio < 80) or (win_ratio >= 66 and total_games < 5):
            rank = "Gold"
        elif win_ratio >= 33 and win_ratio < 66:
            rank = "Silver"
        else:
            rank = "Bronze"

        logger.debug(f"Calculated rank: {rank}")

        # Gérer l'avatar
        avatar_url = None
        if user.avatar:
            if str(user.avatar).startswith('assets/avatars/'):
                avatar_url = f"/static/{user.avatar}"
            else:
                avatar_url = f"/media/{user.avatar}"
        else:
            avatar_url = '/static/assets/avatars/ladybug.png'

        # Récupérer l'historique des matchs
        recent_games = games_queryset.order_by('-date_played')[:5]
        match_history = []

        for game in recent_games:
            game_date = game.date_played.strftime('%d/%m/%Y')

            # Avatar de l'adversaire
            if game.opponent_user:
                if game.opponent_user.avatar:
                    if str(game.opponent_user.avatar).startswith('assets/avatars/'):
                        opponent_avatar = f"/static/{game.opponent_user.avatar}"
                    else:
                        opponent_avatar = game.opponent_user.avatar.url
                else:
                    opponent_avatar = '/static/assets/avatars/clown-fish.png'
            else:
                opponent_avatar = '/static/assets/avatars/crabe.png'

            match_history.append({
                'score_user': game.score_user,
                'score_opponent': game.score_opponent,
                'result': "VICTORY" if game.result else "DEFEAT",
                'opponent_avatar': opponent_avatar,
                'user_avatar': avatar_url,
                'game_date': game_date
            })

        # Préparer la réponse complète
        response_data = {
            'nickname': user.username,
            'avatar': avatar_url,
            'rank': rank,
            'stats': {
                'totalGames': total_games,
                'winRate': f"{win_ratio:.1f}%",
                'longestRally': longest_rally,
                'maxBallSpeed': round(max_ball_speed, 2)
            },
            'matchHistory': match_history
        }

        logger.debug(f"Returning response data: {response_data}")
        return JsonResponse(response_data)

    except CustomUser.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return JsonResponse({
            'error': f'User {user_id} not found'
        }, status=404)
    except Exception as e:
        logger.error(f"Error in get_user_profile_stats: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_blocked_users(request):
    try:
        blocked_users = request.user.blocked_users.all()
        blocked_list = [{
            'id': user.id,
            'username': user.username,
            'avatar': f"/static/{user.avatar}" if str(user.avatar).startswith('assets/avatars/')
                     else user.avatar.url if user.avatar else '/static/assets/avatars/ladybug.png',
        } for user in blocked_users]

        return JsonResponse({'blocked_users': blocked_list}, status=200)

    except Exception as e:
        return JsonResponse({'error': 'Unable to fetch blocked users'}, status=500)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def block_user(request):
#     try:
#         user_id = request.data.get('user_id')

#         if not user_id:
#             return JsonResponse({'error': 'User ID is required'}, status=400)

#         if str(user_id) == str(request.user.id):
#             return JsonResponse({'error': 'Cannot block yourself'}, status=400)

#         user_to_block = CustomUser.objects.get(id=user_id)
#         request.user.blocked_users.add(user_to_block)

#         return JsonResponse({
#             'message': f'User {user_to_block.username} has been blocked'
#         })

#     except CustomUser.DoesNotExist:
#         return JsonResponse({'error': 'User not found'}, status=404)
#     except Exception as e:
#         return JsonResponse({'error': str(e)}, status=400)


from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request):
    try:
        # Tenter de lire le body JSON
        try:
            body = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)

        # Récupérer le user_id
        user_id = body.get('user_id')

        # Vérifier si le user_id est fourni ou non vide
        if not user_id:
            return JsonResponse({'error': 'User ID is required and cannot be empty'}, status=400)

        # Vérifier si le user_id est un entier
        try:
            user_id = int(user_id)
        except (ValueError, TypeError) as e:
            return JsonResponse({'error': 'User ID must be a valid integer'}, status=400)

        # Vérifier si l'utilisateur essaie de se bloquer lui-même
        if user_id == request.user.id:
            return JsonResponse({'error': 'Cannot block yourself'}, status=400)

        # Rechercher l'utilisateur à bloquer
        user_to_block = CustomUser.objects.filter(id=user_id).first()
        if not user_to_block:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Bloquer l'utilisateur
        request.user.blocked_users.add(user_to_block)

        return JsonResponse({'message': f'User {user_to_block.username} has been blocked'}, status=200)

    except Exception as e:
        print(f"Unhandled exception: {e}")  # Debug log
        return JsonResponse({'error': 'Unable to process the request'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock_user(request):
    try:
        # Tenter de lire le body JSON
        try:
            body = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)

        # Récupérer le user_id
        user_id = body.get('user_id')

        # Vérifier si le user_id est fourni ou non vide
        if not user_id or str(user_id).strip() == "":
            return JsonResponse({'error': 'User ID is required and cannot be empty'}, status=400)

        # Vérifier si le user_id est un entier
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'User ID must be a valid integer'}, status=400)

        # Rechercher l'utilisateur à débloquer
        user_to_unblock = CustomUser.objects.filter(id=user_id).first()
        if not user_to_unblock:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Débloquer l'utilisateur
        request.user.blocked_users.remove(user_to_unblock)

        return JsonResponse({'message': f'User {user_to_unblock.username} has been unblocked'}, status=200)

    except Exception as e:
        print(f"Unhandled exception: {e}")  # Debug log
        return JsonResponse({'error': 'Unable to process the request'}, status=500)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_preferred_language(request):
#     """Récupère la langue préférée de l'utilisateur."""
#     return JsonResponse({
#         'language': request.user.preferred_language
#     })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_preferred_language(request):
    try:
        language = request.user.preferred_language or 'Not set'
        return JsonResponse({'language': language}, status=200)

    except Exception as e:
        return JsonResponse({'error': 'Unable to fetch preferred language'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_preferred_language(request):
    try:
        # Tenter de lire le body JSON
        try:
            body = json.loads(request.body.decode('utf-8'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)

        # Récupérer la langue
        language = body.get('language')

        # Validation de la langue
        valid_languages = dict(request.user.LANGUAGE_CHOICES).keys()
        if not language or language not in valid_languages:
            return JsonResponse({'error': 'Invalid language choice'}, status=400)

        # Mise à jour de la langue
        request.user.preferred_language = language
        request.user.save()

        return JsonResponse({
            'message': 'Language preference updated successfully',
            'language': language
        }, status=200)

    except Exception as e:
        print(f"Unhandled exception: {e}")
        return JsonResponse({'error': 'Unable to set preferred language'}, status=500)
