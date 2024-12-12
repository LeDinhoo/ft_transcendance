function updateProfilOnHome() {
	console.log("fonction updateprofilonhome appelee...");
	fetch("/api/profil/", {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Erreur HTTP: ${response.status}`);
			}
			return response.json();
		})
		.then((data) => {
			if (data.username && data.email) {
				document.getElementById("nicknameProfilUser").innerText = data.username;

				const win_ratio = data.win_ratio ?? 0;
				const totalGames = data.total_games ?? 0;
				console.log("total games : ", totalGames);

				let rankKey;
				let rankImage;
				if (win_ratio < 33) {
					rankImage = "bronze";
					rankKey = "home.ranks.bronze";
				} else if (win_ratio < 66 && win_ratio >= 33) {
					rankImage = "silver";
					rankKey = "home.ranks.silver";
				} else if ((win_ratio < 80 && win_ratio >= 66) || (win_ratio >= 66 && totalGames < 5)) {
					rankImage = "gold";
					rankKey = "home.ranks.gold";
				} else if (win_ratio >= 80 && totalGames >= 5) {
					rankImage = "Platinum";
					rankKey = "home.ranks.Platinum";
				}

				document.getElementById("rankImage").src = `static/assets/icons/${rankImage}.png`;
				const rankText = document.getElementById("rankText");
				if (rankText) {
					rankText.setAttribute('data-translate', rankKey);
					// Recharger les traductions pour ce nouvel élément
					loadTranslations(getPreferredLanguage());
				}

				const avatarUrl =
					data.avatar && data.avatar.trim()
						? data.avatar
						: "/static/assets/avatars/buffalo.png";
				document.getElementById("avatarProfilUser").src = avatarUrl;
			}
		})
		.catch((error) => {
			console.error("Erreur lors de la récupération du profil :", error);
		});
}

let currentUser = null;

function initializeHome() {
	console.log("fonction initializeHome appelée..");
	// wsManager.updateOnlinePlayersList([...wsManager.onlinePlayers]);
	// ContextMenu.initialize(); //DOESNT WORK
	console.log("TEST1\n");

	// Constants and DOM Elements
	const PLAYER_STATUSES = {
		ONLINE: "Online",
		IN_GAME: "In Game",
	};

	const DOM = {
		profil: {
			modal: document.getElementById("profilModal"),
			closeBtn: document.querySelector(".close-profil-modal"),
			avatar: document.getElementById("profilAvatar"),
			nickname: document.getElementById("profilNickname"),
			rankIcon: document.getElementById("profilRankIcon"),
			rankText: document.getElementById("profilRankText"),
			totalGames: document.getElementById("totalGames"),
			winRate: document.getElementById("winRate"),
		},
		game: {
			options: document.querySelectorAll(".gameOption"),
			modeOptions: document.querySelectorAll(".modeOption"),
			playButton: document.querySelector(".playHomePage"),
		},
		sections: {
			avatarSection: document.querySelector(".avatarSection"),
			rankSection: document.querySelector(".rankSection"),
		},
		onlineGame: {
			modal: document.querySelector(".online-game-modal"),
			closeBtn: document.querySelector(".close-online-game"),
			launchBtn: document.querySelector(".launch-game"),
			content: document.querySelector(".online-game-sections"),
			loading: document.querySelector(".game-loading"),
			friendsList: document.getElementById("friendsList"),
			playersList: document.getElementById("onlinePlayersList"),
		},
		chat: {
			messages: document.getElementById("chatMessages"),
			input: document.getElementById("messageInput"),
			sendButton: document.getElementById("sendMessage"),
		},
	};

	updateProfilOnHome();



	let isGameInitialized = false;
	window.currentUser = null;

	class ChatHandler {
		static async initialize() {
			try {
				const response = await fetch("/api/profil/", {
					credentials: "include",
				});

				if (response.ok) {
					window.currentUser = await response.json();
					ChatHandler.blockedUsers = new Set();
					ChatHandler.setupEventListeners();
					ChatHandler.initializeContextMenu();
					window.wsManager.addMessageListener(ChatHandler.handleMessage);
					//   wsManager.updateOnlinePlayersList([...wsManager.onlinePlayers]);

					const messageHistory = window.wsManager.getMessageHistory();
					messageHistory.forEach((message) =>
						ChatHandler.handleMessage(message)
					);
				}
			} catch (error) {
				console.error("Erreur lors de l'initialisation du chat:", error);
			}
		}

		static async sendFriendRequest(messageElement) {
			const headerElement = messageElement.querySelector(".messageHeader");
			const userId = headerElement?.dataset?.userId;

			if (!userId) {
				ChatHandler.showNotification(window.getTranslation('home.notifications.friendRequest.noUser'));
				return;
			}

			if (userId === String(window.currentUser?.id)) {
				ChatHandler.showNotification(window.getTranslation('home.notifications.friendRequest.selfRequest'));
				return;
			}

			try {
				const response = await fetch('/api/friends/send-request/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						receiver_id: userId.trim() // Assurez-vous qu'il n'y a pas d'espaces
					})
				});

				const data = await response.text();
				console.log("Response raw data:", data); // Debug log

				try {
					const jsonData = JSON.parse(data);
					ChatHandler.showNotification(jsonData.message || 'Friend request sent successfully');
				} catch (e) {
					console.error('Error parsing response:', e);
					ChatHandler.showNotification('Error processing server response');
				}
			} catch (error) {
				console.error('Error:', error);
				ChatHandler.showNotification('Error sending friend request');
			}
		}

		static setupEventListeners() {
			if (DOM.chat.sendButton) {
			  DOM.chat.sendButton.addEventListener("click", ChatHandler.sendMessage);
			}
	  
			if (DOM.chat.input) {
			  DOM.chat.input.addEventListener("keypress", (e) => {
				if (e.key === "Enter") {
				  ChatHandler.sendMessage();
				}
			  });
			}
		}
	  
		static showNotification(message) {
			// Créer l'élément de notification
			const notification = document.createElement("div");
			notification.classList.add("confirmation-animation");
			notification.innerHTML = `
				<div class="confirmation-icon"></div>
				// Utiliser une traduction pour les messages de notification
				<div class="confirmation-text" data-translate="home.notifications.${message}"></div>
			`;
	
			// Ajouter au DOM et appliquer la traduction
			document.querySelector(".homePageMain").appendChild(notification);
			loadTranslations(getPreferredLanguage());
	
			// Supprimer après délai
			setTimeout(() => notification.remove(), 2000);
		}

		static initializeContextMenu() {
			const chatMessages = DOM.chat.messages;
			let activeMenu = null;

			chatMessages.addEventListener("click", async (e) => {
				const avatar = e.target.closest(".messageAvatar");
				if (!avatar) return;

				e.preventDefault();
				e.stopPropagation();

				if (activeMenu) {
					activeMenu.remove();
					activeMenu = null;
				}

				const messageElement = avatar.closest(".message");
				const headerElement = messageElement.querySelector(".messageHeader");
				const userId = headerElement.dataset.userId;
				const username = headerElement.textContent.trim();
				const avatarSrc = avatar.src;
				const isBlocked = ChatHandler.blockedUsers.has(username);

				// Vérification si c'est notre message
				const isOwnMessage = userId === String(window.currentUser.id);
				console.log('Comparaison des IDs :', {
					messageUserId: userId,
					currentUserId: window.currentUser.id,
					isOwnMessage: isOwnMessage
				});

				const menu = document.createElement("div");
				menu.className = "chat-context-menu";

				menu.innerHTML = `
            <div class="chat-menu-option" data-translate="home.context.profil" data-action="profil">
                See profil
            </div>
            ${!isOwnMessage ? `
                <div class="chat-menu-option" data-translate="home.context.addFriend" data-action="add-friend">
                    Add friend
                </div>
                <div class="chat-menu-option" data-translate="home.context.invite" data-action="send-invitation">
                    Send game invitation
                </div>
            ` : ''}
            <div class="chat-menu-option" data-action="block" data-translate="${isBlocked ? 'home.context.unblock' : 'home.context.block'
					}">
                ${isBlocked ? "Unblock user" : "Block user"}
            </div>
            <div class="chat-menu-option" data-translate="home.context.message" data-action="private-message">
                Private message
            </div>
        `;

				document.body.appendChild(menu);
				const rect = avatar.getBoundingClientRect();
				ChatHandler.positionMenuWithinViewport(menu, rect);

				activeMenu = menu;

				menu.addEventListener("click", async (e) => {
					const option = e.target.closest(".chat-menu-option");
					if (!option) return;

					const action = option.dataset.action;
					if (action === "send-invitation") {
						console.log("Sending invitation from chat to:", username);
						GameInvitationManager.sendInvitation(username);
					} else if (action === "profil") {
						const playerData = {
							nickname: username,
							avatar: avatarSrc,
							rank: "Bronze",
							stats: { totalGames: 0, winRate: "0%" },
						};
						profilModal.show(playerData);
					} else if (action === "add-friend") {
						await ChatHandler.sendFriendRequest(messageElement);
					} else if (action === "block") {
						ChatHandler.toggleBlockUser(username);
						ChatHandler.showBlockConfirmation(username, !isBlocked);
					} else if (action === "private-message") {
						ChatHandler.startPrivateMessage(username);
					}

					menu.remove();
					activeMenu = null;
				});
			});

			document.addEventListener("click", (e) => {
				if (activeMenu &&
					!e.target.closest(".chat-context-menu") &&
					!e.target.closest(".messageAvatar")
				) {
					activeMenu.remove();
					activeMenu = null;
				}
			});

			chatMessages.addEventListener("scroll", () => {
				if (activeMenu) {
					activeMenu.remove();
					activeMenu = null;
				}
			});
		}

		static toggleBlockUser(username) {
			if (ChatHandler.blockedUsers.has(username)) {
				ChatHandler.blockedUsers.delete(username);
			} else {
				ChatHandler.blockedUsers.add(username);
			}

			const messages = DOM.chat.messages.querySelectorAll(".message");
			messages.forEach((message) => {
				const messageUsername = message.querySelector(".messageHeader").textContent;
				if (messageUsername === username) {
					message.style.opacity = ChatHandler.blockedUsers.has(username) ? "0.5" : "1";
					const messageText = message.querySelector(".messageText");
					if (ChatHandler.blockedUsers.has(username)) {
						messageText.dataset.originalText = messageText.textContent;
						// Traduire "Message blocked"
						messageText.setAttribute('data-translate', 'home.chat.blockedMessage');
					} else {
						messageText.textContent = messageText.dataset.originalText || messageText.textContent;
					}
				}
			});
		}

		static showBlockConfirmation(username, isBlocking) {
			const homePageMain = document.querySelector(".homePageMain");
			if (!homePageMain) return;

			const confirmation = document.createElement("div");
			confirmation.classList.add("confirmation-animation");

			// Créer le message avec traduction
			confirmation.innerHTML = `
            <div class="confirmation-icon"></div>
            <div class="confirmation-text"
                 data-translate="${isBlocking ? 'home.chat.userBlocked' : 'home.chat.userUnblocked'}"
                 data-translate-params='{"username": "${username}"}'>
            </div>
        `;

			homePageMain.appendChild(confirmation);
			loadTranslations(getPreferredLanguage());
			setTimeout(() => confirmation.remove(), 2000);
		}

		static startPrivateMessage(username) {
			if (!DOM.chat.input) return;

			DOM.chat.input.value = `/pm ${username} `;
			DOM.chat.input.focus();
		}

		static handleMessage(data) {
			if (!DOM.chat.messages) return;

			if (ChatHandler.blockedUsers.has(data.username)) {
				data.originalMessage = data.message;
				// Utiliser getNestedTranslation à la place de window.getTranslation
				const translations = loadedTranslations[getPreferredLanguage()];
				data.message = translations ? getNestedTranslation('home.chat.blockedMessage', translations) : "Message blocked";
			}

			const isCurrentUser =
				window.currentUser && data.username === window.currentUser.username;
			const messageElement = document.createElement("div");
			messageElement.className = `message ${isCurrentUser ? "sent" : "received"
				}`;

			if (ChatHandler.blockedUsers.has(data.username)) {
				messageElement.style.opacity = "0.5";
			}

			if (data.type === "private_message") {
				messageElement.classList.add("private-message");
			}

			messageElement.innerHTML = `
          <img src="${data.avatar}"
              alt="${data.username}"
              class="messageAvatar"
             data-translate="home.chat.clickForOptions">
          <div class="messageContent">
              <div class="messageHeader"
                   data-user-id="${data.userId}"
                   data-username="${data.username}">
                  ${data.username}
              </div>
              <div class="messageText">${data.message}</div>
          </div>
      `;

			DOM.chat.messages.appendChild(messageElement);
			DOM.chat.messages.scrollTop = DOM.chat.messages.scrollHeight;
		}

		static sendMessage() {
			if (!DOM.chat.input || !window.currentUser) return;

			const message = DOM.chat.input.value.trim();
			if (!message) return;

			const pmMatch = message.match(/^\/pm\s+(\S+)\s+(.+)$/);
			if (pmMatch) {
				const [, recipient, privateMessage] = pmMatch;
				window.wsManager.sendMessage({
					type: "private_message",
					message: privateMessage,
					username: window.currentUser.username,
					avatar: window.currentUser.avatar,
					recipient: recipient,
				});
			} else {
				window.wsManager.sendMessage({
					type: "chat_message",
					message: message,
					username: window.currentUser.username,
					avatar: window.currentUser.avatar,
				});
			}

			DOM.chat.input.value = "";
		}

		static positionMenuWithinViewport(menu, rect) {
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;
			const menuHeight = menu.offsetHeight;
			const menuWidth = menu.offsetWidth;

			let top;
			if (rect.bottom + menuHeight + 5 > viewportHeight) {
				top = Math.max(5, rect.top - menuHeight - 5);
			} else {
				top = rect.bottom + 5;
			}

			let left;
			if (rect.left + menuWidth + 5 > viewportWidth) {
				left = Math.max(5, viewportWidth - menuWidth - 5);
			} else {
				left = rect.left;
			}

			menu.style.top = `${top}px`;
			menu.style.left = `${left}px`;
		}

		static cleanup() {
			window.wsManager.removeMessageListener(ChatHandler.handleMessage);

			const activeMenu = document.querySelector(".chat-context-menu");
			if (activeMenu) {
				activeMenu.remove();
			}

			if (DOM.chat.sendButton) {
				DOM.chat.sendButton.removeEventListener(
					"click",
					ChatHandler.sendMessage
				);
			}

			if (DOM.chat.input) {
				DOM.chat.input.removeEventListener("keypress", (e) => {
					if (e.key === "Enter") {
						ChatHandler.sendMessage();
					}
				});
			}

			if (DOM.chat.messages) {
				DOM.chat.messages.innerHTML = "";
			}

			ChatHandler.blockedUsers.clear();
		}
	}

	// Tooltip Management
	class TooltipManager {
		static initializeTooltips() {
			// Avatar Tooltip
			if (DOM.sections.avatarSection) {
				const avatarTooltipTemplate = document.getElementById(
					"avatarTooltipTemplate"
				);
				if (avatarTooltipTemplate) {
					const avatarTooltip = avatarTooltipTemplate.content.cloneNode(true);
					DOM.sections.avatarSection.style.position = "relative";
					DOM.sections.avatarSection.appendChild(avatarTooltip);

					DOM.sections.avatarSection.addEventListener("mouseenter", () => {
						DOM.sections.avatarSection
							.querySelector(".avatar-tooltip")
							.classList.add("show");
					});
					DOM.sections.avatarSection.addEventListener("mouseleave", () => {
						DOM.sections.avatarSection
							.querySelector(".avatar-tooltip")
							.classList.remove("show");
					});
				}
			}

			// Rank Tooltip
			if (DOM.sections.rankSection) {
				const rankTooltipTemplate = document.getElementById(
					"rankTooltipTemplate"
				);
				if (rankTooltipTemplate) {
					const rankTooltip = rankTooltipTemplate.content.cloneNode(true);
					DOM.sections.rankSection.style.position = "relative";
					DOM.sections.rankSection.appendChild(rankTooltip);

					DOM.sections.rankSection.addEventListener("mouseenter", () => {
						DOM.sections.rankSection
							.querySelector(".rank-tooltip")
							.classList.add("show");
					});
					DOM.sections.rankSection.addEventListener("mouseleave", () => {
						DOM.sections.rankSection
							.querySelector(".rank-tooltip")
							.classList.remove("show");
					});
				}
			}
		}
	}

	// profil Modal Management
	class profilModal {
		static initialize() {
			if (!DOM.profil.modal) return;

			DOM.profil.closeBtn?.addEventListener("click", () =>
				profilModal.hide()
			);
			window.addEventListener("click", (event) => {
				if (event.target === DOM.profil.modal) profilModal.hide();
			});
			document.addEventListener("keydown", (event) => {
				if (
					event.key === "Escape" &&
					DOM.profil.modal.style.display === "block"
				) {
					profilModal.hide();
				}
			});
		}

		static show(playerData) {
			if (!DOM.profil.modal) return;

			DOM.profil.avatar.src = playerData.avatar;
			DOM.profil.nickname.textContent = playerData.nickname;
			DOM.profil.rankIcon.src = `/static/assets/icons/${playerData.rank.toLowerCase()}.png`;
			DOM.profil.rankText.textContent = playerData.rank;
			DOM.profil.totalGames.textContent = playerData.stats.totalGames;
			DOM.profil.winRate.textContent = playerData.stats.winRate;

			DOM.profil.modal.style.display = "block";
			document.body.style.overflow = "hidden";
		}

		static hide() {
			if (DOM.profil.modal) {
				DOM.profil.modal.style.display = "none";
				document.body.style.overflow = "auto";
			}
		}
	}

	// Context Menu Management
	class ContextMenu {
		static initialize() {
			const homePageMain = document.querySelector(".homePageMain");
			const downLeftFrame = document.querySelector(".downLeftFrame");
			if (!homePageMain || !downLeftFrame) return;

			const contextMenuTemplate = document.getElementById(
				"contextMenuTemplate"
			);
			if (!contextMenuTemplate) return;

			const contextMenu = contextMenuTemplate.content.cloneNode(true);
			downLeftFrame.appendChild(contextMenu);

			const contextMenuElement = downLeftFrame.querySelector(
				".player-context-menu"
			);
			if (!contextMenuElement) return;

			downLeftFrame.style.position = "relative";
			contextMenuElement.style.position = "absolute";
			contextMenuElement.style.zIndex = "100";

			downLeftFrame.addEventListener("click", (e) => {
				const nickname = e.target.closest(".onlineNickname");
				if (nickname) {
					e.preventDefault();
					const rect = nickname.getBoundingClientRect();
					const frameRect = downLeftFrame.getBoundingClientRect();

					const top = rect.bottom - frameRect.top;
					const left = rect.left - frameRect.left;

					contextMenuElement.style.top = `${top}px`;
					contextMenuElement.style.left = `${left}px`;
					contextMenuElement.style.display = "block";
					contextMenuElement.dataset.player = nickname.textContent.trim();
				} else if (!e.target.closest(".player-context-menu")) {
					contextMenuElement.style.display = "none";
				}
			});

			contextMenuElement.addEventListener("click", (e) => {
				const action = e.target.dataset.action;
				if (!action) return;

				const player = contextMenuElement.dataset.player;

				if (action === "profil") {
					const playerData = {
						nickname: player,
						rank: "Bronze",
						avatar: "/static/assets/avatars/clown-fish.png",
						stats: { totalGames: 0, winRate: "0%" },
					};
					profilModal.show(playerData);
				} else if (action === "add-friend") {
					ContextMenu.showConfirmation(player);
				}
				contextMenuElement.style.display = "none";
			});
			console.log("TEST3\n");
			document.addEventListener("click", (e) => {
				if (!downLeftFrame.contains(e.target)) {
					contextMenuElement.style.display = "none";
				}
			});
		}

		static showConfirmation(player) {
			const homePageMain = document.querySelector(".homePageMain");
			if (!homePageMain) return;

			const confirmation = document.createElement("div");
			confirmation.classList.add("confirmation-animation");
			confirmation.innerHTML = `
        <div class="confirmation-icon"></div>
        <div class="confirmation-text">Friend request sent to ${player}</div>
      `;

			homePageMain.appendChild(confirmation);
			setTimeout(() => confirmation.remove(), 2000);
		}
	}

	// Game Options Management
	class GameOptionsManager {
		static initialize() {
			const handleSelection = (elements, selectedElement) => {
				elements.forEach((el) => el.classList.remove("option-selected"));
				selectedElement.classList.add("option-selected");
			};

			DOM.game.options.forEach((option) => {
				if (option.textContent.trim() === "CLASSIC PONG") {
					option.classList.add("option-selected");
				}
				option.addEventListener("click", () =>
					handleSelection(DOM.game.options, option)
				);
			});

			DOM.game.modeOptions.forEach((option) => {
				if (option.textContent.trim() === "AGAINST AI") {
					option.classList.add("option-selected");
				}
				option.addEventListener("click", () =>
					handleSelection(DOM.game.modeOptions, option)
				);
			});
		}
	}

	// Online Game Modal Management
	class OnlineGameModal {
		static selectedPlayer = null;

		static initialize() {
			DOM.onlineGame.closeBtn?.addEventListener("click", OnlineGameModal.hide);
			document.addEventListener("click", (e) => {
				if (e.target === DOM.onlineGame.modal) OnlineGameModal.hide();
			});

			DOM.onlineGame.playersList?.addEventListener("click", (e) => {
				const playerElement = e.target.closest(".online-player");
				if (playerElement) {
					DOM.onlineGame.playersList
						.querySelectorAll(".online-player")
						.forEach((p) => p.classList.remove("selected"));
					playerElement.classList.add("selected");
					OnlineGameModal.selectedPlayer = playerElement.dataset.player;
					DOM.onlineGame.launchBtn.disabled = false;
				}
			});

			DOM.onlineGame.launchBtn?.addEventListener("click", () => {
				if (OnlineGameModal.selectedPlayer) OnlineGameModal.startGame();
			});
		}

		static show() {
			DOM.onlineGame.modal.style.display = "block";
			OnlineGameModal.generatePlayersList();
		}

		static hide() {
			DOM.onlineGame.modal.style.display = "none";
			DOM.onlineGame.launchBtn.disabled = true;
		}

		static generatePlayersList() {
			const players = [
				{
					name: "Player1",
					status: PLAYER_STATUSES.ONLINE,
					avatar: "/static/assets/avatars/buffalo.png",
				},
				{
					name: "Player2",
					status: PLAYER_STATUSES.IN_GAME,
					avatar: "/static/assets/avatars/clown-fish.png",
				},
				{
					name: "Player3",
					status: PLAYER_STATUSES.ONLINE,
					avatar: "/static/assets/avatars/buffalo.png",
				},
			];

			const template = players
				.map(
					(player) => `
        <div class="online-player" data-player="${player.name}">
          <img src="${player.avatar}" alt="avatar" class="player-avatar">
          <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-status">${player.status}</div>
          </div>
        </div>
      `
				)
				.join("");

			DOM.onlineGame.playersList.innerHTML = template;
		}

		static startGame() {
			console.log(`Starting game with ${OnlineGameModal.selectedPlayer}`);
			DOM.onlineGame.loading.style.display = "flex";
		}
	}

	// Manage Game Actions
	class GameActions {
		static handlePlayButtonClick() {
			const selectedGame = Array.from(DOM.game.options).find((option) =>
				option.classList.contains("option-selected")
			);
			const selectedMode = Array.from(DOM.game.modeOptions).find((option) =>
				option.classList.contains("option-selected")
			);

			if (!selectedGame || !selectedMode) {
				alert("Please select both a game type and a mode!");
				return;
			}

			const gameType = selectedGame.textContent.trim();
			const modeType = selectedMode.textContent.trim();

			console.log(`Selected Game: ${gameType}, Selected Mode: ${modeType}`);

			if (gameType === "CLASSIC PONG" && modeType === "AGAINST AI") {
				console.log("Launching Classic Pong against AI...");
				startMatch();
			} else if (gameType === "CLASSIC PONG" && modeType === "TOURNAMENT") {
				console.log("Redirecting to /tournament...");
				window.location.href = "/tournament";
			} else if (gameType === "POWER PONG" && modeType === "TOURNAMENT") {
				console.log("Redirecting to /tournament...");
				window.location.href = "/tournament";
			} else if (
				(gameType === "CLASSIC PONG" || gameType === "POWER PONG") &&
				modeType === "ONLINE"
			) {
				console.log(`Launching ${gameType} Online...`);
				OnlineGameModal.show();
			} else {
				console.log(`${gameType} ${modeType} mode is not implemented yet.`);
			}
		}
	}

	function startMatch() {
		if (!isGameInitialized) {
			console.log("startMatch() appelée.");
			isGameInitialized = true;

			const loadingIndicator = document.createElement("div");
			loadingIndicator.innerText = "Chargement du jeu...";
			loadingIndicator.style.cssText = `
        color: white;
        font-size: 20px;
        text-align: center;
        margin-top: 20px;
      `;
			document.body.appendChild(loadingIndicator);

			const modal = document.createElement("div");
			modal.id = "gameModal";
			modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `;

			const iframe = document.createElement("iframe");
			iframe.src = "/static/spa/game3D/three.html";
			iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;

			iframe.onload = () => {
				document.body.removeChild(loadingIndicator);
				console.log("Jeu chargé.");

				setTimeout(() => {
					iframe.contentWindow.focus();
					console.log("Focus défini sur l'iframe.");
				}, 100);
			};

			modal.appendChild(iframe);
			document.body.appendChild(modal);

			// Gestionnaire des messages envoyés par l'iframe
			window.addEventListener("message", (event) => {
				console.log("Message reçu par le parent :", event);

				if (event.data.type === "gameComplete") {
					console.log(`Le gagnant est : ${event.data.data.winner}`);
					closeGameModal(modal);
					updateProfilOnHome();
				} else {
					console.log("Message non reconnu :", event.data);
				}
			});
		} else {
			console.log("Le jeu est déjà initialisé.");
		}
	}

	function closeGameModal(modal) {
		if (modal && document.body.contains(modal)) {
			document.body.removeChild(modal);
			console.log("Modal fermé automatiquement après la fin du jeu.");
			isGameInitialized = false;
		}
	}

	// Initialize all components
	TooltipManager.initializeTooltips();
	profilModal.initialize();
	ContextMenu.initialize();
	GameOptionsManager.initialize();
	OnlineGameModal.initialize();
	ChatHandler.initialize();
	GameInvitationManager.initialize(); // Ajouter cette ligne
	wsManager.updateOnlinePlayersList([...wsManager.onlinePlayers]);

	window.addEventListener("unload", () => {
		ChatHandler.cleanup();
	});

	if (DOM.game.playButton) {
		DOM.game.playButton.addEventListener("click", () => {
			GameActions.handlePlayButtonClick();
		});
	}

	DOM.game.playButton.addEventListener("click", () => {
		GameActions.handlePlayButtonClick();
	});
}


