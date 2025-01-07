function updateProfilOnHome() {
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

				if (win_ratio < 33) {
					document.getElementById("rankImage").src =
						"static/assets/icons/bronze.png";
					document.getElementById("rankText").innerText = "Bronze";
					document
						.getElementById("rankText")
						.setAttribute("data-translate", "newhome.bronze");
				} else if (win_ratio < 66 && win_ratio >= 33) {
					document.getElementById("rankImage").src =
						"static/assets/icons/silver.png";
					document.getElementById("rankText").innerText = "Silver";
					document
						.getElementById("rankText")
						.setAttribute("data-translate", "newhome.silver");
				} else if (
					(win_ratio < 80 && win_ratio >= 66) ||
					(win_ratio >= 66 && totalGames < 5)
				) {
					document.getElementById("rankImage").src =
						"static/assets/icons/gold.png";
					document.getElementById("rankText").innerText = "Gold";
					document
						.getElementById("rankText")
						.setAttribute("data-translate", "newhome.gold");
				} else if (win_ratio >= 80 && totalGames >= 5) {
					document.getElementById("rankImage").src =
						"static/assets/icons/platinium.png";
					document.getElementById("rankText").innerText = "Platine";
					document
						.getElementById("rankText")
						.setAttribute("data-translate", "newhome.platine");
				}

				language = getLanguageFromAPI();
				language.then((value) => {
					setPreferredLanguage(value);
				});

				const avatarUrl =
					data.avatar && data.avatar.trim()
						? data.avatar
						: "/static/assets/avatars/buffalo.png";
				document.getElementById("avatarProfilUser").src = avatarUrl;
			}
		})
		.catch((error) => {
		});
}

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

let currentUser = null;

