from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'wss/game/$', consumers.GameConsumer.as_asgi()),
    re_path(r'wss/chat/$', consumers.ChatConsumer.as_asgi()),
]
