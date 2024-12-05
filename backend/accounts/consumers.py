import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    connected_users = {}  # Utiliser un dict avec l'ID comme clé
    message_history = []  # Liste pour stocker les derniers messages
    MAX_HISTORY = 20     # Nombre maximum de messages à conserver

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

            ChatConsumer.connected_users[self.user.id] = user_data

            await self.channel_layer.group_add("chat", self.channel_name)
            await self.accept()

            print(f"Envoi de l'historique ({len(ChatConsumer.message_history)} messages) à {self.user.username}")
            if ChatConsumer.message_history:
                print(f"Envoi de l'historique au client {self.user.username}")
                filtered_history = [
                    msg for msg in ChatConsumer.message_history 
                    if msg.get('type') != 'private_message'
                ]
                print(f"Messages filtrés à envoyer : {len(filtered_history)}")
                await self.send(text_data=json.dumps({
                    "type": "message_history",
                    "messages": filtered_history
                }))

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

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            # Ne stocker que les messages non-privés dans l'historique
            if data.get('type') == 'chat_message':
                ChatConsumer.message_history.append(data)
                if len(ChatConsumer.message_history) > ChatConsumer.MAX_HISTORY:
                    ChatConsumer.message_history = ChatConsumer.message_history[-ChatConsumer.MAX_HISTORY:]

            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "chat_message",
                    "message": data
                }
            )
        except Exception as e:
            print(f"Erreur lors de la réception d'un message: {str(e)}")

    async def chat_message(self, event):
        try:
                message = event["message"]
                print(f"Diffusion d'un message de type {message.get('type')} à {self.user.username}")
                await self.send(text_data=json.dumps(message))
        except Exception as e:
                print(f"Erreur lors de l'envoi d'un message: {str(e)}")

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
