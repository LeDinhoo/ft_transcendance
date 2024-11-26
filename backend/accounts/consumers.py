import json
from channels.generic.websocket import AsyncWebsocketConsumer

# Dans consumers.py
class ChatConsumer(AsyncWebsocketConsumer):
    connected_users = set()

    async def connect(self):
        self.user = self.scope["user"]
        
        # Vérifier si l'utilisateur est authentifié
        if self.user.is_anonymous:
            await self.close()
            return

        try:
            # Créer les données utilisateur avec plus d'informations
            user_data = {
                "id": self.user.id,
                "username": self.user.username,
                "avatar": str(self.user.avatar.url) if hasattr(self.user, 'avatar') and self.user.avatar else "/static/assets/avatars/ladybug.png",
                "status": "online",  # Nous pouvons ajouter un statut
            }
            
            # Stocker les données de l'utilisateur
            json_user_data = json.dumps(user_data)
            ChatConsumer.connected_users.add(json_user_data)

            await self.channel_layer.group_add("chat", self.channel_name)
            await self.accept()

            # Envoyer la liste mise à jour à tout le monde
            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "user_list_update",
                    "users": list(ChatConsumer.connected_users)
                }
            )

        except Exception as e:
            print(f"Erreur lors de la connexion: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and not self.user.is_anonymous:
            # Retirer l'utilisateur de la liste
            user_data = {
                "id": self.user.id,
                "username": self.user.username,
                "avatar": str(self.user.avatar.url) if hasattr(self.user, 'avatar') and self.user.avatar else "/static/assets/avatars/ladybug.png",
                "status": "online"
            }
            json_user_data = json.dumps(user_data)
            ChatConsumer.connected_users.discard(json_user_data)

            # Informer tout le monde de la mise à jour
            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "user_list_update",
                    "users": list(ChatConsumer.connected_users)
                }
            )

        await self.channel_layer.group_discard("chat", self.channel_name)

    async def user_list_update(self, event):
        """Envoie la liste mise à jour des utilisateurs au client"""
        await self.send(text_data=json.dumps({
            "type": "user_list_update",
            "users": event["users"]
        }))

    async def send_connected_users(self):
        await self.send(text_data=json.dumps({
            "type": "online_users",
            "users": [json.loads(user) for user in ChatConsumer.connected_users]
        }))

    async def user_connected(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_disconnected(self, event):
        await self.send(text_data=json.dumps(event))

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            "chat",
            {
                "type": "chat_message",
                "message": data
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Add to game group
        await self.channel_layer.group_add("game", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove from game group
        await self.channel_layer.group_discard("game", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Handle game messages
        await self.channel_layer.group_send(
            "game",
            {
                "type": "game_message",
                "message": data
            }
        )

