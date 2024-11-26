const wsManager = {
    chatSocket: null,
    messageListeners: new Set(),
	messageHistory: [],
	onlinePlayers: new Set(),

    initializeChatSocket() {
        if (this.chatSocket?.readyState === WebSocket.OPEN) {
            return; // Déjà connecté
        }

        this.chatSocket = new WebSocket('wss://localhost:4430/wss/chat/');

        this.chatSocket.onopen = () => {
            console.log('Chat WebSocket Connected');
        };

        this.chatSocket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        this.chatSocket.onclose = (event) => {
            console.log('Chat WebSocket disconnected, code:', event.code);
            if (event.code === 4003) {
                console.log('Authentication required');
            }
            // Tentative de reconnexion après 5 secondes
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
					this.updateOnlinePlayersList(data.users);
					break;
                    
                case 'user_connected':
                    this.onlinePlayers.add(data.user);
                    this.updateOnlinePlayersList();
                    break;
                    
                case 'user_disconnected':
                    this.onlinePlayers.delete(data.user);
                    this.updateOnlinePlayersList();
                    break;
                    
                case 'online_users':
                    this.onlinePlayers = new Set(data.users);
                    this.updateOnlinePlayersList();
                    break;
            }
        };
    },

	updateOnlinePlayersList() {
        const container = document.querySelector('.downLeftFrame');
        if (!container) return;

        // Garder le titre
        const title = container.querySelector('.onlinePlayersTitle');
        container.innerHTML = '';
        if (title) container.appendChild(title);

		// Parser les users car ils sont en format JSON string
        const parsedUsers = users.map(userStr => JSON.parse(userStr));

        parsedUsers.forEach(user => {
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

            // Ajouter des interactions
            const nicknameDiv = playerDiv.querySelector('.onlineNickname');
            nicknameDiv.addEventListener('click', () => {
                // Ici vous pouvez ajouter des interactions comme
                // ouvrir un profil, démarrer une conversation privée, etc.
            });

            container.appendChild(playerDiv);
        });
    },

    // Méthode pour envoyer un message
    sendMessage(message) {
        if (this.chatSocket?.readyState === WebSocket.OPEN) {
            this.chatSocket.send(JSON.stringify(message));
        }
    },

	getMessageHistory() {
        return this.messageHistory;
    },

    // Ajouter un listener pour les messages
    addMessageListener(listener) {
        this.messageListeners.add(listener);
    },

    // Retirer un listener
    removeMessageListener(listener) {
        this.messageListeners.delete(listener);
    }
};

// Rendre l'objet disponible globalement
window.wsManager = wsManager;
