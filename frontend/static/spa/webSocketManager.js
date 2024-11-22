// webSocketManager.js
(function (global) {
    const webSocketManager = {
        chatSocket: null,

        initialize() {
            if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
                console.log('WebSocket is already connected.');
                return;
            }

            this.chatSocket = new WebSocket('wss://localhost:4430/wss/chat/');

            this.chatSocket.onopen = () => {
                console.log('Chat WebSocket Connected');
            };

            this.chatSocket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                console.log('Message received:', data);
            };

            this.chatSocket.onclose = () => {
                console.warn('Chat WebSocket disconnected. Attempting to reconnect...');
                setTimeout(() => this.initialize(), 5000); // Retry after 5 seconds
            };
        }
    };

    // Attach it to the global scope (e.g., window object) for global access
    global.webSocketManager = webSocketManager;
})(window);
