import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    connected_users = {}

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

            ChatConsumer.connected_users.pop(self.user.id, None)

            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "user_list_update",
                    "users": [json.dumps(user) for user in ChatConsumer.connected_users.values()]
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
        print("Debug - User ID being sent:", self.user.id)
        message_data = {
            **data,
            'userId': str(self.user.id),
        }
        await self.channel_layer.group_send(
            "chat",
            {
                "type": "chat_message",
                "message": message_data
            }
        )

    async def chat_message(self, event):
        """Gère la diffusion des messages"""
        message_data = event['message']
        sender_id = message_data['userId']  # ID de l'expéditeur

        try:
            # Pour les messages publics
            if message_data['type'] == 'chat_message':
                # Vérifier si l'utilisateur courant (destinataire) a bloqué l'expéditeur
                # ou si l'expéditeur a bloqué l'utilisateur courant
                current_user = self.scope["user"]
                sender_blocked_me = await self.is_user_blocked(sender_id, current_user.id)
                i_blocked_sender = await self.is_user_blocked(current_user.id, sender_id)

                if not sender_blocked_me and not i_blocked_sender:
                    await self.send(text_data=json.dumps(message_data))

            # Pour les messages privés
            elif message_data['type'] == 'private_message':
                recipient_name = message_data.get('recipient')
                if recipient_name:
                    recipient = await self.get_user(recipient_name)
                    if recipient:
                        # Vérifier le blocage dans les deux sens
                        sender_blocked_recipient = await self.is_user_blocked(sender_id, recipient.id)
                        recipient_blocked_sender = await self.is_user_blocked(recipient.id, sender_id)

                        if not sender_blocked_recipient and not recipient_blocked_sender:
                            await self.send(text_data=json.dumps(message_data))

        except Exception as e:
            print(f"Erreur dans chat_message: {str(e)}")

    async def is_user_blocked(self, user_id, blocked_id):
        """Vérifie si user_id a bloqué blocked_id"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = await User.objects.aget(id=user_id)
        return await user.blocked_users.filter(id=blocked_id).aexists()

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):

        await self.channel_layer.group_add("game", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard("game", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        await self.channel_layer.group_send(
            "game",
            {
                "type": "game_message",
                "message": data
            }
        )

    async def game_message(self, event):

        await self.send(text_data=json.dumps(event["message"]))


