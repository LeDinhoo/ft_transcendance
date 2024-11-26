"""
ASGI config for myproject project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  # Assurez-vous que cette ligne est avant les imports
import django
django.setup()  # Ajoutez cette ligne pour initialiser Django

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
from accounts.routing import websocket_urlpatterns
from accounts.middleware import JWTWebSocketMiddleware  # Corrigez le nom de la classe

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JWTWebSocketMiddleware(
            AuthMiddlewareStack(
                URLRouter(websocket_urlpatterns)
            )
        )
    ),
})


# """
# ASGI config for myproject project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
# """

# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator
# from channels.auth import AuthMiddlewareStack
# from accounts.routing import websocket_urlpatterns
# from accounts.middleware import JWTWebSocketMiddleware # Ajoutez cette ligne

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AllowedHostsOriginValidator(
#         JWTWebSocketMiddleware(  # Utilisez le nouveau middleware
#             AuthMiddlewareStack(
#                 URLRouter(websocket_urlpatterns)
#             )
#         )
#     ),
# })
