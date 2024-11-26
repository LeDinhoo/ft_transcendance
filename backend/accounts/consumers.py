import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    connected_users = set()

    async def connect(self):
        self.user = self.scope["user"]
        
        # Vérifier si l'utilisateur est authentifié
        if not self.user or self.user.is_anonymous:
            print(f"ChatConsumer: Rejecting anonymous user")
            await self.close(code=4003)  # Code personnalisé pour authentification requise
            return

        print(f"ChatConsumer: User {self.user.username} connecting")
        try:
            # Ajouter l'utilisateur à la liste des connectés
            user_data = {
                "id": self.user.id,
                "username": self.user.username,
                "avatar": str(self.user.avatar.url) if hasattr(self.user, 'avatar') and self.user.avatar else "/static/assets/avatars/ladybug.png"
            }
            
            # Vérifier que le user_data est sérialisable
            json_user_data = json.dumps(user_data)
            ChatConsumer.connected_users.add(json_user_data)

            # Rejoindre le groupe de chat
            await self.channel_layer.group_add("chat", self.channel_name)
            await self.accept()

            # Envoyer la liste des utilisateurs connectés
            await self.send_connected_users()
            
            # Notifier les autres de la nouvelle connexion
            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "user_connected",
                    "user": user_data
                }
            )
            print(f"ChatConsumer: User {self.user.username} connected successfully")
        except Exception as e:
            print(f"ChatConsumer: Error during connection: {str(e)}")
            await self.close(code=4000)  # Code personnalisé pour erreur interne

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and not self.user.is_anonymous:
            user_data = {
                "id": self.user.id,
                "username": self.user.username,
                "avatar": str(self.user.avatar.url) if hasattr(self.user, 'avatar') and self.user.avatar else "/static/assets/avatars/ladybug.png"
            }
            
            ChatConsumer.connected_users.discard(json.dumps(user_data))
            
            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "user_disconnected",
                    "user": user_data
                }
            )
            await self.channel_layer.group_discard("chat", self.channel_name)

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

