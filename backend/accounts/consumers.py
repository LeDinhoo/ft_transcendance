import json
from channels.generic.websocket import AsyncWebsocketConsumer
from html import escape

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
        await self.send(text_data=json.dumps({
            "type": "user_list_update",
            "users": event["users"]
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Debug - Received message type:", data.get('type'))

        if data.get('type') in ['chat_message', 'private_message']:
            if len(data.get('message', '')) > 250:
                await self.send(text_data=json.dumps({
                    "type": "error",
                    "message": "Message too long (max 250 characters)"
                }))
                return
        
        if data.get('type') == 'user_update':
            user_id = int(data['user']['id'])
            if user_id in ChatConsumer.connected_users:
                ChatConsumer.connected_users[user_id].update({
                    'username': data['user']['username'],
                    'avatar': data['user']['avatar'],
                })
                # Envoyer la mise à jour à tous les clients
                await self.channel_layer.group_send(
                    "chat",
                    {
                        "type": "user_list_update",
                        "users": [json.dumps(user) for user in ChatConsumer.connected_users.values()]
                    }
                )
            return

        if data.get('type') == 'game_invitation':
            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "game_invitation",
                    "invitation": data
                }
            )
        elif data.get('type') == 'game_invitation_response':
            await self.channel_layer.group_send(
                "chat",
                {
                    "type": "game_invitation_response",
                    "response": data
                }
            )
        else:
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

    async def game_invitation(self, event):
        """Gère la diffusion des invitations de jeu"""
        invitation_data = event['invitation']
        print(f"Debug - Received invitation data: {invitation_data}")

        receiver_id = int(invitation_data.get('receiverId', -1)) 
        sender_id = int(invitation_data['sender']['id'])
        current_user_id = self.scope["user"].id

        if current_user_id == receiver_id or current_user_id == sender_id:
            print(f"Debug - Sending invitation to user ID: {current_user_id}")
            await self.send(text_data=json.dumps(invitation_data))
        else:
            print(f"Debug - Skipping user ID: {current_user_id} (Not a sender or receiver)")



    async def game_invitation_response(self, event):
        """Gère la diffusion des réponses aux invitations"""
        response_data = event['response']
        print(f"Debug - Received invitation response data: {response_data}")

        sender_id = int(response_data['sender']['id'])
        receiver_id = int(response_data['receiverId'])
        current_user_id = self.scope["user"].id

        if current_user_id == sender_id or current_user_id == receiver_id:
            print(f"Debug - Sending response to user ID: {current_user_id}")
            await self.send(text_data=json.dumps(response_data))
        else:
            print(f"Debug - Skipping user ID: {current_user_id} (Not a sender or receiver)")

           
    async def chat_message(self, event):
        """Gère la diffusion des messages"""
        message_data = event['message']
        sender_id = message_data['userId']

        try:
            if message_data['type'] == 'chat_message':
                sanitized_message = escape(message_data['message'])
                message_data['message'] = sanitized_message

                current_user = self.scope["user"]
                sender_blocked_me = await self.is_user_blocked(sender_id, current_user.id)
                i_blocked_sender = await self.is_user_blocked(current_user.id, sender_id)

                if not sender_blocked_me and not i_blocked_sender:
                    await self.send(text_data=json.dumps(message_data))

            elif message_data['type'] == 'private_message':
                sanitized_message = escape(message_data['message'])
                message_data['message'] = sanitized_message

                recipient_name = message_data.get('recipient')
                if recipient_name:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    try:
                        recipient = await User.objects.aget(username=recipient_name)
                        if recipient:
                            if str(self.scope["user"].id) == str(sender_id) or self.scope["user"].username == recipient_name:
                                sender_blocked_recipient = await self.is_user_blocked(sender_id, recipient.id)
                                recipient_blocked_sender = await self.is_user_blocked(recipient.id, sender_id)

                                if not sender_blocked_recipient and not recipient_blocked_sender:
                                    await self.send(text_data=json.dumps(message_data))
                    except User.DoesNotExist:
                        pass

        except Exception as e:
            print(f"Erreur dans chat_message: {str(e)}")

    async def is_user_blocked(self, user_id, blocked_id):
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
