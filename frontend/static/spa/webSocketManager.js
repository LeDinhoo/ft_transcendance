const wsManager = {
    chatSocket: null,
    messageListeners: new Set(),
    messageHistory: [],
    onlinePlayers: new Set(),

    initializeChatSocket() {
        if (this.chatSocket?.readyState === WebSocket.OPEN) return;

        this.chatSocket = new WebSocket('wss://localhost:4430/wss/chat/');

		console.log('TEST\n:NEW SOCKET CREATED\n');

        this.chatSocket.onopen = () => {
            console.log('Chat WebSocket Connected');
        };

        this.chatSocket.onclose = () => {
            console.log('Chat WebSocket disconnected');
            setTimeout(() => this.initializeChatSocket(), 5000);
        };

        this.chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);

            switch (data.type) {
                case 'chat_message':
                    this.messageHistory.push(data);
                    this.messageListeners.forEach(listener => listener(data));
                    break;

					case 'user_list_update':
						try {
							const users = data.users.map(u => typeof u === 'string' ? JSON.parse(u) : u);
							this.onlinePlayers = new Set(users);
							// Si on est sur la page home, mettre à jour la liste
							const container = document.querySelector('.downLeftFrame');
							if (container) {
								this.updateOnlinePlayersList([...this.onlinePlayers]);
							}
						} catch (error) {
							console.error('Error updating users list:', error);
						}
						break;
            }
        };

        this.chatSocket.onerror = (error) => console.error('WebSocket Error:', error);
    },

    updateOnlinePlayersList(users) {
        const container = document.querySelector('.downLeftFrame');
        if (!container) return;

        const title = container.querySelector('.onlinePlayersTitle');
        container.innerHTML = '';
        if (title) container.appendChild(title);

        users.forEach(user => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'onlinePlayers';
            playerDiv.innerHTML = `
                <div class="onlineFlag ${user.status === 'in_game' ? 'in-game' : ''}"></div>
                <div class="onlineNickname" data-user-id="${user.id}">
                    <img src="${user.avatar}" alt="avatar" class="onlineAvatar">
                    ${user.username}
                </div>
                <img src="/static/assets/icons/online.svg" class="onlineIcon">
            `;
            container.appendChild(playerDiv);
        });
    },

    sendMessage(message) {
        if (this.chatSocket?.readyState === WebSocket.OPEN) {
            this.chatSocket.send(JSON.stringify(message));
        }
    },

    getMessageHistory() {
        return this.messageHistory;
    },

    addMessageListener(listener) {
        this.messageListeners.add(listener);
    },

    removeMessageListener(listener) {
        this.messageListeners.delete(listener);
    }
};

window.wsManager = wsManager;
