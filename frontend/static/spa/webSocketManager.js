const wsManager = {
    chatSocket: null,
    messageListeners: new Set(),
    messageHistory: [],
    onlinePlayers: new Set(),

    initializeChatSocket() {
        if (this.chatSocket?.readyState === WebSocket.OPEN) return;

        this.chatSocket = new WebSocket('wss://localhost:4430/wss/chat/');

        this.chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            switch (data.type) {
                case 'chat_message':
                    this.messageHistory.push(data);
                    this.messageListeners.forEach(listener => listener(data));
                    break;
                    
                case 'user_list_update':
                    try {
                        this.onlinePlayers.clear(); // Vider la liste existante
                        data.users.forEach(userStr => {
                            try {
                                const user = JSON.parse(userStr);
                                this.onlinePlayers.add(user);
                            } catch (e) {
                                console.error('Error parsing user:', e);
                            }
                        });
                        this.updateOnlinePlayersList([...this.onlinePlayers]);
                    } catch (error) {
                        console.error('Error updating users list:', error);
                    }
                    break;
            }
        };

        this.chatSocket.onerror = (error) => console.error('WebSocket Error:', error);

        this.chatSocket.onclose = (event) => {
            console.log('Chat WebSocket disconnected, code:', event.code);
            setTimeout(() => this.initializeChatSocket(), 5000);
        };
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
                <div class="onlineFlag"></div>
                <div class="onlineNickname">
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