function initializeHome() {
	const PLAYER_STATUSES = {
		ONLINE: "Online",
		IN_GAME: "In Game",
	};

	const DOM = {
		profile: {
			modal: document.getElementById("profileModal"),
			closeBtn: document.querySelector(".close-profile-modal"),
			avatar: document.getElementById("profileAvatar"),
			nickname: document.getElementById("profileNickname"),
			rankIcon: document.getElementById("profileRankIcon"),
			rankText: document.getElementById("profileRankText"),
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
		static blockedUsers = new Set();

		static async initialize() {
			try {
				const response = await fetch("/api/profil/", {
					credentials: "include",
				});

				if (response.ok) {
					window.currentUser = await response.json();

					await ChatHandler.initializeBlockedUsers();

					window.wsManager.isUserBlocked = (userId) =>
            ChatHandler.blockedUsers.has(String(userId));

					ChatHandler.setupEventListeners();
					ChatHandler.initializeContextMenu();
					window.wsManager.addMessageListener(ChatHandler.handleMessage);

					const messageHistory = window.wsManager.getMessageHistory();
					messageHistory.forEach((message) =>
						ChatHandler.handleMessage(message)
					);
				}
			} catch (error) {
			}
		}

		static async initializeBlockedUsers() {
			try {
				const response = await fetch("/api/blocked/list/", {
					credentials: "include",
				});

				if (response.ok) {
					const data = await response.json();
					ChatHandler.blockedUsers = new Set(
            data.blocked_users.map((user) => String(user.id))
          );
          ChatHandler.updateBlockedMessagesDisplay();
        }
      } catch (error) {

			}
		}

		static updateBlockedMessagesDisplay() {
			const chatMessages = document.getElementById("chatMessages");
			if (!chatMessages) return;

			const messages = chatMessages.querySelectorAll(".message");
			messages.forEach((message) => {
				const messageHeader = message.querySelector(".messageHeader");
				const userId = messageHeader?.dataset?.userId;

				if (ChatHandler.blockedUsers.has(userId)) {
					message.style.opacity = "0.5";
					const messageText = message.querySelector(".messageText");
					if (!messageText.dataset.originalText) {
						messageText.dataset.originalText = messageText.textContent;
						messageText.textContent = "Message bloqué";
					}
				}
			});
		}
		static async sendFriendRequest(messageElement) {
			const headerElement = messageElement.querySelector(".messageHeader");
			const userId = headerElement?.dataset?.userId;

			if (!userId) {
				showErrorPopup("idNotFound");
				return;
			}

			if (userId === String(window.currentUser?.id)) {
				showErrorPopup("notYourself");
				return;
			}

			try {
				const response = await fetch("/api/friends/send-request/", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({
						receiver_id: userId.trim(),
					}),
				});

				const data = await response.text();

				try {
					const jsonData = JSON.parse(data);
					document.dispatchEvent(new Event("friendRequestSent"));
          showInfoPopup(jsonData.message || "friendRequestsSuccess");
        } catch (e) {
          showErrorPopup("errorServ");
        }
      } catch (error) {
        showErrorPopup("errorFriendRequest");
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
			const notification = document.createElement("div");
			notification.classList.add("notification");
			notification.textContent = message;
			document.body.appendChild(notification);
			setTimeout(() => notification.remove(), 3000);
		}

		static isUserBlocked(userId) {
			return ChatHandler.blockedUsers.has(userId);
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
				const isBlocked = ChatHandler.blockedUsers.has(userId);
				const isOwnMessage = userId === String(window.currentUser.id);

				if (username === "System" || userId === "system") {
          return;
        }

				const menu = document.createElement("div");
				menu.className = "chat-context-menu";

				let menuOptions = "";

				menuOptions += `
					<div class="chat-menu-option" data-action="profile" data-translate="newhome.menuProfile">
						See profile
					</div>
				`;

				if (!isOwnMessage) {
          if (isBlocked) {
            menuOptions += `
							<div class="chat-menu-option" data-action="block" data-translate="newhome.unblockUser">
								Unblock user
							</div>
						`;
					} else {
						menuOptions += `
							<div class="chat-menu-option" data-action="add-friend" data-translate="newhome.addFriend">
								Add friend
							</div>
							<div class="chat-menu-option" data-action="send-invitation" data-translate="newhome.sendInvitation">
								Send online invitation
							</div>
							<div class="chat-menu-option" data-action="block" data-translate="newhome.blockUser">
								Block user
							</div>
							<div class="chat-menu-option" data-action="private-message" data-translate="newhome.privateMessage">
								Private message
							</div>
						`;
					}
				}

				menu.innerHTML = menuOptions;
				document.body.appendChild(menu);
				const rect = avatar.getBoundingClientRect();
				ChatHandler.positionMenuWithinViewport(menu, rect);

				activeMenu = menu;

        // Le reste du code reste inchangé...

				menu.addEventListener("click", async (e) => {
          const option = e.target.closest(".chat-menu-option");
          if (!option) return;

					const action = option.dataset.action;
					if (action === "send-invitation") {
						GameInvitationManager.sendInvitation(username, userId);
					} else if (action === "profile") {
						ProfileModal.show(userId);
					} else if (action === "add-friend") {
						await ChatHandler.sendFriendRequest(messageElement);
					} else if (action === "block") {
						ChatHandler.toggleBlockUser(userId, username);
						ChatHandler.showBlockConfirmation(username, !isBlocked);
					} else if (action === "private-message") {
						ChatHandler.startPrivateMessage(username);
					}

					menu.remove();
					activeMenu = null;
				});

				let language = getLanguageFromAPI();
				language.then((value) => {
					setPreferredLanguage(value);
				});
			});

			document.addEventListener("click", (e) => {
        if (
          activeMenu &&
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

			let language = getLanguageFromAPI();
			language.then((value) => {
				setPreferredLanguage(value);
			});
		}

		static async toggleBlockUser(userId, username) {
			try {
				const isBlocked = ChatHandler.blockedUsers.has(userId);
				const endpoint = isBlocked
					? "/api/blocked/unblock/"
					: "/api/blocked/block/";

				const response = await fetch(endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({ user_id: userId }),
				});

				if (response.ok) {
					await ChatHandler.initializeBlockedUsers();
					ChatHandler.showBlockConfirmation(username, !isBlocked);
					document.dispatchEvent(new Event("blockedUsersChanged"));

					if (window.wsManager) {
            await window.wsManager.updateOnlinePlayersList([
              ...window.wsManager.onlinePlayers,
            ]);
          }
        }
      } catch (error) {

				showErrorPopup("errorBlock");
			}
		}

		static showBlockConfirmation(username, isBlocking) {
			const homePageMain = document.querySelector(".homePageMain");
			if (!homePageMain) return;

			const confirmation = document.createElement("div");
			confirmation.classList.add("confirmation-animation");
			confirmation.innerHTML = `
          <div class="confirmation-icon"></div>
          <div class="confirmation-text">
              ${isBlocking
					? `User ${username} has been blocked`
					: `User ${username} has been unblocked`
				}
          </div>
      `;

			homePageMain.appendChild(confirmation);
			setTimeout(() => confirmation.remove(), 2000);
		}

		static startPrivateMessage(username) {
			if (!DOM.chat.input || username === "System") return;

			DOM.chat.input.value = `/pm ${username} `;
			DOM.chat.input.focus();
		}

		static handleMessage(data) {
			if (!DOM.chat.messages) return;

			const isBlocked = ChatHandler.blockedUsers.has(String(data.userId));
      if (isBlocked) {
        data.originalMessage = data.message;
        data.message = "Message bloqué";
      }

			const isCurrentUser =
				window.currentUser && data.username === window.currentUser.username;
			const messageElement = document.createElement("div");

			let messageClasses = [`message`, isCurrentUser ? "sent" : "received"];
			if (data.type === "private_message") {
				messageClasses.push("private-message");
			}

			messageElement.className = messageClasses.join(" ");
			if (isBlocked) {
				messageElement.style.opacity = "0.5";
			}

			const messageHeader = data.username;

			messageElement.innerHTML = `
			<img src="${data.avatar}"
				alt="${data.username}"
				class="messageAvatar"
				title="Click for options">
			<div class="messageContent">
				<div class="messageHeader" 
					 data-user-id="${data.userId}"
					 data-username="${data.username}">
					${messageHeader}
				</div>
				<div class="messageText" ${isBlocked ? 'data-original-text="' + data.originalMessage + '"' : ""
				}>
					${data.message}
				</div>
			</div>
		`;

			DOM.chat.messages.appendChild(messageElement);
			DOM.chat.messages.scrollTop = DOM.chat.messages.scrollHeight;
		}

		static sendMessage() {
			if (!DOM.chat.input || !window.currentUser) return;

			const message = DOM.chat.input.value.trim();
			if (!message) return;

			function sanitizeInput(input) {
				const element = document.createElement("div");
				element.innerText = input;
				return element.innerHTML;
			}

			const pmMatch = message.match(/^\/pm\s+(\S+)\s+(.+)$/);
			if (pmMatch) {
				if (pmMatch[1].toLowerCase() === "system") {
					showErrorPopup("errorNotSys");
					return;
				}

				const [, recipient, privateMessage] = pmMatch;

				window.wsManager.chatSocket.send(
					JSON.stringify({
						type: "private_message",
						message: sanitizeInput(privateMessage),
						username: window.currentUser.username,
						userId: window.currentUser.id,
						avatar: window.currentUser.avatar,
						recipient: recipient,
					})
				);
			} else {
				window.wsManager.chatSocket.send(
					JSON.stringify({
						type: "chat_message",
						message: sanitizeInput(message),
						username: window.currentUser.username,
						userId: window.currentUser.id,
						avatar: window.currentUser.avatar,
					})
				);
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

			ChatHandler.blockedUsers = [];
		}
	}

	class TooltipManager {
		static initializeTooltips() {
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

	class ProfileModal {
		static initialize() {
			if (!DOM.profile.modal) return;

			DOM.profile.closeBtn?.addEventListener("click", () =>
				ProfileModal.hide()
			);
			window.addEventListener("click", (event) => {
				if (event.target === DOM.profile.modal) ProfileModal.hide();
			});
			document.addEventListener("keydown", (event) => {
				if (
					event.key === "Escape" &&
					DOM.profile.modal.style.display === "block"
				) {
					ProfileModal.hide();
				}
			});
		}

		static async show(userId) {
			if (!DOM.profile.modal) return;

			try {
				const response = await fetch(`/api/user/profile-stats/${userId}/`, {
					credentials: "include",
				});

				if (!response.ok) {
					throw new Error("Failed to fetch user profile");
				}

				const playerData = await response.json();

				DOM.profile.avatar.src = playerData.avatar;
        DOM.profile.nickname.textContent = playerData.nickname;
        DOM.profile.rankIcon.src = `/static/assets/icons/${playerData.rank.toLowerCase()}.png`;
        DOM.profile.rankText.textContent = playerData.rank;
        document
          .getElementById("profileRankText")
          .setAttribute(
            "data-translate",
            `newhome.${playerData.rank.toLowerCase()}`
          );
				document.getElementById("totalGames").textContent =
					playerData.stats.totalGames;
				document.getElementById("winRate").textContent =
					playerData.stats.winRate;
				document.getElementById("longestRally").textContent =
					playerData.stats.longestRally;
				document.getElementById("maxBallSpeed").textContent =
					playerData.stats.maxBallSpeed;

				const recentGamesList = document.getElementById("recentGamesList");
        if (playerData.matchHistory.length === 0) {
          recentGamesList.innerHTML =
            '<div class="no-games" data-translate="profil.noRecentGames">No recent games</div>';
        } else {
          recentGamesList.innerHTML = playerData.matchHistory
            .map(
              (match) => `
                <div class="match-resume">
                    <div class="game-date">${match.game_date}</div>
                    <img src="${match.user_avatar
								}" alt="User" class="avatar-history">
                    <div class="score-player">${match.score_user}</div>
                    <div class="separator-match">-</div>
                    <div class="score-player">${match.score_opponent}</div>
                    <img src="${match.opponent_avatar
								}" alt="Opponent" class="avatar-history">
                    <div class="result-label" 
                        style="color: ${match.result === "VICTORY" ? "#ff710d" : "#878787"
								}"
                        data-translate="profil.${match.result === "VICTORY" ? "victory" : "defeat"
								}">
                        ${match.result}
                    </div>
                </div>
            `
						)
						.join("");
				}

				DOM.profile.modal.style.display = "block";
				document.body.style.overflow = "hidden";
				let language = getLanguageFromAPI();
				language.then((value) => {
					setPreferredLanguage(value);
				});
			} catch (error) {
			}
		}

		static hide() {
			if (DOM.profile.modal) {
				DOM.profile.modal.style.display = "none";
				document.body.style.overflow = "auto";
			}
		}
	}

	class ContextMenu {
		static initialize() {
			document.body.addEventListener("click", async (e) => {
				const nickname = e.target.closest(".onlineNickname");
				if (!nickname) return;

				e.preventDefault();
				e.stopPropagation();

				const existingMenu = document.querySelector(".chat-context-menu");
				if (existingMenu) {
					existingMenu.remove();
				}

				const rect = nickname.getBoundingClientRect();
				const username = nickname.textContent.trim();
				const userId = nickname.dataset.userId;
				const isOwnUser = username === window.currentUser.username;
				const isBlocked = ChatHandler.isUserBlocked(userId);

				const menu = document.createElement("div");
				menu.className = "chat-context-menu";

				let menuOptions = "";

				menuOptions += `
          <div class="chat-menu-option" data-action="profile" data-translate="newhome.menuProfile">
            See profile
          </div>
        `;

				if (!isOwnUser) {
          if (isBlocked) {
						menuOptions += `
              <div class="chat-menu-option" data-action="block" data-translate="newhome.unblockUser">
                Unblock user
              </div>
            `;
					} else {
						menuOptions += `
              <div class="chat-menu-option" data-action="add-friend" data-translate="newhome.addFriend">
                Add friend
              </div>
              <div class="chat-menu-option" data-action="send-invitation" data-translate="newhome.sendInvitation">
                Send online invitation
              </div>
              <div class="chat-menu-option" data-action="block" data-translate="newhome.blockUser">
                Block user
              </div>
              <div class="chat-menu-option" data-action="private-message" data-translate="newhome.privateMessage">
                Private message
              </div>
            `;
					}
				}

        menu.innerHTML = menuOptions;
        document.body.appendChild(menu);
        ChatHandler.positionMenuWithinViewport(menu, rect);

				menu.addEventListener("click", async (e) => {
					const option = e.target.closest(".chat-menu-option");
					if (!option) return;

					const action = option.dataset.action;
					switch (action) {
						case "profile":
							ProfileModal.show(userId);
							break;
						case "add-friend":
							await ChatHandler.sendFriendRequest({
								querySelector: () => ({
									dataset: { userId },
								}),
							});
							break;
						case "send-invitation":
							GameInvitationManager.sendInvitation(username, userId);
							break;
						case "block":
							await ChatHandler.toggleBlockUser(userId, username);
							break;
						case "private-message":
							ChatHandler.startPrivateMessage(username);
							break;
					}

					menu.remove();
				});

				document.addEventListener("click", function closeMenu(e) {
					if (!menu.contains(e.target) && !nickname.contains(e.target)) {
						menu.remove();
						document.removeEventListener("click", closeMenu);
					}
				});
				let language = getLanguageFromAPI();
				language.then((value) => {
					setPreferredLanguage(value);
				});
			});
		}
	}



	class GameOptionsManager {
		static initialize() {
			const handleSelection = (elements, selectedElement) => {
				elements.forEach((el) => el.classList.remove("option-selected"));
				selectedElement.classList.add("option-selected");
			};

			// Sélectionner et activer le bouton de jeu par défaut
			DOM.game.options.forEach((option) => {
				if (option.getAttribute("data-game-type") === "classicPong") {
					option.classList.add("option-selected");
				}
				option.addEventListener("click", () =>
					handleSelection(DOM.game.options, option)
				);
			});

			// Sélectionner et activer le mode de jeu par défaut
			DOM.game.modeOptions.forEach((option) => {
				if (option.getAttribute("data-mode-type") === "1vs1") {
					option.classList.add("option-selected");
				}
				option.addEventListener("click", () =>
					handleSelection(DOM.game.modeOptions, option)
				);
			});
		}
	}

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
			if (!window.wsManager?.onlinePlayers) {
				return;
			}

			const template = Array.from(window.wsManager.onlinePlayers)
				.map(
					(player) => `
					<div class="online-player" data-player="${player.username}">
						<img src="${player.avatar || "/static/assets/avatars/buffalo.png"
						}" alt="avatar" class="player-avatar">
						<div class="player-info">
							<div class="player-name">
								<div class="onlineNickname" data-username="${player.username}" data-user-id="${player.id
						}">
									${player.username}
								</div>
							</div>
							<div class="player-status">${player.status === "in_game"
							? PLAYER_STATUSES.IN_GAME
							: PLAYER_STATUSES.ONLINE
						}</div>
						</div>
					</div>
				`
				)
				.join("");

			DOM.onlineGame.playersList.innerHTML = template;
		}

		static startGame() {
			DOM.onlineGame.loading.style.display = "flex";
		}
	}

	class GameActions {
		constructor() {
			this.options = null;
			this.getHostOptions();
		}

    getHostOptions() {
      fetch("api/game-settings/", {
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
          this.options = data;
        })
        .catch((error) => {

				});
		}

		handlePlayButtonClick() {
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

			const gameType = selectedGame.getAttribute("data-game-type");
			const modeType = selectedMode.getAttribute("data-mode-type");

			if (gameType === "classicPong" && modeType === "againstAI") {
				startMatch(this.options, true, false);
			} else if (gameType === "powerPong" && modeType === "againstAI") {
				startMatch(this.options, true, true);
			} else if (gameType === "classicPong" && modeType === "1vs1") {
				startMatch(this.options, false, false);
			} else if (gameType === "powerPong" && modeType === "1vs1") {
				startMatch(this.options, false, true);
			} else if (modeType === "tournament") {
				window.location.href = "/tournament";
			} else {
			}
		}
	}

	async function startMatch(options, isAI, power) {
		let languageOption = "en";

		const language = await getLanguageFromAPI();
    setPreferredLanguage(language);
    languageOption = language;
    if (!isGameInitialized) {
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

				iframe.contentWindow.postMessage(
					{
						type: "setOptions",
						data: { options, isAI, power, languageOption },
					},
					"*"
				);
				setTimeout(() => {
					iframe.contentWindow.focus();
				}, 100);
			};

			modal.appendChild(iframe);
			document.body.appendChild(modal);

			window.addEventListener("message", (event) => {
				if (event.data.type === "gameComplete") {
					closeGameModal(modal);
					updateProfilOnHome();
				} else {
				}
			});
		} else {
		}
	}

	function closeGameModal(modal) {
		if (modal && document.body.contains(modal)) {
			document.body.removeChild(modal);
			isGameInitialized = false;
		}
	}

	TooltipManager.initializeTooltips();
	ChatHandler.initialize();
  wsManager.updateOnlinePlayersList([...wsManager.onlinePlayers]);
  ProfileModal.initialize();
  ContextMenu.initialize();
  GameOptionsManager.initialize();
  OnlineGameModal.initialize();
  GameInvitationManager.initialize();

	document.addEventListener(
		"friendRequestAccepted",
		updateOnlinePlayersAfterFriendAction
	);
	document.addEventListener(
		"friendRequestSent",
		updateOnlinePlayersAfterFriendAction
	);

	window.addEventListener("unload", () => {
		ChatHandler.cleanup();
	});

	const gameActions = new GameActions();
	if (DOM.game.playButton) {
		DOM.game.playButton.addEventListener("click", () => {
			gameActions.handlePlayButtonClick();
		});
	}
}

async function loadPendingFriendRequests() {
	try {
		const response = await fetch("/api/friends/pending/", {
			credentials: "include",
		});
		const data = await response.json();
		displayPendingRequests(data.pending_requests);
	} catch (error) {
	}
}

function displayPendingRequests(requests) {
	const friendRequestsList = document.getElementById("friendRequestsList");
	if (!friendRequestsList) return;

	const requestsHTML = requests
		.map(
			(request) => `
        <div class="friendRequest">
            <img src="${request.sender.avatar}" alt="Avatar" class="requestAvatar">
            <div class="requestInfo">
                <div class="requestUsername">${request.sender.username}</div>
            </div>
            <div class="requestActions">
                <button class="acceptButton" onclick="handleFriendRequest(${request.request_id}, 'accept')" data-translate="profil.friendAccept">Accept</button>
                <button class="rejectButton" onclick="handleFriendRequest(${request.request_id}, 'reject')" data-translate="profil.friendReject">Reject</button>
            </div>
        </div>
    `
		)
		.join("");

	friendRequestsList.innerHTML =
		requestsHTML ||
		'<div class="no-requests" data-translate="profil.noFriendRequest">No pending friend requests</div>';

	let language = getLanguageFromAPI();
	language.then((value) => {
		setPreferredLanguage(value);
	});
}

async function handleFriendRequest(requestId, action) {
	try {
		const response = await fetch("/api/friends/handle-request/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ request_id: requestId, action }),
		});

		if (response.ok) {
			loadFriendRequests();
			if (window.wsManager && window.wsManager.onlinePlayers) {
				window.wsManager.updateOnlinePlayersList([
					...window.wsManager.onlinePlayers,
				]);
			}

			const message = action === "accept" ? "friendAccept" : "friendReject";
      showInfoPopup(message);
    }
  } catch (error) {
  }
}

