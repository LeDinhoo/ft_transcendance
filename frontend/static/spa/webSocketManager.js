const wsManager = {
    chatSocket: null,
    messageListeners: new Set(),
	messageHistory: [],

    initializeChatSocket() {
        if (this.chatSocket?.readyState === WebSocket.OPEN) {
            return; // Déjà connecté
        }

        this.chatSocket = new WebSocket('wss://localhost:4430/wss/chat/');

        this.chatSocket.onopen = () => {
            console.log('Chat WebSocket Connected');
        };

        this.chatSocket.onclose = () => {
            console.log('Chat WebSocket disconnected');
            // Tentative de reconnexion après 5 secondes
            setTimeout(() => this.initializeChatSocket(), 5000);
        };

        this.chatSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            // Stocker le message dans l'historique
            this.messageHistory.push(data);
            // Notifier les listeners
            this.messageListeners.forEach(listener => listener(data));
        };
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