// remote

// Gestionnaire d'invitations de jeu
// const GameInvitationManager = {
//   activeInvitations: new Map(),
//   modal: null,
//   template: null,

//   initialize() {
//     this.template = document.getElementById("gameInvitationTemplate");
//     if (!this.template) {
//         console.error("Game invitation template not found");
//         return;
//     }

//     window.wsManager.addMessageListener((data) => {
//         console.log("Received message in GameInvitationManager:", data); // Plus détaillé
//         console.log("Message type:", data.type); // Vérifie spécifiquement le type
//         if (data.type === "game_invitation") {
//             console.log("Found game invitation, template is:", this.template); // Vérifie le template
//             this.handleInvitation(data);
//         }
//     });
// },

//   handleInvitation(data) {
//     console.log("Creating invitation modal for:", data); // Pour debug
//     // Stocker l'invitation
//     this.activeInvitations.set(data.invitationId, data);


//     console.log("Starting handleInvitation with data:", data);
//     const modalElement = this.template.content.cloneNode(true);
//     console.log("Created modal element:", modalElement);
//     this.modal = modalElement.querySelector(".game-invitation-modal");
//     console.log("Found modal:", this.modal);

//     // Remplir les détails de l'invitation
//     const avatar = this.modal.querySelector(".inviter-avatar");
//     const name = this.modal.querySelector(".inviter-name");
//     const gameType = this.modal.querySelector(".game-type");

