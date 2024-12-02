import json
from channels.generic.websocket import AsyncWebsocketConsumer

# Dans consumers.py
class ChatConsumer(AsyncWebsocketConsumer):
    connected_users = {}  # Utiliser un dict avec l'ID comme clé

    async def connect(self):
        self.user = self.scope["user"]

        if self.user.is_anonymous:
            await self.close()
            return

        try:
			avatar_url = str(self.user.avatar)
			if avatar_url.startswith('assets/avatars/'):
				avatar_url = f"/static/{avatar_url}"
			else:
				avatar_url = f"/media/{avatar_url}"

			user_data = {
				"id": self.user.id,
				"username": self.user.username,
				"avatar": avatar_url,
				"status": "online"
			}

            # Stocker dans le dict
            ChatConsumer.connected_users[self.user.id] = user_data

            await self.channel_layer.group_add("chat", self.channel_name)
            await self.accept()

            # Envoyer la liste mise à jour
            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "user_list_update",
                    "users": [json.dumps(user) for user in ChatConsumer.connected_users.values()]
                }
            )

        except Exception as e:
            print(f"Erreur lors de la connexion: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and not self.user.is_anonymous:
            # Retirer du dict
            ChatConsumer.connected_users.pop(self.user.id, None)

            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "user_list_update",
                    "users": [json.dumps(user) for user in ChatConsumer.connected_users.values()]
                }
            )

        await self.channel_layer.group_discard("chat", self.channel_name)
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

    async def game_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event["message"]))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("chat", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("chat", self.channel_name)

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


# SI L'AVATAR BEUG DANS LA LISTE DE JOUEURS CONNECTES OU DANS LE CHAT 

# # Dans le ChatConsumer, modifier la partie de connect() qui gère l'avatar
# avatar_url = str(self.user.avatar)
# if avatar_url.startswith('assets/avatars/'):
#     avatar_url = f"/static/{avatar_url}"
# else:
#     avatar_url = f"/media/{avatar_url}"

# user_data = {
#     "id": self.user.id,
#     "username": self.user.username,
#     "avatar": avatar_url,
#     "status": "online"
# }
            # user_data = {
            #     "id": self.user.id,
            #     "username": self.user.username,
            #     "avatar": str(self.user.avatar.url) if hasattr(self.user, 'avatar') and self.user.avatar else "/static/assets/avatars/ladybug.png",
            #     "status": "online",
            # }
