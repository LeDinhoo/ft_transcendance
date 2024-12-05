// const wsManager = {
//     chatSocket: null,
//     messageListeners: new Set(),
// 	messageHistory: [],
//     onlinePlayers: new Set(),

//     initializeChatSocket() {
//         if (this.chatSocket?.readyState === WebSocket.OPEN) return;

//         this.chatSocket = new WebSocket('wss://localhost:4430/wss/chat/');

//         this.chatSocket.onopen = () => {
//             console.log('Chat WebSocket Connected');
//         };

//         this.chatSocket.onclose = () => {
//             console.log('Chat WebSocket disconnected');
//             // Tentative de reconnexion après 5 secondes
//             setTimeout(() => this.initializeChatSocket(), 5000);
//         };

//         this.chatSocket.onmessage = (e) => {
//             const data = JSON.parse(e.data);

//             switch (data.type) {
//                 case 'chat_message':
//                     this.messageHistory.push(data);
//                     this.messageListeners.forEach(listener => listener(data));
//                     break;

//                 case 'user_list_update':
//                     try {
//                         this.onlinePlayers.clear(); // Vider la liste existante
//                         data.users.forEach(userStr => {
//                             try {
//                                 const user = JSON.parse(userStr);
//                                 this.onlinePlayers.add(user);
//                             } catch (e) {
//                                 console.error('Error parsing user:', e);
//                             }
//                         });
//                         this.updateOnlinePlayersList([...this.onlinePlayers]);
//                     } catch (error) {
//                         console.error('Error updating users list:', error);
//                     }
//                     break;
//             }
//         };

//         this.chatSocket.onerror = (error) => console.error('WebSocket Error:', error);

//         this.chatSocket.onclose = (event) => {
//             console.log('Chat WebSocket disconnected, code:', event.code);
//             setTimeout(() => this.initializeChatSocket(), 5000);
//         };
//     },

//     updateOnlinePlayersList(users) {
//         const container = document.querySelector('.downLeftFrame');
//         if (!container) return;

//         const title = container.querySelector('.onlinePlayersTitle');
//         container.innerHTML = '';
//         if (title) container.appendChild(title);

//         users.forEach(user => {
//             const playerDiv = document.createElement('div');
//             playerDiv.className = 'onlinePlayers';
//             playerDiv.innerHTML = `
//                 <div class="onlineFlag"></div>
//                 <div class="onlineNickname">
//                     <img src="${user.avatar}" alt="avatar" class="onlineAvatar">
//                     ${user.username}
//                 </div>
//                 <img src="/static/assets/icons/online.svg" class="onlineIcon">
//             `;
//             container.appendChild(playerDiv);
//         });
//     },


//     // Méthode pour envoyer un message
//     sendMessage(message) {
//         if (this.chatSocket?.readyState === WebSocket.OPEN) {
//             this.chatSocket.send(JSON.stringify(message));
//         }
//     },

// 	getMessageHistory() {
//         return this.messageHistory;
//     },

//     // Ajouter un listener pour les messages
//     addMessageListener(listener) {
//         this.messageListeners.add(listener);
//     },

//     // Retirer un listener
//     removeMessageListener(listener) {
//         this.messageListeners.delete(listener);
//     }
// };

// // Rendre l'objet disponible globalement
// window.wsManager = wsManager;


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
            console.log("Raw WebSocket message received:", e.data);
            const data = JSON.parse(e.data);
            console.log("Parsed message:", data);

            switch (data.type) {
                case 'chat_message':
                    this.messageHistory.push(data);
                    this.messageListeners.forEach(listener => listener(data));
                    break;

                case 'private_message':
                    console.log("Private message received:", data);
                    if (window.currentUser &&
                        (data.username === window.currentUser.username ||
                         data.recipient === window.currentUser.username)) {
                        this.messageHistory.push(data);
                        this.messageListeners.forEach(listener => listener(data));
                    }
                    break;

                case 'game_invitation':
                    console.log("Game invitation received:", data);
                    this.messageListeners.forEach(listener => listener(data));
                    break;

                case 'game_invitation_response':
                    console.log("Game invitation response received:", data);
                    this.messageListeners.forEach(listener => listener(data));
                    break;

                case 'user_list_update':
                    try {
                        this.onlinePlayers.clear();
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

                default:
                    console.log("Unhandled message type:", data.type);
            }
        };

        this.chatSocket.onerror = (error) => {
            console.error('WebSocket Error:', error);
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

    sendMessage() {
        const chatInput = document.getElementById('messageInput');
        if (!chatInput || !window.currentUser) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Vérifier si c'est un message privé
        const pmMatch = message.match(/^\/pm\s+(\S+)\s+(.+)$/);
        if (pmMatch) {
            // Extraire le destinataire et le message
            const [, recipient, privateMessage] = pmMatch;

            // Envoyer le message privé
            this.chatSocket.send(JSON.stringify({
                type: "private_message",
                message: privateMessage,
                username: window.currentUser.username,
                avatar: window.currentUser.avatar,
                recipient: recipient
            }));
        } else {
            // Message normal
            this.chatSocket.send(JSON.stringify({
                type: "chat_message",
                message: message,
                username: window.currentUser.username,
                avatar: window.currentUser.avatar
            }));
        }
        chatInput.value = "";
    },

    startPrivateMessage(username) {
        const chatInput = document.getElementById('messageInput');
        if (!chatInput) return;

        chatInput.value = `/pm ${username} `;
        chatInput.focus();
    },

    getMessageHistory() {
        return this.messageHistory;
    },

    addMessageListener(listener) {
        this.messageListeners.add(listener);
    },

    removeMessageListener(listener) {
        this.messageListeners.delete(listener);
    },

    handleMessage(data) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        if (ChatHandler.blockedUsers.has(data.username)) {
            data.originalMessage = data.message;
            data.message = "Message blocked";
        }

        const isCurrentUser = window.currentUser && data.username === window.currentUser.username;
        const messageElement = document.createElement("div");

        messageElement.className = `message ${isCurrentUser ? "sent" : "received"}`;

        if (data.type === "private_message") {
            messageElement.classList.add("private-message");
        }

        if (ChatHandler.blockedUsers.has(data.username)) {
            messageElement.style.opacity = "0.5";
        }

        let messageHeader = data.username;
        if (data.type === "private_message") {
            messageHeader += ` → ${data.recipient}`;
        }

        messageElement.innerHTML = `
            <img src="${data.avatar}"
                alt="${data.username}"
                class="messageAvatar"
                title="Click for options">
            <div class="messageContent">
                <div class="messageHeader">${messageHeader}</div>
                <div class="messageText" ${
                    ChatHandler.blockedUsers.has(data.username)
                        ? 'data-original-text="' + data.originalMessage + '"'
                        : ""
                }>${data.message}</div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

// Rendre l'objet disponible globalement
window.wsManager = wsManager;