//     avatar.src = data.sender.avatar;
//     name.textContent = data.sender.username;
//     gameType.textContent = data.gameType;

//     // Configurer les boutons
//     const acceptBtn = this.modal.querySelector(".accept-btn");
//     const declineBtn = this.modal.querySelector(".decline-btn");
//     const closeBtn = this.modal.querySelector(".close-invitation");

//     acceptBtn.addEventListener("click", () =>
//       this.respondToInvitation(data.invitationId, "accept")
//     );
//     declineBtn.addEventListener("click", () =>
//       this.respondToInvitation(data.invitationId, "decline")
//     );
//     closeBtn.addEventListener("click", () =>
//       this.respondToInvitation(data.invitationId, "decline")
//     );

//     // Ajouter à la page et afficher
//     document.body.appendChild(this.modal);
//     console.log("Modal appended to body");
//     this.modal.style.display = "block";
//     console.log("Modal display set to block");
//     console.log("Modal should be displayed now"); // Pour debug
//   },

// Friend Request Functions
async function loadPendingFriendRequests() {
	try {
		const response = await fetch('/api/friends/pending/', {
			credentials: 'include'
		});
		const data = await response.json();
		displayPendingRequests(data.pending_requests);
	} catch (error) {
		console.error('Error loading friend requests:', error);
	}
}

