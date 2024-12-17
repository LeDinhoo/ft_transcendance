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
          if (data.receiver === window.currentUser?.username) {
            const systemMessage = {
              type: "chat_message",
              message: `${data.sender.username} has invited you to play ${data.gameType}`,
              username: "System",
              avatar: "/static/assets/icons/system.png",
              userId: "system",
              timestamp: new Date().toISOString(),
            };

            const messageId = this.addMessageToHistory(systemMessage);
            this.messageListeners.forEach((listener) =>
              listener({ ...systemMessage, id: messageId })
            );

            if (window.GameInvitationManager?.handleInvitation) {
              window.GameInvitationManager.handleInvitation(data);
            }
          }
          break;

        case "game_invitation_response":
          console.log(`Game event received:`, data);
          this.handleGameInvitationResponse(data);
          break;

        case "user_list_update":
          this.handleUserListUpdate(data);
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
    const responseMessage = {
      type: "chat_message",
      message:
        data.response === "accept"
          ? `${data.receiver} accepted your game invitation.`
          : `${data.receiver} declined your game invitation.`,
      username: "System",
      avatar: "/static/assets/icons/system.png",
      userId: "system",
      timestamp: new Date().toISOString(),
    };

    const messageId = this.addMessageToHistory(responseMessage);

    this.messageListeners.forEach((listener) =>
      listener({ ...responseMessage, id: messageId })
    );

    if (data.response === "decline" && window.GameInvitationManager) {
      window.GameInvitationManager.closeModal();
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
        ? "/static/assets/icons/blocked.svg"
        : isFriend
        ? "/static/assets/icons/friends.svg"
        : "/static/assets/icons/online.svg";

      const playerDiv = document.createElement("div");
      playerDiv.className = "onlinePlayers";
      playerDiv.innerHTML = `
          <img src="/static/assets/icons/connected_circle.svg" class="onlineFlag ${
            user.status === "in_game" ? "in-game" : ""
          }">
          <div class="onlineNickname" data-username="${
            user.username
          }" data-user-id="${user.id}">
            <img src="${user.avatar}" class="onlineAvatar">
            ${user.username}
          </div>
          <img src="${iconSrc}" class="onlineIcon">
        `;

      listContainer.appendChild(playerDiv);
    });
  },

  sendMessage() {
    const chatInput = document.getElementById("messageInput");
    if (!chatInput || !window.currentUser) return;

    const message = chatInput.value.trim();
    if (!message) return;

    const pmMatch = message.match(/^\/pm\s+(\S+)\s+(.+)$/);
    const payload = pmMatch
      ? {
          type: "private_message",
          recipient: pmMatch[1],
          message: pmMatch[2],
          username: window.currentUser.username,
          avatar: window.currentUser.avatar,
        }
      : {
          type: "chat_message",
          message,
          username: window.currentUser.username,
          avatar: window.currentUser.avatar,
        };

    this.chatSocket.send(JSON.stringify(payload));
    chatInput.value = "";
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