async function updateOnlinePlayersAfterFriendAction() {
	if (window.wsManager && window.wsManager.onlinePlayers) {
		await window.wsManager.updateOnlinePlayersList([
			...window.wsManager.onlinePlayers,
		]);
	}
}

const GameInvitationManager = {
	activeInvitations: new Map(),
	modal: null,
	template: null,

	initialize() {
		this.template = document.getElementById("gameInvitationTemplate");

		if (!this.template) {
			return;
		}

		this.activeInvitations.clear();

		window.wsManager.addMessageListener((data) => {
			if (
				data.type === "game_invitation" &&
				data.receiverId === window.currentUser?.id
			) {
				this.handleInvitation(data);
			}
		});
	},

	sendInvitation(username, userId) {
		if (username === window.currentUser?.username) {
      showErrorPopup(inviteSelf);
			return;
		}

		const selectedGame = document.querySelector(".gameOption.option-selected");
    if (!selectedGame) {
      showErrorPopup(selectGame);
			return;
		}
		const gameType = selectedGame.textContent.trim();

		const invitationId = crypto.randomUUID();
		const invitation = {
			type: "game_invitation",
			invitationId: invitationId,
			sender: {
				username: window.currentUser.username,
				avatar: window.currentUser.avatar,
				id: window.currentUser.id,
			},
			receiver: username,
			receiverId: userId,
			gameType: gameType,
			timestamp: Date.now(),
		};

		if (
      !window.wsManager?.chatSocket ||
      window.wsManager.chatSocket.readyState !== WebSocket.OPEN
    ) {
      showErrorPopup(coInvite);
			return;
		}

		this.activeInvitations.set(invitationId, invitation);
		window.wsManager.chatSocket.send(JSON.stringify(invitation));

		// Notification de confirmation d'envoi
		showInfoPopup("inviteSent");

		setTimeout(() => {
      if (this.activeInvitations.has(invitationId)) {
        this.activeInvitations.delete(invitationId);
      }
    }, 20000);
  },

	showNotification(message) {
		const notification = document.createElement("div");
    notification.classList.add("custom-notification");
    notification.textContent = message;

		document.body.appendChild(notification);

		setTimeout(() => notification.remove(), 3000);
  },

	handleInvitation(data) {
		if (this.activeInvitations.has(data.invitationId)) {
      return;
    }

		this.activeInvitations.set(data.invitationId, data);

		const existingModal = document.querySelector(".game-invitation-modal");
    if (existingModal) {
      existingModal.remove();
    }

		const modalElement = this.template.content.cloneNode(true);
    const invitationModal = modalElement.querySelector(
      ".game-invitation-modal"
    );

		if (!invitationModal) {
			return;
		}

		invitationModal.querySelector(".inviter-avatar").src =
      data.sender.avatar || "/static/assets/avatars/default.png";
    invitationModal.querySelector(".inviter-name").textContent =
      data.sender.username;
    invitationModal.querySelector(".game-type").textContent = data.gameType;

		const cleanup = () => {
      this.activeInvitations.delete(data.invitationId);
      invitationModal.remove();
    };

		invitationModal
			.querySelector(".accept-btn")
			.addEventListener("click", () => {
				this.respondToInvitation(data, "accept");
				cleanup();
			});

		invitationModal
			.querySelector(".decline-btn")
			.addEventListener("click", () => {
				this.respondToInvitation(data, "decline");
				cleanup();
			});

		invitationModal
			.querySelector(".close-invitation")
			.addEventListener("click", cleanup);

		document.body.appendChild(invitationModal);
    invitationModal.style.display = "block";

		let language = getLanguageFromAPI();
		language.then((value) => {
			setPreferredLanguage(value);
		});

		// Auto-cleanup après 30 secondes
		setTimeout(cleanup, 30000);
	},

	respondToInvitation(invitation, response) {
		const payload = {
			type: "game_invitation_response",
			invitationId: invitation.invitationId,
			response: response,
			sender: invitation.sender,
			receiver: window.currentUser.username,
			receiverId: window.currentUser.id,
		};

		if (window.wsManager?.chatSocket?.readyState === WebSocket.OPEN) {
			window.wsManager.chatSocket.send(JSON.stringify(payload));

			if (response === "accept") {
        showErrorPopup("notImplemented");
			}
		} else {
		}
	},
};

window.GameInvitationManager = GameInvitationManager;
