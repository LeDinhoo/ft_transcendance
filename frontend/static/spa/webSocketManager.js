async function getFriendsList() {
	try {
		const response = await fetch("/api/friends/list/", {
			credentials: "include",
		});
		const data = await response.json();
		return data.friends || [];
	} catch (error) {
		console.error("Error fetching friends list:", error);
		return [];
	}
}

async function getBlockedUsersList() {
	try {
		const response = await fetch("/api/blocked/list/", {
			credentials: "include",
		});
		const data = await response.json();
		return data.blocked_users || [];
	} catch (error) {
		console.error("Error fetching blocked users list:", error);
		return [];
	}
}

const wsManager = {
	chatSocket: null,
	messageListeners: new Set(),
	messageHistory: new Map(),
	onlinePlayers: new Set(),
	MAX_MESSAGES: 20,

	initializeChatSocket() {
		if (this.chatSocket?.readyState === WebSocket.OPEN) return;

		this.chatSocket = new WebSocket("wss://localhost:4430/wss/chat/");

		console.log("TEST\n:NEW SOCKET CREATED\n");

		this.chatSocket.onopen = () => {
			console.log("Chat WebSocket Connected");
		};

		this.chatSocket.onclose = () => {
			console.log("Chat WebSocket disconnected");
			setTimeout(() => this.initializeChatSocket(), 5000);
		};

		this.chatSocket.onmessage = (e) => {
			console.log("Raw WebSocket message received:", e.data);
			const data = JSON.parse(e.data);
			console.log("Parsed message:", data);

			switch (data.type) {
				case "chat_message":
				case "private_message":
					const messageId = this.addMessageToHistory(data);
					this.messageListeners.forEach((listener) =>
						listener({ ...data, id: messageId })
					);
					break;

				case "game_invitation":
					console.log("Game invitation received:", data);
					console.log("Types - receiverId:", typeof data.receiverId, "currentUser.id:", typeof window.currentUser?.id);
					console.log("Values - receiverId:", data.receiverId, "currentUser.id:", window.currentUser?.id);
					
					// Assurons-nous que currentUser est défini
					if (window.currentUser) {
						// Convertissons les deux en nombres pour la comparaison
						const receiverId = Number(data.receiverId);
						const currentUserId = Number(window.currentUser.id);
						
						if (receiverId === currentUserId) {
							console.log("Match found - Showing invitation");
							if (window.GameInvitationManager?.handleInvitation) {
								window.GameInvitationManager.handleInvitation(data);
							}
						} else {
							console.log(`No match - receiverId: ${receiverId} currentUser.id: ${currentUserId}`);
						}
					} else {
						console.log("currentUser not initialized");
					}
					break;

				case "game_invitation_response":
					console.log(`Game event received:`, data);
					this.handleGameInvitationResponse(data);
					break;

				case "user_list_update":
					this.handleUserListUpdate(data);
					break;
				
				case "error":  // Ajouter ce cas
					if (window.ChatHandler?.showNotification) {
						window.ChatHandler.showNotification(data.message);
					}
					break;

				default:
					console.log("Unhandled message type:", data.type);
			}
		};

		this.chatSocket.onerror = (error) => {
			console.error("WebSocket Error:", error);
		};
	},

	handleGameInvitationResponse(data) {
		console.log("Handling game invitation response:", data);
		
		if (data.response === "accept") {
			// Si je suis l'expéditeur ou le destinataire, afficher la notification
			if (data.sender.id === window.currentUser?.id || data.receiverId === window.currentUser?.id) {
				window.GameInvitationManager?.showNotification(
					"Remote play feature is not implemented yet. You can play 1v1 locally!"
				);
			}
		} else if (data.response === "decline") {
			// Si je suis l'expéditeur, montrer la notification de refus
			if (data.sender.id === window.currentUser?.id) {
				window.GameInvitationManager?.showNotification(
					`${data.receiver} declined your game invitation.`
				);
			}
		}
	},
	

	handleUserListUpdate(data) {
		try {
			this.onlinePlayers.clear();
			data.users.forEach((userStr) => {
				try {
					const user = JSON.parse(userStr);
					this.onlinePlayers.add(user);
				} catch (e) {
					console.error("Error parsing user:", e);
				}
			});
			this.updateOnlinePlayersList([...this.onlinePlayers]);
		} catch (error) {
			console.error("Error updating users list:", error);
		}
	},

	async updateOnlinePlayersList(users) {
		console.log("Updating online players list:", users);

		const listContainer = document.getElementById("onlinePlayersList");
		if (!listContainer) return;

		const friendsList = await getFriendsList();
		const blockedUsers = new Set(
			(await getBlockedUsersList()).map((u) => String(u.id))
		);

		listContainer.innerHTML = "";

		users.forEach((user) => {
			const isFriend = friendsList.some((friend) => friend.id === user.id);
			const isBlocked = blockedUsers.has(String(user.id));
			const isCurrentUser =
				window.currentUser && String(user.id) === String(window.currentUser.id);

			let iconSrc = isCurrentUser
				? "/static/assets/icons/account_circle.svg"
				: isBlocked
					? "/static/assets/icons/blocked.svg"  // Cette icône indique que l'utilisateur est bloqué
					: isFriend
						? "/static/assets/icons/friends.svg"
						: "/static/assets/icons/online.svg";

			const playerDiv = document.createElement("div");
			playerDiv.className = "onlinePlayers";
			playerDiv.innerHTML = `
          <img src="/static/assets/icons/connected_circle.svg" class="onlineFlag ${user.status === "in_game" ? "in-game" : ""
				}">
          <div class="onlineNickname ${isBlocked ? 'blocked-user' : ''}" data-username="${user.username
				}" data-user-id="${user.id}">
            <img src="${user.avatar}" class="onlineAvatar">
            ${user.username}
          </div>
          <img src="${iconSrc}" class="onlineIcon ${isBlocked ? 'blocked-icon' : ''}" 
               title="${isBlocked ? 'Unblock user' : ''}"
               style="${isBlocked ? 'cursor: pointer;' : ''}"
               onclick="${isBlocked ? `ChatHandler.toggleBlockUser('${user.id}', '${user.username}')` : ''}"
          >
        `;

			listContainer.appendChild(playerDiv);
		});
	},

	addMessageToHistory(message) {
		const messageId = crypto.randomUUID();
		message.id = messageId;
		this.messageHistory.set(messageId, message);

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
};

window.wsManager = wsManager;
