async function getFriendsList() {
	try {
		const response = await fetch("/api/friends/list/", {
			credentials: "include",
		});
		const data = await response.json();
		return data.friends || [];
	} catch (error) {
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


		this.chatSocket.onopen = () => {
		};

		this.chatSocket.onclose = () => {
			setTimeout(() => this.initializeChatSocket(), 5000);
		};

		this.chatSocket.onmessage = (e) => {
			const data = JSON.parse(e.data);

			switch (data.type) {
				case "chat_message":
				case "private_message":
					const messageId = this.addMessageToHistory(data);
					this.messageListeners.forEach((listener) =>
						listener({ ...data, id: messageId })
					);
					break;

				// Dans webSocketManager.js, dans le switch de this.chatSocket.onmessage
				case "user_update":
					// First update the player in the onlinePlayers set
					const updatedPlayers = new Set(
						[...this.onlinePlayers].map(user =>
							user.id === data.user.id
								? {...user, ...data.user}
								: user
						)
					);
					this.onlinePlayers = updatedPlayers;
					// Then force a refresh of the UI list
					this.handleUserListUpdate({
						users: [...this.onlinePlayers].map(user => JSON.stringify(user))
					});
					break;

				case "game_invitation":
					

					if (window.currentUser) {
						const receiverId = Number(data.receiverId);
						const currentUserId = Number(window.currentUser.id);
						
						if (receiverId === currentUserId) {
							if (window.GameInvitationManager?.handleInvitation) {
								window.GameInvitationManager.handleInvitation(data);
							}
						} else {
						}
					} else {
					}
					break;

				case "game_invitation_response":
					this.handleGameInvitationResponse(data);
					break;

				case "user_list_update":
					this.handleUserListUpdate(data);
					break;
				
				case "error": 
					if (window.ChatHandler?.showNotification) {
						window.ChatHandler.showNotification(data.message);
					}
					break;

				default:
			}
		};

		this.chatSocket.onerror = (error) => {
		};
	},

	handleGameInvitationResponse(data) {
		
		if (data.response === "accept") {
			if (data.sender.id === window.currentUser?.id || data.receiverId === window.currentUser?.id) {
				showErrorPopup("notImplemented");
			}
		} else if (data.response === "decline") {
			if (data.sender.id === window.currentUser?.id) {
				showInfoPopup("inviteDeclined");
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
				}
			});
			this.updateOnlinePlayersList([...this.onlinePlayers]);
		} catch (error) {
		}
	},

	async updateOnlinePlayersList(users) {

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
					? "/static/assets/icons/blocked.svg" 
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
