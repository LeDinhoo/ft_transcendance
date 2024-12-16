const wsManager = {
  chatSocket: null,
  messageListeners: new Set(),
  messageHistory: [],
  onlinePlayers: new Set(),

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
          this.messageHistory.push(data);
          this.messageListeners.forEach((listener) => listener(data));
          break;

        case "private_message":
          console.log("Private message received:", data);
          if (
            window.currentUser &&
            (data.username === window.currentUser.username ||
              data.recipient === window.currentUser.username)
          ) {
            this.messageHistory.push(data);
            this.messageListeners.forEach((listener) => listener(data));
          }
          break;

        // case "game_invitation":
        //   console.log("Game invitation received:", data);
        //   this.handleGameInvitation(data);
        //   // this.messageListeners.forEach((listener) => listener(data));
        //   // Laisser passer l'événement original pour la popup
        //   if (data.receiver === window.currentUser?.username) {
        //     this.messageListeners.forEach((listener) => listener(data));
        //   }
        //   break;

        case "game_invitation":
          console.log("Game invitation received:", data);
          // Message système dans le chat
          if (data.receiver === window.currentUser?.username) {
            const systemMessage = {
              type: "chat_message",
              message: `${data.sender.username} has invited you to play ${data.gameType}`,
              username: "System",
              avatar: "/static/assets/icons/system.png",
              userId: "system",
              timestamp: new Date().toISOString(),
            };
            this.messageHistory.push(systemMessage);
            this.messageListeners.forEach((listener) =>
              listener(systemMessage)
            );
            // Gestion de la popup séparément
            window.GameInvitationManager?.handleInvitation?.(data);
          }
          break;

        case "game_invitation_response":
          console.log("Game invitation response received:", data);
          this.handleGameInvitationResponse(data);
          // this.messageListeners.forEach((listener) => listener(data));
          // if (data.sender === window.currentUser?.username) {
          //   this.messageListeners.forEach((listener) => listener(data));
          // }
          //   if (data.sender === window.currentUser?.username) {
          //     // Filtre pour ne pas envoyer au handler de messages du chat
          //     this.messageListeners.forEach((listener) => {
          //         if (listener !== this.handleMessage) {
          //             listener(data);
          //         }
          //     });
          // }
          break;

        case "user_list_update":
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
          break;

        default:
          console.log("Unhandled message type:", data.type);
      }
    };

    this.chatSocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  },

  //   handleGameInvitation(data) {
  //     // Ajouter un message système dans le chat
  //     const systemMessage = {
  //       type: "chat_message",
  //       message: `${data.sender.username} has invited you to play ${data.gameType}`,
  //       username: "System",
  //       avatar: "/static/assets/icons/system.png",
  //       timestamp: new Date().toISOString(),
  //     };
  //     this.messageHistory.push(systemMessage);
  //     this.messageListeners.forEach((listener) => listener(systemMessage));
  //   },

  handleGameInvitation(data) {
    const systemMessage = {
      type: "chat_message",
      message: `${data.sender.username} has invited you to play ${data.gameType}`,
      username: "System",
      avatar: "/static/assets/icons/system.png",  // Ajout de l'avatar
      userId: "system",                           // Ajout de l'userId 
      timestamp: new Date().toISOString(),
    };
    this.messageHistory.push(systemMessage);
    this.messageListeners.forEach((listener) => listener(systemMessage));
  },

  handleGameInvitationResponse(data) {
    const responseMessage = {
      type: "chat_message",
      message:
        data.response === "accept"
          ? `${data.receiver} accepted your game invitation. Module remote not done.`
          : `${data.receiver} declined your game invitation.`,
      username: "System",
      avatar: "/static/assets/icons/system.png", // Ajout explicit de l'avatar
      userId: "system", // Ajout d'un userId
      timestamp: new Date().toISOString(),
    };
    this.messageHistory.push(responseMessage);
    this.messageListeners.forEach((listener) => listener(responseMessage));

    if (data.response === "decline" && window.GameInvitationManager) {
      window.GameInvitationManager.closeModal();
    }
  },

  //   handleGameInvitationResponse(data) {
  //     // Ajouter un message système dans le chat pour la réponse
  //     const responseMessage = {
  //       type: "chat_message",
  //       message:
  //         data.response === "accept"
  //           ? `${data.receiver} accepted your game invitation. Module remote not done.`
  //           : `${data.receiver} declined your game invitation.`,
  //       username: "System",
  //       avatar: "/static/assets/icons/system.png",
  //       timestamp: new Date().toISOString(),
  //     };
  //     this.messageHistory.push(responseMessage);
  //     this.messageListeners.forEach((listener) => listener(responseMessage));

  //     // Si l'invitation a été refusée, fermer la modal
  //     if (data.response === "decline" && window.GameInvitationManager) {
  //       window.GameInvitationManager.closeModal();
  //     }
  //   },

  updateOnlinePlayersList(users) {
    const container = document.querySelector(".downLeftFrame");
    if (!container) return;

    const title = container.querySelector(".onlinePlayersTitle");
    container.innerHTML = "";
    if (title) container.appendChild(title);

    users.forEach((user) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "onlinePlayers";
      playerDiv.innerHTML = `
                <div class="onlineFlag ${
                  user.status === "in_game" ? "in-game" : ""
                }"></div>
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
    const chatInput = document.getElementById("messageInput");
    if (!chatInput || !window.currentUser) return;

    const message = chatInput.value.trim();
    if (!message) return;

    const pmMatch = message.match(/^\/pm\s+(\S+)\s+(.+)$/);
    if (pmMatch) {
      const [, recipient, privateMessage] = pmMatch;

      this.chatSocket.send(
        JSON.stringify({
          type: "private_message",
          message: privateMessage,
          username: window.currentUser.username,
          avatar: window.currentUser.avatar,
          recipient: recipient,
        })
      );
    } else {
      this.chatSocket.send(
        JSON.stringify({
          type: "chat_message",
          message: message,
          username: window.currentUser.username,
          avatar: window.currentUser.avatar,
        })
      );
    }
    chatInput.value = "";
  },

  startPrivateMessage(username) {
    const chatInput = document.getElementById("messageInput");
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

  //   handleMessage(data) {
  //     const chatMessages = document.getElementById('chatMessages');
  //     if (!chatMessages) return;

  //     // Ne pas traiter les messages sans type
  //     if (!data || !data.type) {
  //         console.warn("Message invalide reçu:", data);
  //         return;
  //     }

  //     // Configuration spéciale pour les messages système
  //     if (data.username === "System") {
  //         const messageElement = document.createElement("div");
  //         messageElement.className = "message system";
  //         messageElement.innerHTML = `
  //             <div class="messageContent">
  //                 <div class="messageText">${data.message}</div>
  //             </div>
  //         `;
  //         chatMessages.appendChild(messageElement);
  //         chatMessages.scrollTop = chatMessages.scrollHeight;
  //         return;
  //     }

  //     // Vérifier tous les champs requis pour les messages normaux
  //     if (!data.message || !data.username) {
  //         console.warn("Message incomplet reçu:", data);
  //         return;
  //     }

  //     // Nettoyer et normaliser les données
  //     const cleanData = {
  //         message: String(data.message || "").trim(),
  //         username: String(data.username || "").trim(),
  //         avatar: data.avatar || "/static/assets/avatars/default.png",
  //         userId: data.userId || "",
  //         type: data.type,
  //         recipient: data.recipient || null
  //     };

  //     // Créer l'élément de message
  //     const messageElement = document.createElement("div");
  //     const isCurrentUser = window.currentUser && cleanData.username === window.currentUser.username;
  //     let classes = ["message"];

  //     if (isCurrentUser) {
  //         classes.push("sent");
  //     } else {
  //         classes.push("received");
  //     }

  //     if (cleanData.type === "private_message") {
  //         classes.push("private-message");
  //     }

  //     messageElement.className = classes.join(" ");

  //     // Construction du header pour les messages privés
  //     let headerText = cleanData.username;
  //     if (cleanData.type === "private_message" && cleanData.recipient) {
  //         headerText += ` → ${cleanData.recipient}`;
  //     }

  //     messageElement.innerHTML = `
  //         <img src="${cleanData.avatar}"
  //             alt="${cleanData.username}"
  //             class="messageAvatar"
  //             title="Click for options">
  //         <div class="messageContent">
  //             <div class="messageHeader"
  //                  data-user-id="${cleanData.userId}"
  //                  data-username="${cleanData.username}">
  //                 ${headerText}
  //             </div>
  //             <div class="messageText">${cleanData.message}</div>
  //         </div>
  //     `;

  //     chatMessages.appendChild(messageElement);
  //     chatMessages.scrollTop = chatMessages.scrollHeight;
  // }

  handleMessage(data) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;

    // Ne pas traiter les messages sans type
    if (!data || !data.type) {
      console.warn("Message invalide reçu:", data);
      return;
    }

    // Configuration spéciale pour les messages système
    if (data.username === "System") {
      const messageElement = document.createElement("div");
      messageElement.className = "message system";
      // Style inline pour les messages système - pas besoin d'avatar
      messageElement.style.cssText = `
            background-color: rgba(43, 93, 245, 0.1);
            margin: 8px auto;
            padding: 8px 16px;
            border-radius: 8px;
            max-width: 80%;
            text-align: center;
            font-style: italic;
            color: #2b5df5;
        `;
      messageElement.innerHTML = `
            <div class="messageContent">
                <div class="messageText">${data.message}</div>
            </div>
        `;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return;
    }

    // Vérifier tous les champs requis pour les messages normaux
    if (!data.message || !data.username) {
      console.warn("Message incomplet reçu:", data);
      return;
    }

    // Nettoyer et normaliser les données
    const cleanData = {
      message: String(data.message || "").trim(),
      username: String(data.username || "").trim(),
      avatar: data.avatar || "/static/assets/avatars/default.png",
      userId: data.userId || "",
      type: data.type,
      recipient: data.recipient || null,
    };

    // Ne pas afficher les messages vides
    if (!cleanData.message.length) {
      return;
    }

    // Créer l'élément de message
    const messageElement = document.createElement("div");
    const isCurrentUser =
      window.currentUser && cleanData.username === window.currentUser.username;
    let classes = ["message"];

    if (isCurrentUser) {
      classes.push("sent");
    } else {
      classes.push("received");
    }

    if (cleanData.type === "private_message") {
      classes.push("private-message");
    }

    messageElement.className = classes.join(" ");

    // Construction du header pour les messages privés
    let headerText = cleanData.username;
    if (cleanData.type === "private_message" && cleanData.recipient) {
      headerText += ` → ${cleanData.recipient}`;
    }

    // Vérifier que l'avatar existe avant de l'utiliser
    const avatarHtml = cleanData.avatar
      ? `
        <img src="${cleanData.avatar}"
            alt="${cleanData.username}"
            class="messageAvatar"
            title="Click for options">
    `
      : "";

    messageElement.innerHTML = `
        ${avatarHtml}
        <div class="messageContent">
            <div class="messageHeader"
                 data-user-id="${cleanData.userId}"
                 data-username="${cleanData.username}">
                ${headerText}
            </div>
            <div class="messageText">${cleanData.message}</div>
        </div>
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  },

  // handleMessage(data) {
  //     const chatMessages = document.getElementById('chatMessages');
  //     if (!chatMessages) return;

  //     if (ChatHandler.blockedUsers.has(data.username)) {
  //         data.originalMessage = data.message;
  //         data.message = "Message blocked";
  //     }

  //     const isCurrentUser = window.currentUser && data.username === window.currentUser.username;
  //     const messageElement = document.createElement("div");

  //     let messageClasses = [`message`, isCurrentUser ? "sent" : "received"];

  //     if (data.type === "private_message") {
  //         messageClasses.push("private-message");
  //     }

  //     messageElement.className = messageClasses.join(" ");

  //     if (ChatHandler.blockedUsers.has(data.username)) {
  //         messageElement.style.opacity = "0.5";
  //     }

  //     let messageHeader = data.username;
  //     if (data.type === "private_message") {
  //         messageHeader += ` → ${data.recipient}`;
  //     }

  //     messageElement.innerHTML = `
  //         <img src="${data.avatar}"
  //             alt="${data.username}"
  //             class="messageAvatar"
  //             title="Click for options">
  //         <div class="messageContent">
  //             <div class="messageHeader">${messageHeader}</div>
  //             <div class="messageText" ${
  //                 ChatHandler.blockedUsers.has(data.username)
  //                     ? 'data-original-text="' + data.originalMessage + '"'
  //                     : ""
  //             }>${data.message}</div>
  //         </div>
  //     `;

  //     chatMessages.appendChild(messageElement);
  //     chatMessages.scrollTop = chatMessages.scrollHeight;
  // }
};

window.wsManager = wsManager;
