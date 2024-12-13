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
								const user = JSON.parse(userStr); // Parse chaque utilisateur
								this.onlinePlayers.add(user);    // Ajoute à la liste
							} catch (e) {
								console.error("Utilisateur JSON invalide :", userStr);
							}
						});
						console.log("Liste des utilisateurs valides :", [...this.onlinePlayers]);
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
	
		const container = document.querySelector('.downLeftFrame');
		if (!container) {
			console.error("Conteneur `.downLeftFrame` introuvable.");
			return;
		}
	
		const friendsList = await getFriendsList();
		console.log("Liste des amis récupérée :", friendsList);
	
		container.innerHTML = ''; // Vide le conteneur
		const title = container.querySelector('.onlinePlayersTitle');
		if (title) container.appendChild(title);
	
		users.forEach(user => {
			const isFriend = friendsList.some(friend => friend.id === user.id);
			console.log(`Utilisateur : ${user.username}, Est ami : ${isFriend}`);
	
			const playerDiv = document.createElement('div');
			playerDiv.className = 'onlinePlayers';
	
			const iconSrc = isFriend
				? "/static/assets/icons/friends.svg"
				: "/static/assets/icons/online.svg";
	
			playerDiv.innerHTML = `
				<div class="onlineFlag ${user.status === 'in_game' ? 'in-game' : ''}"></div>
				<div class="onlineNickname" data-user-id="${user.id}">
					<img src="${user.avatar}" alt="avatar" class="onlineAvatar">
					${user.username}
				</div>
				<img src="${iconSrc}" class="onlineIcon">
			`;
			container.appendChild(playerDiv);
		});
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
				avatar: window.currentUser.avatar,
				recipient: recipient
			}));
		} else {

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


		let messageClasses = [`message`, isCurrentUser ? "sent" : "received"];

		if (data.type === "private_message") {
			messageClasses.push("private-message");
		}


		messageElement.className = messageClasses.join(" ");

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
                <div class="messageText" ${ChatHandler.blockedUsers.has(data.username)
				? 'data-original-text="' + data.originalMessage + '"'
				: ""
			}>${data.message}</div>
            </div>
        `;

		chatMessages.appendChild(messageElement);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
};

window.wsManager = wsManager;
