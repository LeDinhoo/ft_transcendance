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

        return Response({"error": "Token invalide ou expiré.", "details": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:

        return Response({"error": "Erreur inattendue.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def index_view(request):
    login_form = LoginForm()
    register_form = RegisterForm()
    return render(request, 'index.html', {'login_form': login_form, 'register_form': register_form})


def set_jwt_cookies(response, access_token, refresh_token):

    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        secure=True,
        samesite='None'
    )
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='None'
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

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
                    return JsonResponse({
                        'success': False,
                        'message': 'Erreur lors de l\'envoi du code 2FA'
                    }, status=500)
            else:

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

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    user = request.user
    data = request.data


    if 'username' in data:
        new_username = data['username']
        if new_username.strip():
            user.username = new_username
        else:
            return JsonResponse({'error': 'Le nom d\'utilisateur ne peut pas être vide.'}, status=400)


    if 'email' in data:
        new_email = data['email']
        try:
            validate_email(new_email)
            user.email = new_email
        except ValidationError:
            return JsonResponse({'error': 'L\'adresse email est invalide.'}, status=400)


    if 'old_password' in data and 'new_password' in data:
        old_password = data['old_password']
        new_password = data['new_password']


        if not check_password(old_password, user.password):
            return JsonResponse({'error': 'L\'ancien mot de passe est incorrect.'}, status=400)


        password_validator = ComplexPasswordValidator()
        try:
            password_validator.validate(new_password)
        except ValidationError as e:
            return JsonResponse({'error': e.messages[0]}, status=400)


        user.password = make_password(new_password)


    if 'avatar' in request.FILES:
        avatar = request.FILES['avatar']
        valid_image_extensions = ['png', 'jpg', 'jpeg']
        ext = avatar.name.split('.')[-1].lower()
        if ext not in valid_image_extensions:
            return JsonResponse({'error': 'Seuls les fichiers PNG, JPG ou JPEG sont acceptés.'}, status=400)
        user.avatar = avatar

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

    avatar_url = None
    if user.avatar:
        if str(user.avatar).startswith('assets/avatars/'):
            avatar_url = f"/static/{user.avatar}"
        else:
            avatar_url = f"/media/{user.avatar}"

    print("URL de l'avatar renvoyée:", avatar_url)

    return JsonResponse({
        'username': user.username,
        'email': user.email,
        'avatar': avatar_url
    }, status=200)


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


            if avatar_url:
                try:
                    logger.info(f"Attempting to download avatar from: {avatar_url}")
                    avatar_response = requests.get(avatar_url, timeout=10)

                    if avatar_response.status_code == 200:
                        logger.info("Avatar download successful")


                        file_name = f"42_avatar_{user.username}_{user.id}.jpg"


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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_game(request):
    data = request.data
    score_user = data.get('score_user')
    score_opponent = data.get('score_opponent')
    result = data.get('result')
    longest_rally = data.get('longest_rally', 0)
    opponent_id = data.get('opponent_id')
    opponent_name = data.get('opponent_name', 'IA')
    max_ball_speed = data.get('max_ball_speed', 0)

    if max_ball_speed is None:
        return JsonResponse({'error': 'Données incorrectes : max_ball_speed manquant'}, status=400)


    if not all([score_user is not None, score_opponent is not None, result is not None]):
        return JsonResponse({'error': 'Données manquantes'}, status=400)

    opponent_user = None
    if opponent_id:
        try:
            opponent_user = CustomUser.objects.get(id=opponent_id)
        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'Adversaire introuvable'}, status=404)


    user_longest_rally = GameHistory.objects.filter(user=request.user).aggregate(
        Max('longest_rally')
    )['longest_rally__max'] or 0

    if longest_rally > user_longest_rally:
        print(f"Mise à jour du longest rally : {longest_rally} (ancien : {user_longest_rally})")

    user_max_ball_speed = GameHistory.objects.filter(user=request.user).aggregate(Max('max_ball_speed'))['max_ball_speed__max'] or 0

    if max_ball_speed > user_max_ball_speed:
        print(f"Mise à jour du max ball speed : {max_ball_speed} (ancien : {user_max_ball_speed})")

    game = GameHistory.objects.create(
        user=request.user,
        score_user=score_user,
        score_opponent=score_opponent,
        result=result,
        longest_rally=longest_rally if longest_rally > user_longest_rally else user_longest_rally,
        opponent_user=opponent_user,
        opponent_name=opponent_name if not opponent_user else None,
        max_ball_speed = max_ball_speed if max_ball_speed > user_max_ball_speed else user_max_ball_speed,
    )

    return JsonResponse({'message': 'Partie enregistrée avec succès', 'game_id': game.id})


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
    receiver_id = request.data.get('receiver_id')


    if not receiver_id:
        return JsonResponse({
            'message': 'Receiver ID is required'
        }, status=400)

    try:
        if str(request.user.id) == str(receiver_id):
            return JsonResponse({
                'message': 'You cannot send a friend request to yourself'
            }, status=400)

        receiver = CustomUser.objects.get(id=receiver_id)

        existing_request = FriendShip.objects.filter(
            from_user=request.user,
            to_user=receiver
        ).first()

        if existing_request:
            if existing_request.status == 'pending':
                return JsonResponse({
                    'message': 'A friend request is already pending'
                }, status=400)
            elif existing_request.status == 'accepted':
                return JsonResponse({
                    'message': 'You are already friends'
                }, status=400)

        FriendShip.objects.create(
            from_user=request.user,
            to_user=receiver,
            status='pending'
        )

        return JsonResponse({
            'message': 'Friend request sent successfully'
        }, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({
            'message': 'User not found'
        }, status=404)
    except Exception as e:
        print(f"Error in send_friend_request: {str(e)}")
        return JsonResponse({
            'message': 'An error occurred while processing the request'
        }, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handle_friend_request(request):
    request_id = request.data.get('request_id')
    action = request.data.get('action')

    try:
        # Retrieve the FriendShip object
        friendship = FriendShip.objects.get(id=request_id, to_user=request.user)

        if action == 'accept':
            # Update the current friendship status
            friendship.status = 'accepted'
            friendship.save()

            # Ensure the friendship is bidirectional
            reverse_friendship, created = FriendShip.objects.get_or_create(
                from_user=friendship.to_user,
                to_user=friendship.from_user,
                defaults={'status': 'accepted'}
            )
            if not created and reverse_friendship.status != 'accepted':
                reverse_friendship.status = 'accepted'
                reverse_friendship.save()

        elif action == 'decline':
            # Decline the friendship
            friendship.status = 'rejected'
            friendship.save()

        return JsonResponse({'message': f'Request {action}ed successfully'})

    except FriendShip.DoesNotExist:
        return JsonResponse({'message': 'Friend request not found'}, status=404)


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
    pending = request.user.friend_requests.filter(status='pending')
    pending_requests = []

    for req in pending:

        if req.from_user.avatar:
            if str(req.from_user.avatar).startswith('assets/avatars/'):
                sender_avatar = f"/static/{req.from_user.avatar}"
            else:
                sender_avatar = req.from_user.avatar.url
        else:
            sender_avatar = '/static/assets/avatars/ladybug.png'

        pending_requests.append({
            'request_id': req.id,
            'sender': {
                'id': req.from_user.id,
                'username': req.from_user.username,
                'avatar': sender_avatar
            }
        })

    return JsonResponse({
        'pending_requests': pending_requests
    })


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

from rest_framework.parsers import JSONParser

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_game_settings(request):
    try:
        # Récupérer ou créer les paramètres de l'utilisateur
        settings, created = UserSettings.objects.get_or_create(user=request.user)

        # Parser les données envoyées
        data = JSONParser().parse(request)

        # Mettre à jour uniquement les champs envoyés
        if 'scoreToWin' in data:
            settings.score_to_win = data['scoreToWin']
        if 'difficulty' in data:
            settings.difficulty = data['difficulty']
        if 'ballSpeedStart' in data:
            settings.ball_speed_start = data['ballSpeedStart']
        if 'ballSpeedMax' in data:
            settings.ball_speed_max = data['ballSpeedMax']
        if 'ballSpeedIncrease' in data:
            settings.ball_speed_increase = data['ballSpeedIncrease']
        if 'powerups' in data:
            settings.powerups = data['powerups']
        if 'keyboardSettings' in data:
            settings.keyboard_settings = data['keyboardSettings']

        # Sauvegarder les modifications
        settings.save()
        return JsonResponse({'message': 'Settings updated successfully'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
