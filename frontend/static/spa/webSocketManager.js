async function getFriendsList() {
    try {
        const response = await fetch('/api/friends/list/', {
            credentials: 'include'
        });
        const data = await response.json();
        return data.friends || [];
    } catch (error) {
        console.error('Error fetching friends list:', error);
        return [];
    }
}

async function getBlockedUsersList() {
    try {
        const response = await fetch('/api/blocked/list/', {
            credentials: 'include'
        });
        const data = await response.json();
        return data.blocked_users || [];
    } catch (error) {
        console.error('Error fetching blocked users list:', error);
        return [];
    }
}

const wsManager = {
	chatSocket: null,
	messageListeners: new Set(),
	messageHistory: new Map(),
	onlinePlayers: new Set(),
	isUserBlocked: null,
	MAX_MESSAGES: 20,

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
				case 'private_message':
					const messageId = this.addMessageToHistory(data);
					this.messageListeners.forEach(listener => listener({...data, id: messageId}));
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
								console.error("Utilisateur JSON invalide :", userStr);
							}
						});
						this.updateOnlinePlayersList([...this.onlinePlayers]);
					} catch (error) {
						console.error('Erreur lors de la mise à jour de la liste des utilisateurs :', error);
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


	async updateOnlinePlayersList(users) {
		console.log("Appel de updateOnlinePlayersList avec les utilisateurs :", users);

		if (!window.currentUser) {
			try {
				const response = await fetch("/api/profil/", {
					credentials: "include",
				});
				if (response.ok) {
					const userData = await response.json();
					window.currentUser = {
						...userData,
						id: userData.id || userData.user_id
					};
				}
			} catch (error) {
				console.error("Erreur lors de la récupération du profil:", error);
				return;
			}
		}

		const listContainer = document.getElementById('onlinePlayersList');
		if (!listContainer) {
			console.error("Conteneur `#onlinePlayersList` introuvable.");
			return;
		}

		try {
			// Récupérer la liste des amis
			const friendsList = await getFriendsList();

			// Récupérer la liste des utilisateurs bloqués directement via l'API
			let blockedUsers = new Set();
			try {
				const blockedResponse = await fetch('/api/blocked/list/', {
					credentials: 'include'
				});
				if (blockedResponse.ok) {
					const blockedData = await blockedResponse.json();
					blockedUsers = new Set(blockedData.blocked_users.map(user => String(user.id)));
				}
			} catch (error) {
				console.error('Erreur lors de la récupération des utilisateurs bloqués:', error);
			}

			listContainer.innerHTML = '';

			users.forEach(user => {
				const isFriend = friendsList.some(friend => friend.id === user.id);
				const isCurrentUser = window.currentUser && String(user.id) === String(window.currentUser.id);
				const isBlocked = blockedUsers.has(String(user.id));

				const playerDiv = document.createElement('div');
				playerDiv.className = 'onlinePlayers';

				let iconSrc;
				if (isCurrentUser) {
					iconSrc = "/static/assets/icons/account_circle.svg";
				} else if (isBlocked) {
					iconSrc = "/static/assets/icons/blocked.svg";
				} else if (isFriend) {
					iconSrc = "/static/assets/icons/friends.svg";
				} else {
					iconSrc = "/static/assets/icons/online.svg";
				}

				playerDiv.innerHTML = `
					<img src="/static/assets/icons/connected_circle.svg"
						 class="onlineFlag ${user.status === 'in_game' ? 'in-game' : ''}"
						 alt="status">
					<div class="onlineNickname"
						 data-username="${user.username}"
						 data-user-id="${user.id}">
						<img src="${user.avatar}" alt="avatar" class="onlineAvatar">
						${user.username}
					</div>
					<img src="${iconSrc}" class="onlineIcon">
				`;
				listContainer.appendChild(playerDiv);
			});

		} catch (error) {
			console.error("Erreur lors de la mise à jour de la liste des joueurs:", error);
		}
	},

	sendMessage() {
		const chatInput = document.getElementById('messageInput');
		if (!chatInput || !window.currentUser) return;

		const message = chatInput.value.trim();
		if (!message) return;


		const pmMatch = message.match(/^\/pm\s+(\S+)\s+(.+)$/);
		if (pmMatch) {

			const [, recipient, privateMessage] = pmMatch;


			this.chatSocket.send(JSON.stringify({
				type: "private_message",
				message: privateMessage,
				username: window.currentUser.username,
				userId: window.currentUser.id,
				avatar: window.currentUser.avatar,
				recipient: recipient
			}));
		} else {

			this.chatSocket.send(JSON.stringify({
				type: "chat_message",
				message: message,
				userId: window.currentUser.id,
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

	addMessageToHistory(message) {
        const messageId = crypto.randomUUID(); // Génère un ID unique
        message.id = messageId;

        // Ajouter le nouveau message
        this.messageHistory.set(messageId, message);

        // Si on dépasse la limite, supprimer le plus ancien message
        if (this.messageHistory.size > this.MAX_MESSAGES) {
            const oldestKey = this.messageHistory.keys().next().value;
            this.messageHistory.delete(oldestKey);
        }

        return messageId;
    },

	getMessageHistory() {
		return Array.from(this.messageHistory.values());
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

		const isBlocked = ChatHandler.blockedUsers.has(String(data.userId));
		if (isBlocked) {
			data.originalMessage = data.message;
			data.message = "Message bloqué";
		}

		const isCurrentUser = window.currentUser && data.username === window.currentUser.username;
		const messageElement = document.createElement("div");

		let messageClasses = [`message`, isCurrentUser ? "sent" : "received"];
		if (data.type === "private_message") {
			messageClasses.push("private-message");
		}

		messageElement.className = messageClasses.join(" ");
		if (isBlocked) {
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
				<div class="messageHeader" data-user-id="${data.userId}">${messageHeader}</div>
				<div class="messageText" ${isBlocked ? 'data-original-text="' + data.originalMessage + '"' : ""}>
					${data.message}
				</div>
			</div>
		`;

		chatMessages.appendChild(messageElement);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
};

window.wsManager = wsManager;