function displayPendingRequests(requests) {
	const friendRequestsList = document.getElementById('friendRequestsList');
	if (!friendRequestsList) return;

	const requestsHTML = requests.map(request => `
        <div class="friendRequest">
            <img src="${request.sender.avatar}" alt="Avatar" class="requestAvatar">
            <div class="requestInfo">
                <div class="requestUsername">${request.sender.username}</div>
            </div>
            <div class="requestActions">
                <button class="acceptButton" onclick="handleFriendRequest(${request.request_id}, 'accept')">Accept</button>
                <button class="rejectButton" onclick="handleFriendRequest(${request.request_id}, 'reject')">Reject</button>
            </div>
        </div>
    `).join('');

	friendRequestsList.innerHTML = requestsHTML || '<div class="no-requests">No pending friend requests</div>';
}

async function handleFriendRequest(requestId, action) {
	try {
		const response = await fetch('/api/friends/handle-request/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				request_id: requestId,
				action: action
			})
		});

		if (response.ok) {
			loadPendingFriendRequests();
		}
	} catch (error) {
		console.error('Error handling friend request:', error);
	}
}

const GameInvitationManager = {
	activeInvitations: new Map(),
	modal: null,
	template: null,

	initialize() {
		console.log("Initializing GameInvitationManager");
		this.template = document.getElementById("gameInvitationTemplate");

		if (!this.template) {
			console.error("Game invitation template not found");
			return;
		}

		window.wsManager.addMessageListener((data) => {
			console.log("Message received in GameInvitationManager:", data);

			// Vérifier spécifiquement les messages de type game_invitation
			if (data.type === "game_invitation" && data.receiver === window.currentUser?.username) {
				console.log("Game invitation received for current user");
				this.handleInvitation(data);
			}
		});
	},

	handleInvitation(data) {
		this.activeInvitations.set(data.invitationId, data);

		const modalElement = this.template.content.cloneNode(true);
		this.modal = modalElement.querySelector(".game-invitation-modal");

		// Remplir les détails de l'invitation
		const avatar = this.modal.querySelector(".inviter-avatar");
		const name = this.modal.querySelector(".inviter-name");
		const gameType = this.modal.querySelector(".game-type");

		avatar.src = data.sender.avatar;
		name.textContent = data.sender.username;
		gameType.textContent = data.gameType;

		// Configurer les boutons
		const acceptBtn = this.modal.querySelector(".accept-btn");
		const declineBtn = this.modal.querySelector(".decline-btn");
		const closeBtn = this.modal.querySelector(".close-invitation");

		acceptBtn.addEventListener("click", () => this.respondToInvitation(data.invitationId, "accept"));
		declineBtn.addEventListener("click", () => this.respondToInvitation(data.invitationId, "decline"));
		closeBtn.addEventListener("click", () => this.respondToInvitation(data.invitationId, "decline"));

		document.body.appendChild(this.modal);
		this.modal.style.display = "block";
	},

	respondToInvitation(invitationId, response) {
		const invitation = this.activeInvitations.get(invitationId);
		if (!invitation) return;

		wsManager.sendMessage({
			type: "game_invitation_response",
			invitationId: invitationId,
			response: response,
			sender: invitation.sender,
			receiver: invitation.receiver,
		});

		// Nettoyer
		this.activeInvitations.delete(invitationId);
		this.closeModal();

		if (response === "accept") {
			// Démarrer le jeu (à implémenter)
			this.initializeGameSession(invitation);
		}
	},

	closeModal() {
		if (this.modal) {
			this.modal.remove();
			this.modal = null;
		}
	},

	handleInvitationResponse(data) {
		const invitation = this.activeInvitations.get(data.invitationId);
		if (!invitation) return;

		this.activeInvitations.delete(data.invitationId);

		if (data.response === "accept") {
			this.initializeGameSession(invitation);
		} else {
			// Afficher un message de refus
			this.showNotification(
				`${data.receiver} has declined your game invitation`
			);
		}
	},
	sendInvitation(username) {
		// Récupérer les paramètres de jeu actuels
		const gameType =
			document
				.querySelector(".gameOption.option-selected")
				?.textContent.trim() || "CLASSIC PONG";

		console.log("Sending invitation to:", username); // Pour debug

		const invitationId = crypto.randomUUID();
		const invitation = {
			type: "game_invitation",
			invitationId: invitationId,
			sender: {
				username: window.currentUser.username,
				avatar: window.currentUser.avatar,
			},
			receiver: username,
			gameType: gameType,
			timestamp: Date.now(),
		};

		console.log("Invitation object:", invitation); // Pour debug

		this.activeInvitations.set(invitationId, invitation);
		window.wsManager.sendMessage(invitation);

		this.showNotification(`Game invitation sent to ${username}`);
	},

	showNotification(message) {
		const notification = document.createElement("div");
		notification.classList.add("confirmation-animation");
		notification.innerHTML = `
          <div class="confirmation-icon"></div>
          <div class="confirmation-text">${message}</div>
      `;
		document.querySelector(".homePageMain").appendChild(notification);
		setTimeout(() => notification.remove(), 2000);
	},

	initializeGameSession(invitation) {
		// Cette fonction sera implémentée plus tard pour le jeu en remote
		console.log("Starting game session:", invitation);
		// Ici, nous ajouterons le code pour démarrer le jeu en mode multijoueur
	},
};

// // Initialiser le gestionnaire d'invitations
// document.addEventListener("DOMContentLoaded", () => {
//   GameInvitationManager.initialize();
// });
