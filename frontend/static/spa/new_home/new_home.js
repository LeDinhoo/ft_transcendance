// function initializeHome() {

//   console.log("fonction initalize home appele..")

// // Constants and DOM Elements
// const PLAYER_STATUSES = {
//     ONLINE: 'Online',
//     IN_GAME: 'In Game'
//   };

//   const DOM = {
//     profile: {
//       modal: document.getElementById('profileModal'),
//       closeBtn: document.querySelector('.close-profile-modal'),
//       avatar: document.getElementById('profileAvatar'),
//       nickname: document.getElementById('profileNickname'),
//       rankIcon: document.getElementById('profileRankIcon'),
//       rankText: document.getElementById('profileRankText'),
//       totalGames: document.getElementById('totalGames'),
//       winRate: document.getElementById('winRate')
//     },
//     game: {
//       options: document.querySelectorAll('.gameOption'),
//       modeOptions: document.querySelectorAll('.modeOption'),
//       playButton: document.querySelector('.playHomePage'),
//       onlineOption: Array.from(document.querySelectorAll('.modeOption'))
//         .find(option => option.textContent.trim() === 'ONLINE')
//     },
//     sections: {
//       avatarSection: document.querySelector('.avatarSection'),
//       rankSection: document.querySelector('.rankSection')
//     },
//     onlineGame: {
//       modal: document.querySelector('.online-game-modal'),
//       closeBtn: document.querySelector('.close-online-game'),
//       launchBtn: document.querySelector('.launch-game'),
//       content: document.querySelector('.online-game-sections'),
//       loading: document.querySelector('.game-loading'),
//       friendsList: document.getElementById('friendsList'),
//       playersList: document.getElementById('onlinePlayersList')
//     }
//   };

//   // Tooltip Management
//   class TooltipManager {
//     static initializeTooltips() {
//       // Avatar Tooltip
//       if (DOM.sections.avatarSection) {
//         const avatarTooltipTemplate = document.getElementById('avatarTooltipTemplate');
//         const avatarTooltip = avatarTooltipTemplate.content.cloneNode(true);
//         DOM.sections.avatarSection.style.position = 'relative';
//         DOM.sections.avatarSection.appendChild(avatarTooltip);

//         DOM.sections.avatarSection.addEventListener('mouseenter', () =>
//           DOM.sections.avatarSection.querySelector('.avatar-tooltip').classList.add('show')
//         );
//         DOM.sections.avatarSection.addEventListener('mouseleave', () =>
//           DOM.sections.avatarSection.querySelector('.avatar-tooltip').classList.remove('show')
//         );
//       }

//       // Rank Tooltip
//       if (DOM.sections.rankSection) {
//         const rankTooltipTemplate = document.getElementById('rankTooltipTemplate');
//         const rankTooltip = rankTooltipTemplate.content.cloneNode(true);
//         DOM.sections.rankSection.style.position = 'relative';
//         DOM.sections.rankSection.appendChild(rankTooltip);

//         DOM.sections.rankSection.addEventListener('mouseenter', () =>
//           DOM.sections.rankSection.querySelector('.rank-tooltip').classList.add('show')
//         );
//         DOM.sections.rankSection.addEventListener('mouseleave', () =>
//           DOM.sections.rankSection.querySelector('.rank-tooltip').classList.remove('show')
//         );
//       }
//     }
//   }

//   // Profile Modal Management
//   class ProfileModal {
//     static initialize() {
//       if (!DOM.profile.modal) return;

//       DOM.profile.closeBtn.onclick = () => ProfileModal.hide();
//       window.onclick = (event) => {
//         if (event.target === DOM.profile.modal) ProfileModal.hide();
//       };
//       document.addEventListener('keydown', (event) => {
//         if (event.key === 'Escape' && DOM.profile.modal.style.display === 'block') {
//           ProfileModal.hide();
//         }
//       });
//     }

//     static show(playerData) {
//       DOM.profile.avatar.src = playerData.avatar;
//       DOM.profile.nickname.textContent = playerData.nickname;
//       DOM.profile.rankIcon.src = `/static/assets/icons/${playerData.rank.toLowerCase()}.png`;
//       DOM.profile.rankText.textContent = playerData.rank;
//       DOM.profile.totalGames.textContent = playerData.stats.totalGames;
//       DOM.profile.winRate.textContent = playerData.stats.winRate;

//       DOM.profile.modal.style.display = 'block';
//       document.body.style.overflow = 'hidden';
//     }

//     static hide() {
//       DOM.profile.modal.style.display = 'none';
//       document.body.style.overflow = 'auto';
//     }
//   }

//   // Context Menu Management
//   class ContextMenu {
//     static initialize() {
//       const contextMenuTemplate = document.getElementById('contextMenuTemplate');
//       const contextMenu = contextMenuTemplate.content.cloneNode(true);
//       document.body.appendChild(contextMenu);

//       const contextMenuElement = document.querySelector('.player-context-menu');

//       document.querySelectorAll('.onlineNickname').forEach(nickname => {
//         nickname.addEventListener('click', (e) => {
//           e.preventDefault();
//           const rect = nickname.getBoundingClientRect();
//           contextMenuElement.style.top = `${rect.bottom + window.scrollY}px`;
//           contextMenuElement.style.left = `${rect.left + window.scrollX}px`;
//           contextMenuElement.style.display = 'block';
//           contextMenuElement.dataset.player = nickname.textContent.trim();
//         });
//       });

//       contextMenuElement.addEventListener('click', (e) => {
//         const action = e.target.dataset.action;
//         const player = contextMenuElement.dataset.player;

//         if (action === 'profile') {
//           const playerData = {
//             nickname: player,
//             rank: 'Bronze',
//             avatar: '/static/assets/avatars/clown-fish.png',
//             stats: {
//               totalGames: 0,
//               wins: 0,
//               losses: 0,
//               winRate: '0%',
//               lastGames: []
//             }
//           };
//           ProfileModal.show(playerData);
//         } else if (action === 'add-friend') {
//           ContextMenu.showConfirmation(player);
//         }
//         contextMenuElement.style.display = 'none';
//       });

//       document.addEventListener('click', (e) => {
//         if (!e.target.closest('.onlineNickname') && !e.target.closest('.player-context-menu')) {
//           contextMenuElement.style.display = 'none';
//         }
//       });
//     }

//     static showConfirmation(player) {
//       const confirmation = document.createElement('div');
//       confirmation.classList.add('confirmation-animation');
//       confirmation.innerHTML = `
//         <div class="confirmation-icon"></div>
//         <div class="confirmation-text">Friend request sent to ${player}</div>
//       `;
//       document.body.appendChild(confirmation);

//       setTimeout(() => {
//         confirmation.remove();
//       }, 2000);
//     }
//   }

//   // Game Options Management
//   class GameOptionsManager {
//     static initialize() {
//       // Set initial selections
//       const classicPongOption = Array.from(DOM.game.options)
//         .find(option => option.textContent.trim() === 'CLASSIC PONG');
//       if (classicPongOption) {
//         classicPongOption.classList.add('option-selected');
//       }

//       const oneVsOneOption = Array.from(DOM.game.modeOptions)
//         .find(option => option.textContent.trim() === '1 VS 1');
//       if (oneVsOneOption) {
//         oneVsOneOption.classList.add('option-selected');
//       }

//       // Add click handlers
//       const handleSelection = (elements, selectedElement) => {
//         elements.forEach(el => el.classList.remove('option-selected'));
//         selectedElement.classList.add('option-selected');
//       };

//       DOM.game.options.forEach(option => {
//         option.addEventListener('click', () => handleSelection(DOM.game.options, option));
//       });

//       DOM.game.modeOptions.forEach(option => {
//         option.addEventListener('click', () => handleSelection(DOM.game.modeOptions, option));
//       });
//     }
//   }

//   // Online Game Modal Management
//   class OnlineGameModal {
//     static selectedPlayer = null;

//     static initialize() {
//       DOM.game.playButton.addEventListener('click', () => {
//         const isOnlineMode = DOM.game.onlineOption.classList.contains('option-selected');
//         if (isOnlineMode) {
//           OnlineGameModal.show();
//         }
//       });

//       DOM.onlineGame.closeBtn.addEventListener('click', () => OnlineGameModal.hide());

//       document.addEventListener('click', (e) => {
//         if (e.target === DOM.onlineGame.modal) {
//           OnlineGameModal.hide();
//         }
//       });

//       DOM.onlineGame.modal.addEventListener('click', (e) => {
//         const playerElement = e.target.closest('.online-player');
//         if (playerElement) {
//           const allPlayers = DOM.onlineGame.modal.querySelectorAll('.online-player');
//           allPlayers.forEach(p => p.classList.remove('selected'));
//           playerElement.classList.add('selected');
//           OnlineGameModal.selectedPlayer = playerElement.dataset.player;
//           DOM.onlineGame.launchBtn.disabled = false;
//         }
//       });

//       DOM.onlineGame.launchBtn.addEventListener('click', () => {
//         if (OnlineGameModal.selectedPlayer) {
//           OnlineGameModal.startGame();
//         }
//       });
//     }

//     static show() {
//       DOM.onlineGame.modal.style.display = 'block';
//       OnlineGameModal.generatePlayersList();
//     }

//     static hide() {
//       DOM.onlineGame.modal.style.display = 'none';
//       OnlineGameModal.selectedPlayer = null;
//       DOM.onlineGame.launchBtn.disabled = true;
//       DOM.onlineGame.content.style.display = 'grid';
//       DOM.onlineGame.loading.style.display = 'none';
//     }

//     static generatePlayersList() {
//       const players = [
//         { name: 'Player1', status: PLAYER_STATUSES.ONLINE, avatar: '/static/assets/avatars/buffalo.png' },
//         { name: 'Player2', status: PLAYER_STATUSES.IN_GAME, avatar: '/static/assets/avatars/clown-fish.png' },
//         { name: 'Player3', status: PLAYER_STATUSES.ONLINE, avatar: '/static/assets/avatars/buffalo.png' }
//       ];

//       const template = players.map(player => `
//         <div class="online-player" data-player="${player.name}">
//           <img src="${player.avatar}" alt="avatar" class="player-avatar">
//           <div class="player-info">
//             <div class="player-name">${player.name}</div>
//             <div class="player-status">${player.status}</div>
//           </div>
//         </div>
//       `).join('');

//       DOM.onlineGame.playersList.innerHTML = template;
//       DOM.onlineGame.friendsList.innerHTML = template;
//     }

//     static startGame() {
//       DOM.onlineGame.content.style.display = 'none';
//       DOM.onlineGame.loading.style.display = 'flex';
//       DOM.onlineGame.launchBtn.style.display = 'none';

//       setTimeout(() => {
//         console.log(`Starting game with ${OnlineGameModal.selectedPlayer}`);
//       }, 2000);
//     }
//   }

//   // Initialize everything when DOM is ready
//   document.addEventListener('DOMContentLoaded', () => {
//     TooltipManager.initializeTooltips();
//     ProfileModal.initialize();
//     ContextMenu.initialize();
//     GameOptionsManager.initialize();
//     OnlineGameModal.initialize();
//   })
// }

/////////////////////////////////// LAST VERSION QUI FONCTIONNAIT /////////////////////////////////////

// function initializeHome() {
//   console.log("fonction initializeHome appelée..");

//   // Constants and DOM Elements
//   const PLAYER_STATUSES = {
//     ONLINE: 'Online',
//     IN_GAME: 'In Game',
//   };

//   const DOM = {
//     profile: {
//       modal: document.getElementById('profileModal'),
//       closeBtn: document.querySelector('.close-profile-modal'),
//       avatar: document.getElementById('profileAvatar'),
//       nickname: document.getElementById('profileNickname'),
//       rankIcon: document.getElementById('profileRankIcon'),
//       rankText: document.getElementById('profileRankText'),
//       totalGames: document.getElementById('totalGames'),
//       winRate: document.getElementById('winRate'),
//     },
//     game: {
//       options: document.querySelectorAll('.gameOption'),
//       modeOptions: document.querySelectorAll('.modeOption'),
//       playButton: document.querySelector('.playHomePage'),
//       onlineOption: Array.from(document.querySelectorAll('.modeOption')).find(option => option.textContent.trim() === 'ONLINE'),
//     },
//     sections: {
//       avatarSection: document.querySelector('.avatarSection'),
//       rankSection: document.querySelector('.rankSection'),
//     },
//     onlineGame: {
//       modal: document.querySelector('.online-game-modal'),
//       closeBtn: document.querySelector('.close-online-game'),
//       launchBtn: document.querySelector('.launch-game'),
//       content: document.querySelector('.online-game-sections'),
//       loading: document.querySelector('.game-loading'),
//       friendsList: document.getElementById('friendsList'),
//       playersList: document.getElementById('onlinePlayersList'),
//     },
//   };

//   // Tooltip Management
//   class TooltipManager {
//     static initializeTooltips() {
//       // Avatar Tooltip
//       if (DOM.sections.avatarSection) {
//         const avatarTooltipTemplate = document.getElementById('avatarTooltipTemplate');
//         if (avatarTooltipTemplate) {
//           const avatarTooltip = avatarTooltipTemplate.content.cloneNode(true);
//           DOM.sections.avatarSection.style.position = 'relative';
//           DOM.sections.avatarSection.appendChild(avatarTooltip);

//           DOM.sections.avatarSection.addEventListener('mouseenter', () => {
//             DOM.sections.avatarSection.querySelector('.avatar-tooltip').classList.add('show');
//           });
//           DOM.sections.avatarSection.addEventListener('mouseleave', () => {
//             DOM.sections.avatarSection.querySelector('.avatar-tooltip').classList.remove('show');
//           });
//         }
//       }

//       // Rank Tooltip
//       if (DOM.sections.rankSection) {
//         const rankTooltipTemplate = document.getElementById('rankTooltipTemplate');
//         if (rankTooltipTemplate) {
//           const rankTooltip = rankTooltipTemplate.content.cloneNode(true);
//           DOM.sections.rankSection.style.position = 'relative';
//           DOM.sections.rankSection.appendChild(rankTooltip);

//           DOM.sections.rankSection.addEventListener('mouseenter', () => {
//             DOM.sections.rankSection.querySelector('.rank-tooltip').classList.add('show');
//           });
//           DOM.sections.rankSection.addEventListener('mouseleave', () => {
//             DOM.sections.rankSection.querySelector('.rank-tooltip').classList.remove('show');
//           });
//         }
//       }
//     }
//   }

//   // Profile Modal Management
//   class ProfileModal {
//     static initialize() {
//       if (!DOM.profile.modal) return;

//       DOM.profile.closeBtn?.addEventListener('click', () => ProfileModal.hide());
//       window.addEventListener('click', (event) => {
//         if (event.target === DOM.profile.modal) ProfileModal.hide();
//       });
//       document.addEventListener('keydown', (event) => {
//         if (event.key === 'Escape' && DOM.profile.modal.style.display === 'block') {
//           ProfileModal.hide();
//         }
//       });
//     }

//     static show(playerData) {
//       if (!DOM.profile.modal) return;

//       DOM.profile.avatar.src = playerData.avatar;
//       DOM.profile.nickname.textContent = playerData.nickname;
//       DOM.profile.rankIcon.src = `/static/assets/icons/${playerData.rank.toLowerCase()}.png`;
//       DOM.profile.rankText.textContent = playerData.rank;
//       DOM.profile.totalGames.textContent = playerData.stats.totalGames;
//       DOM.profile.winRate.textContent = playerData.stats.winRate;

//       DOM.profile.modal.style.display = 'block';
//       document.body.style.overflow = 'hidden';
//     }

//     static hide() {
//       if (DOM.profile.modal) {
//         DOM.profile.modal.style.display = 'none';
//         document.body.style.overflow = 'auto';
//       }
//     }
//   }

//   // Context Menu Management
//   class ContextMenu {
//     static initialize() {
//       const contextMenuTemplate = document.getElementById('contextMenuTemplate');
//       if (!contextMenuTemplate) return;

//       const contextMenu = contextMenuTemplate.content.cloneNode(true);
//       document.body.appendChild(contextMenu);

//       const contextMenuElement = document.querySelector('.player-context-menu');

//       document.body.addEventListener('click', (e) => {
//         if (e.target.closest('.onlineNickname')) {
//           const nickname = e.target.closest('.onlineNickname');
//           const rect = nickname.getBoundingClientRect();
//           contextMenuElement.style.top = `${rect.bottom + window.scrollY}px`;
//           contextMenuElement.style.left = `${rect.left + window.scrollX}px`;
//           contextMenuElement.style.display = 'block';
//           contextMenuElement.dataset.player = nickname.textContent.trim();
//         } else if (!e.target.closest('.player-context-menu')) {
//           contextMenuElement.style.display = 'none';
//         }
//       });

//       contextMenuElement.addEventListener('click', (e) => {
//         const action = e.target.dataset.action;
//         const player = contextMenuElement.dataset.player;

//         if (action === 'profile') {
//           const playerData = {
//             nickname: player,
//             rank: 'Bronze',
//             avatar: '/static/assets/avatars/clown-fish.png',
//             stats: { totalGames: 0, winRate: '0%' },
//           };
//           ProfileModal.show(playerData);
//         } else if (action === 'add-friend') {
//           ContextMenu.showConfirmation(player);
//         }
//         contextMenuElement.style.display = 'none';
//       });
//     }

//     static showConfirmation(player) {
//       const confirmation = document.createElement('div');
//       confirmation.classList.add('confirmation-animation');
//       confirmation.innerHTML = `
//         <div class="confirmation-icon"></div>
//         <div class="confirmation-text">Friend request sent to ${player}</div>
//       `;
//       document.body.appendChild(confirmation);

//       setTimeout(() => confirmation.remove(), 2000);
//     }
//   }

//   // Game Options Management
//   class GameOptionsManager {
//     static initialize() {
//       const handleSelection = (elements, selectedElement) => {
//         elements.forEach(el => el.classList.remove('option-selected'));
//         selectedElement.classList.add('option-selected');
//       };

//       DOM.game.options.forEach(option => {
//         option.addEventListener('click', () => handleSelection(DOM.game.options, option));
//       });

//       DOM.game.modeOptions.forEach(option => {
//         option.addEventListener('click', () => handleSelection(DOM.game.modeOptions, option));
//       });
//     }
//   }

//   // Online Game Modal Management
//   class OnlineGameModal {
//     static selectedPlayer = null;

//     static initialize() {
//       if (!DOM.game.playButton) return;

//       DOM.game.playButton.addEventListener('click', () => {
//         const isOnlineMode = DOM.game.onlineOption?.classList.contains('option-selected');
//         if (isOnlineMode) OnlineGameModal.show();
//       });

//       DOM.onlineGame.closeBtn?.addEventListener('click', OnlineGameModal.hide);
//       document.addEventListener('click', (e) => {
//         if (e.target === DOM.onlineGame.modal) OnlineGameModal.hide();
//       });

//       DOM.onlineGame.playersList?.addEventListener('click', (e) => {
//         const playerElement = e.target.closest('.online-player');
//         if (playerElement) {
//           DOM.onlineGame.playersList.querySelectorAll('.online-player').forEach(p => p.classList.remove('selected'));
//           playerElement.classList.add('selected');
//           OnlineGameModal.selectedPlayer = playerElement.dataset.player;
//           DOM.onlineGame.launchBtn.disabled = false;
//         }
//       });

//       DOM.onlineGame.launchBtn?.addEventListener('click', () => {
//         if (OnlineGameModal.selectedPlayer) OnlineGameModal.startGame();
//       });
//     }

//     static show() {
//       DOM.onlineGame.modal.style.display = 'block';
//       OnlineGameModal.generatePlayersList();
//     }

//     static hide() {
//       DOM.onlineGame.modal.style.display = 'none';
//       DOM.onlineGame.launchBtn.disabled = true;
//     }

//     static generatePlayersList() {
//       const players = [
//         { name: 'Player1', status: PLAYER_STATUSES.ONLINE, avatar: '/static/assets/avatars/buffalo.png' },
//         { name: 'Player2', status: PLAYER_STATUSES.IN_GAME, avatar: '/static/assets/avatars/clown-fish.png' },
//         { name: 'Player3', status: PLAYER_STATUSES.ONLINE, avatar: '/static/assets/avatars/buffalo.png' },
//       ];

//       const template = players.map(player => `
//         <div class="online-player" data-player="${player.name}">
//           <img src="${player.avatar}" alt="avatar" class="player-avatar">
//           <div class="player-info">
//             <div class="player-name">${player.name}</div>
//             <div class="player-status">${player.status}</div>
//           </div>
//         </div>
//       `).join('');

//       DOM.onlineGame.playersList.innerHTML = template;
//     }

//     static startGame() {
//       console.log(`Starting game with ${OnlineGameModal.selectedPlayer}`);
//       DOM.onlineGame.loading.style.display = 'flex';
//     }
//   }

//   // Initialize all components
//   TooltipManager.initializeTooltips();
//   ProfileModal.initialize();
//   ContextMenu.initialize();
//   GameOptionsManager.initialize();
//   OnlineGameModal.initialize();
// }

////////////////////////////////////OLD VERSION ///////////////////////////////
// function initializeHome() {
//   console.log("fonction initializeHome appelée..");

//   // Constants and DOM Elements
//   const PLAYER_STATUSES = {
//     ONLINE: "Online",
//     IN_GAME: "In Game",
//   };

//   const DOM = {
//     profile: {
//       modal: document.getElementById("profileModal"),
//       closeBtn: document.querySelector(".close-profile-modal"),
//       avatar: document.getElementById("profileAvatar"),
//       nickname: document.getElementById("profileNickname"),
//       rankIcon: document.getElementById("profileRankIcon"),
//       rankText: document.getElementById("profileRankText"),
//       totalGames: document.getElementById("totalGames"),
//       winRate: document.getElementById("winRate"),
//     },
//     game: {
//       options: document.querySelectorAll(".gameOption"),
//       modeOptions: document.querySelectorAll(".modeOption"),
//       playButton: document.querySelector(".playHomePage"),
//     },
//     sections: {
//       avatarSection: document.querySelector(".avatarSection"),
//       rankSection: document.querySelector(".rankSection"),
//     },
//     onlineGame: {
//       modal: document.querySelector(".online-game-modal"),
//       closeBtn: document.querySelector(".close-online-game"),
//       launchBtn: document.querySelector(".launch-game"),
//       content: document.querySelector(".online-game-sections"),
//       loading: document.querySelector(".game-loading"),
//       friendsList: document.getElementById("friendsList"),
//       playersList: document.getElementById("onlinePlayersList"),
//     },
//   };

//   // Tooltip Management
//   class TooltipManager {
//     static initializeTooltips() {
//       // Avatar Tooltip
//       if (DOM.sections.avatarSection) {
//         const avatarTooltipTemplate = document.getElementById(
//           "avatarTooltipTemplate"
//         );
//         if (avatarTooltipTemplate) {
//           const avatarTooltip = avatarTooltipTemplate.content.cloneNode(true);
//           DOM.sections.avatarSection.style.position = "relative";
//           DOM.sections.avatarSection.appendChild(avatarTooltip);

//           DOM.sections.avatarSection.addEventListener("mouseenter", () => {
//             DOM.sections.avatarSection
//               .querySelector(".avatar-tooltip")
//               .classList.add("show");
//           });
//           DOM.sections.avatarSection.addEventListener("mouseleave", () => {
//             DOM.sections.avatarSection
//               .querySelector(".avatar-tooltip")
//               .classList.remove("show");
//           });
//         }
//       }

//       // Rank Tooltip
//       if (DOM.sections.rankSection) {
//         const rankTooltipTemplate = document.getElementById(
//           "rankTooltipTemplate"
//         );
//         if (rankTooltipTemplate) {
//           const rankTooltip = rankTooltipTemplate.content.cloneNode(true);
//           DOM.sections.rankSection.style.position = "relative";
//           DOM.sections.rankSection.appendChild(rankTooltip);

//           DOM.sections.rankSection.addEventListener("mouseenter", () => {
//             DOM.sections.rankSection
//               .querySelector(".rank-tooltip")
//               .classList.add("show");
//           });
//           DOM.sections.rankSection.addEventListener("mouseleave", () => {
//             DOM.sections.rankSection
//               .querySelector(".rank-tooltip")
//               .classList.remove("show");
//           });
//         }
//       }
//     }
//   }

//   // Profile Modal Management
//   class ProfileModal {
//     static initialize() {
//       if (!DOM.profile.modal) return;

//       DOM.profile.closeBtn?.addEventListener("click", () =>
//         ProfileModal.hide()
//       );
//       window.addEventListener("click", (event) => {
//         if (event.target === DOM.profile.modal) ProfileModal.hide();
//       });
//       document.addEventListener("keydown", (event) => {
//         if (
//           event.key === "Escape" &&
//           DOM.profile.modal.style.display === "block"
//         ) {
//           ProfileModal.hide();
//         }
//       });
//     }

//     static show(playerData) {
//       if (!DOM.profile.modal) return;

//       DOM.profile.avatar.src = playerData.avatar;
//       DOM.profile.nickname.textContent = playerData.nickname;
//       DOM.profile.rankIcon.src = `/static/assets/icons/${playerData.rank.toLowerCase()}.png`;
//       DOM.profile.rankText.textContent = playerData.rank;
//       DOM.profile.totalGames.textContent = playerData.stats.totalGames;
//       DOM.profile.winRate.textContent = playerData.stats.winRate;

//       DOM.profile.modal.style.display = "block";
//       document.body.style.overflow = "hidden";
//     }

//     static hide() {
//       if (DOM.profile.modal) {
//         DOM.profile.modal.style.display = "none";
//         document.body.style.overflow = "auto";
//       }
//     }
//   }

//   // Context Menu Management
//   class ContextMenu {
//     static initialize() {
//       const contextMenuTemplate = document.getElementById(
//         "contextMenuTemplate"
//       );
//       if (!contextMenuTemplate) return;

//       const contextMenu = contextMenuTemplate.content.cloneNode(true);
//       document.body.appendChild(contextMenu);

//       const contextMenuElement = document.querySelector(".player-context-menu");

//       document.body.addEventListener("click", (e) => {
//         if (e.target.closest(".onlineNickname")) {
//           const nickname = e.target.closest(".onlineNickname");
//           const rect = nickname.getBoundingClientRect();
//           contextMenuElement.style.top = `${rect.bottom + window.scrollY}px`;
//           contextMenuElement.style.left = `${rect.left + window.scrollX}px`;
//           contextMenuElement.style.display = "block";
//           contextMenuElement.dataset.player = nickname.textContent.trim();
//         } else if (!e.target.closest(".player-context-menu")) {
//           contextMenuElement.style.display = "none";
//         }
//       });

//       contextMenuElement.addEventListener("click", (e) => {
//         const action = e.target.dataset.action;
//         const player = contextMenuElement.dataset.player;

//         if (action === "profile") {
//           const playerData = {
//             nickname: player,
//             rank: "Bronze",
//             avatar: "/static/assets/avatars/clown-fish.png",
//             stats: { totalGames: 0, winRate: "0%" },
//           };
//           ProfileModal.show(playerData);
//         } else if (action === "add-friend") {
//           ContextMenu.showConfirmation(player);
//         }
//         contextMenuElement.style.display = "none";
//       });
//     }

//     static showConfirmation(player) {
//       const confirmation = document.createElement("div");
//       confirmation.classList.add("confirmation-animation");
//       confirmation.innerHTML = `
//         <div class="confirmation-icon"></div>
//         <div class="confirmation-text">Friend request sent to ${player}</div>
//       `;
//       document.body.appendChild(confirmation);

//       setTimeout(() => confirmation.remove(), 2000);
//     }
//   }

//   // Game Options Management
//   class GameOptionsManager {
//     static initialize() {
//       const handleSelection = (elements, selectedElement) => {
//         elements.forEach((el) => el.classList.remove("option-selected"));
//         selectedElement.classList.add("option-selected");
//       };

//       DOM.game.options.forEach((option) => {
//         option.addEventListener("click", () =>
//           handleSelection(DOM.game.options, option)
//         );
//       });

//       DOM.game.modeOptions.forEach((option) => {
//         option.addEventListener("click", () =>
//           handleSelection(DOM.game.modeOptions, option)
//         );
//       });
//     }
//   }

//   // Online Game Modal Management
//   class OnlineGameModal {
//     static selectedPlayer = null;

//     static initialize() {
//       DOM.onlineGame.closeBtn?.addEventListener("click", OnlineGameModal.hide);
//       document.addEventListener("click", (e) => {
//         if (e.target === DOM.onlineGame.modal) OnlineGameModal.hide();
//       });

//       DOM.onlineGame.playersList?.addEventListener("click", (e) => {
//         const playerElement = e.target.closest(".online-player");
//         if (playerElement) {
//           DOM.onlineGame.playersList
//             .querySelectorAll(".online-player")
//             .forEach((p) => p.classList.remove("selected"));
//           playerElement.classList.add("selected");
//           OnlineGameModal.selectedPlayer = playerElement.dataset.player;
//           DOM.onlineGame.launchBtn.disabled = false;
//         }
//       });

//       DOM.onlineGame.launchBtn?.addEventListener("click", () => {
//         if (OnlineGameModal.selectedPlayer) OnlineGameModal.startGame();
//       });
//     }

//     static show() {
//       DOM.onlineGame.modal.style.display = "block";
//       OnlineGameModal.generatePlayersList();
//     }

//     static hide() {
//       DOM.onlineGame.modal.style.display = "none";
//       DOM.onlineGame.launchBtn.disabled = true;
//     }

//     static generatePlayersList() {
//       const players = [
//         {
//           name: "Player1",
//           status: PLAYER_STATUSES.ONLINE,
//           avatar: "/static/assets/avatars/buffalo.png",
//         },
//         {
//           name: "Player2",
//           status: PLAYER_STATUSES.IN_GAME,
//           avatar: "/static/assets/avatars/clown-fish.png",
//         },
//         {
//           name: "Player3",
//           status: PLAYER_STATUSES.ONLINE,
//           avatar: "/static/assets/avatars/buffalo.png",
//         },
//       ];

//       const template = players
//         .map(
//           (player) => `
//         <div class="online-player" data-player="${player.name}">
//           <img src="${player.avatar}" alt="avatar" class="player-avatar">
//           <div class="player-info">
//             <div class="player-name">${player.name}</div>
//             <div class="player-status">${player.status}</div>
//           </div>
//         </div>
//       `
//         )
//         .join("");

//       DOM.onlineGame.playersList.innerHTML = template;
//     }

//     static startGame() {
//       console.log(`Starting game with ${OnlineGameModal.selectedPlayer}`);
//       DOM.onlineGame.loading.style.display = "flex";
//     }
//   }

//   // Manage Game Actions
//   class GameActions {
//     static handlePlayButtonClick() {
//       const selectedGame = Array.from(DOM.game.options).find((option) =>
//         option.classList.contains("option-selected")
//       );
//       const selectedMode = Array.from(DOM.game.modeOptions).find((option) =>
//         option.classList.contains("option-selected")
//       );

//       if (!selectedGame || !selectedMode) {
//         alert("Please select both a game type and a mode!");
//         return;
//       }

//       const gameType = selectedGame.textContent.trim();
//       const modeType = selectedMode.textContent.trim();

//       console.log(`Selected Game: ${gameType}, Selected Mode: ${modeType}`);

//       if (gameType === "CLASSIC PONG" && modeType === "AGAINST AI") {
//         console.log("Launching Classic Pong against AI...");
//         GameActions.launchClassicGame();
//       } else if (gameType === "CLASSIC PONG" && modeType === "TOURNAMENT") {
//         console.log("Redirecting to /tournament...");
//         window.location.href = "/tournament";
//       } else if (gameType === "POWER PONG" && modeType === "TOURNAMENT") {
//         console.log("Redirecting to /tournament...");
//         window.location.href = "/tournament";
//       } else if (
//         (gameType === "CLASSIC PONG" || gameType === "POWER PONG") &&
//         modeType === "ONLINE"
//       ) {
//         console.log(`Launching ${gameType} Online...`);
//         OnlineGameModal.show();
//       } else {
//         console.log(`${gameType} ${modeType} mode is not implemented yet.`);
//       }
//     }

//     static launchClassicGame() {
//       console.log("Launching the current game logic...");

//       // Ajouter la logique pour le mode contre l'IA ici
//     }
//   }

//   // Initialize all components
//   TooltipManager.initializeTooltips();
//   ProfileModal.initialize();
//   ContextMenu.initialize();
//   GameOptionsManager.initialize();
//   OnlineGameModal.initialize();

//   DOM.game.playButton.addEventListener("click", () => {
//     GameActions.handlePlayButtonClick();
//   });
// }

///////////////////////////////////////////// ancienne version good //////////////////////////////////

// function updateProfilOnHome() {
//   fetch("/api/profil/", {
//     method: "GET",
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`Erreur HTTP: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then((data) => {
//       if (data.username && data.email) {
//         document.getElementById("nicknameProfilUser").innerText = data.username;

//         const win_ratio = data.win_ratio ?? 0;
//         const totalGames = data.total_games ?? 0;
//         console.log("total games : ", totalGames);

//         if (win_ratio < 33) {
//           document.getElementById("rankImage").src = "static/assets/icons/bronze.png";
//           document.getElementById("rankText").innerText = "Bronze";
//         } else if (win_ratio < 66 && win_ratio >= 33) {
//           document.getElementById("rankImage").src = "static/assets/icons/silver.png";
//           document.getElementById("rankText").innerText = "Silver";
//         } else if ((win_ratio < 80 && win_ratio >= 66)  || (win_ratio >= 66  && totalGames < 5)) {
//           document.getElementById("rankImage").src = "static/assets/icons/gold.png";
//           document.getElementById("rankText").innerText = "Gold";
//         } else if (win_ratio >= 80 && totalGames >= 5) {
//           document.getElementById("rankImage").src = "static/assets/icons/platinium.png";
//           document.getElementById("rankText").innerText = "Platinium";
//         }

//         const avatarUrl = data.avatar && data.avatar.trim() ? data.avatar : "/static/assets/avatars/buffalo.png";
//         document.getElementById("avatarProfilUser").src = avatarUrl;
//       }
//     })
//     .catch((error) => {
//       console.error("Erreur lors de la récupération du profil :", error);
//     });
// }

// function initializeHome() {
//   console.log("fonction initializeHome appelée..");

//   // Constants and DOM Elements
//   const PLAYER_STATUSES = {
//     ONLINE: "Online",
//     IN_GAME: "In Game",
//   };

// const DOM = {
//   profile: {
//     modal: document.getElementById("profileModal"),
//     closeBtn: document.querySelector(".close-profile-modal"),
//     avatar: document.getElementById("profileAvatar"),
//     nickname: document.getElementById("profileNickname"),
//     rankIcon: document.getElementById("profileRankIcon"),
//     rankText: document.getElementById("profileRankText"),
//     totalGames: document.getElementById("totalGames"),
//     winRate: document.getElementById("winRate"),
//   },
//   game: {
//     options: document.querySelectorAll(".gameOption"),
//     modeOptions: document.querySelectorAll(".modeOption"),
//     playButton: document.querySelector(".playHomePage"),
//   },
//   sections: {
//     avatarSection: document.querySelector(".avatarSection"),
//     rankSection: document.querySelector(".rankSection"),
//   },
//   onlineGame: {
//     modal: document.querySelector(".online-game-modal"),
//     closeBtn: document.querySelector(".close-online-game"),
//     launchBtn: document.querySelector(".launch-game"),
//     content: document.querySelector(".online-game-sections"),
//     loading: document.querySelector(".game-loading"),
//     friendsList: document.getElementById("friendsList"),
//     playersList: document.getElementById("onlinePlayersList"),
//   },
// };

//   updateProfilOnHome();

//   let isGameInitialized = false;

//   // Tooltip Management
//   class TooltipManager {
//     static initializeTooltips() {
//       // Avatar Tooltip
//       if (DOM.sections.avatarSection) {
//         const avatarTooltipTemplate = document.getElementById(
//           "avatarTooltipTemplate"
//         );
//         if (avatarTooltipTemplate) {
//           const avatarTooltip = avatarTooltipTemplate.content.cloneNode(true);
//           DOM.sections.avatarSection.style.position = "relative";
//           DOM.sections.avatarSection.appendChild(avatarTooltip);

//           DOM.sections.avatarSection.addEventListener("mouseenter", () => {
//             DOM.sections.avatarSection
//               .querySelector(".avatar-tooltip")
//               .classList.add("show");
//           });
//           DOM.sections.avatarSection.addEventListener("mouseleave", () => {
//             DOM.sections.avatarSection
//               .querySelector(".avatar-tooltip")
//               .classList.remove("show");
//           });
//         }
//       }

//       // Rank Tooltip
//       if (DOM.sections.rankSection) {
//         const rankTooltipTemplate = document.getElementById(
//           "rankTooltipTemplate"
//         );
//         if (rankTooltipTemplate) {
//           const rankTooltip = rankTooltipTemplate.content.cloneNode(true);
//           DOM.sections.rankSection.style.position = "relative";
//           DOM.sections.rankSection.appendChild(rankTooltip);

//           DOM.sections.rankSection.addEventListener("mouseenter", () => {
//             DOM.sections.rankSection
//               .querySelector(".rank-tooltip")
//               .classList.add("show");
//           });
//           DOM.sections.rankSection.addEventListener("mouseleave", () => {
//             DOM.sections.rankSection
//               .querySelector(".rank-tooltip")
//               .classList.remove("show");
//           });
//         }
//       }
//     }
//   }

//   // Profile Modal Management
//   class ProfileModal {
//     static initialize() {
//       if (!DOM.profile.modal) return;

//       DOM.profile.closeBtn?.addEventListener("click", () =>
//         ProfileModal.hide()
//       );
//       window.addEventListener("click", (event) => {
//         if (event.target === DOM.profile.modal) ProfileModal.hide();
//       });
//       document.addEventListener("keydown", (event) => {
//         if (
//           event.key === "Escape" &&
//           DOM.profile.modal.style.display === "block"
//         ) {
//           ProfileModal.hide();
//         }
//       });
//     }

//     static show(playerData) {
//       if (!DOM.profile.modal) return;

//       DOM.profile.avatar.src = playerData.avatar;
//       DOM.profile.nickname.textContent = playerData.nickname;
//       DOM.profile.rankIcon.src = `/static/assets/icons/${playerData.rank.toLowerCase()}.png`;
//       DOM.profile.rankText.textContent = playerData.rank;
//       DOM.profile.totalGames.textContent = playerData.stats.totalGames;
//       DOM.profile.winRate.textContent = playerData.stats.winRate;

//       DOM.profile.modal.style.display = "block";
//       document.body.style.overflow = "hidden";
//     }

//     static hide() {
//       if (DOM.profile.modal) {
//         DOM.profile.modal.style.display = "none";
//         document.body.style.overflow = "auto";
//       }
//     }
//   }

//   // Context Menu Management
//   class ContextMenu {
//     static initialize() {
//       const contextMenuTemplate = document.getElementById(
//         "contextMenuTemplate"
//       );
//       if (!contextMenuTemplate) return;

//       const contextMenu = contextMenuTemplate.content.cloneNode(true);
//       document.body.appendChild(contextMenu);

//       const contextMenuElement = document.querySelector(".player-context-menu");

//       document.body.addEventListener("click", (e) => {
//         if (e.target.closest(".onlineNickname")) {
//           const nickname = e.target.closest(".onlineNickname");
//           const rect = nickname.getBoundingClientRect();
//           contextMenuElement.style.top = `${rect.bottom + window.scrollY}px`;
//           contextMenuElement.style.left = `${rect.left + window.scrollX}px`;
//           contextMenuElement.style.display = "block";
//           contextMenuElement.dataset.player = nickname.textContent.trim();
//         } else if (!e.target.closest(".player-context-menu")) {
//           contextMenuElement.style.display = "none";
//         }
//       });

//       contextMenuElement.addEventListener("click", (e) => {
//         const action = e.target.dataset.action;
//         const player = contextMenuElement.dataset.player;

//         if (action === "profile") {
//           const playerData = {
//             nickname: player,
//             rank: "Bronze",
//             avatar: "/static/assets/avatars/clown-fish.png",
//             stats: { totalGames: 0, winRate: "0%" },
//           };
//           ProfileModal.show(playerData);
//         } else if (action === "add-friend") {
//           ContextMenu.showConfirmation(player);
//         }
//         contextMenuElement.style.display = "none";
//       });
//     }

//     static showConfirmation(player) {
//       const confirmation = document.createElement("div");
//       confirmation.classList.add("confirmation-animation");
//       confirmation.innerHTML = `
//         <div class="confirmation-icon"></div>
//         <div class="confirmation-text">Friend request sent to ${player}</div>
//       `;
//       document.body.appendChild(confirmation);

//       setTimeout(() => confirmation.remove(), 2000);
//     }
//   }

//   // Game Options Management
//   class GameOptionsManager {
//     static initialize() {
//       const handleSelection = (elements, selectedElement) => {
//         elements.forEach((el) => el.classList.remove("option-selected"));
//         selectedElement.classList.add("option-selected");
//       };

//       DOM.game.options.forEach((option) => {
//         option.addEventListener("click", () =>
//           handleSelection(DOM.game.options, option)
//         );
//       });

//       DOM.game.modeOptions.forEach((option) => {
//         option.addEventListener("click", () =>
//           handleSelection(DOM.game.modeOptions, option)
//         );
//       });
//     }
//   }

//   // Online Game Modal Management
//   class OnlineGameModal {
//     static selectedPlayer = null;

//     static initialize() {
//       DOM.onlineGame.closeBtn?.addEventListener("click", OnlineGameModal.hide);
//       document.addEventListener("click", (e) => {
//         if (e.target === DOM.onlineGame.modal) OnlineGameModal.hide();
//       });

//       DOM.onlineGame.playersList?.addEventListener("click", (e) => {
//         const playerElement = e.target.closest(".online-player");
//         if (playerElement) {
//           DOM.onlineGame.playersList
//             .querySelectorAll(".online-player")
//             .forEach((p) => p.classList.remove("selected"));
//           playerElement.classList.add("selected");
//           OnlineGameModal.selectedPlayer = playerElement.dataset.player;
//           DOM.onlineGame.launchBtn.disabled = false;
//         }
//       });

//       DOM.onlineGame.launchBtn?.addEventListener("click", () => {
//         if (OnlineGameModal.selectedPlayer) OnlineGameModal.startGame();
//       });
//     }

//     static show() {
//       DOM.onlineGame.modal.style.display = "block";
//       OnlineGameModal.generatePlayersList();
//     }

//     static hide() {
//       DOM.onlineGame.modal.style.display = "none";
//       DOM.onlineGame.launchBtn.disabled = true;
//     }

//     static generatePlayersList() {
//       const players = [
//         {
//           name: "Player1",
//           status: PLAYER_STATUSES.ONLINE,
//           avatar: "/static/assets/avatars/buffalo.png",
//         },
//         {
//           name: "Player2",
//           status: PLAYER_STATUSES.IN_GAME,
//           avatar: "/static/assets/avatars/clown-fish.png",
//         },
//         {
//           name: "Player3",
//           status: PLAYER_STATUSES.ONLINE,
//           avatar: "/static/assets/avatars/buffalo.png",
//         },
//       ];

//       const template = players
//         .map(
//           (player) => `
//         <div class="online-player" data-player="${player.name}">
//           <img src="${player.avatar}" alt="avatar" class="player-avatar">
//           <div class="player-info">
//             <div class="player-name">${player.name}</div>
//             <div class="player-status">${player.status}</div>
//           </div>
//         </div>
//       `
//         )
//         .join("");

//       DOM.onlineGame.playersList.innerHTML = template;
//     }

//     static startGame() {
//       console.log(`Starting game with ${OnlineGameModal.selectedPlayer}`);
//       DOM.onlineGame.loading.style.display = "flex";
//     }
//   }

//   // Manage Game Actions
//   class GameActions {
//     static handlePlayButtonClick() {
//       const selectedGame = Array.from(DOM.game.options).find((option) =>
//         option.classList.contains("option-selected")
//       );
//       const selectedMode = Array.from(DOM.game.modeOptions).find((option) =>
//         option.classList.contains("option-selected")
//       );

//       if (!selectedGame || !selectedMode) {
//         alert("Please select both a game type and a mode!");
//         return;
//       }

//       const gameType = selectedGame.textContent.trim();
//       const modeType = selectedMode.textContent.trim();

//       console.log(`Selected Game: ${gameType}, Selected Mode: ${modeType}`);

//       if (gameType === "CLASSIC PONG" && modeType === "AGAINST AI") {
//         console.log("Launching Classic Pong against AI...");
//         startMatch();
//       } else if (gameType === "CLASSIC PONG" && modeType === "TOURNAMENT") {
//         console.log("Redirecting to /tournament...");
//         window.location.href = "/tournament";
//       } else if (gameType === "POWER PONG" && modeType === "TOURNAMENT") {
//         console.log("Redirecting to /tournament...");
//         window.location.href = "/tournament";
//       } else if (
//         (gameType === "CLASSIC PONG" || gameType === "POWER PONG") &&
//         modeType === "ONLINE"
//       ) {
//         console.log(`Launching ${gameType} Online...`);
//         OnlineGameModal.show();
//       } else {
//         console.log(`${gameType} ${modeType} mode is not implemented yet.`);
//       }
//     }
//   }

//   function startMatch() {
//     if (!isGameInitialized) {
//       console.log("startMatch() appelée.");
//       isGameInitialized = true;

//       const loadingIndicator = document.createElement("div");
//       loadingIndicator.innerText = "Chargement du jeu...";
//       loadingIndicator.style.cssText = `
//         color: white;
//         font-size: 20px;
//         text-align: center;
//         margin-top: 20px;
//       `;
//       document.body.appendChild(loadingIndicator);

//       const modal = document.createElement("div");
//       modal.id = "gameModal";
//       modal.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100vw;
//         height: 100vh;
//         background: rgba(0, 0, 0, 0.9);
//         z-index: 1000;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//       `;

//       const iframe = document.createElement("iframe");
//       iframe.src = "/static/spa/game3D/three.html";
//       iframe.style.cssText = `
//         width: 100%;
//         height: 100%;
//         border: none;
//       `;

//       iframe.onload = () => {
//         document.body.removeChild(loadingIndicator);
//         console.log("Jeu chargé.");

//         setTimeout(() => {
//           iframe.contentWindow.focus();
//           console.log("Focus défini sur l'iframe.");
//         }, 100);
//       };

//       modal.appendChild(iframe);

//       document.body.appendChild(modal);

//       // window.addEventListener("message", (event) => {
//       //   console.log("message recu : ", event.data);
//       //   if (event.data.type === "gameComplete") {
//       //     const winner = event.data.data?.winner; // Récupérer le gagnant correctement
//       //     console.log(`Le gagnant est: ${winner}`);

//       //     // Fermer le modal et réinitialiser l'état
//       //     setTimeout(() => {
//       //       document.body.removeChild(modal);
//       //       console.log("Modal fermée automatiquement après la fin du jeu.");
//       //       isGameInitialized = false;
//       //     }, 250);

//       //     // Mettre à jour le profil
//       //     updateProfilOnHome();
//       //   }
//       // });

//       window.addEventListener("message", (event) => {
//         console.log("Message reçu depuis l'iframe :", event.data);

//         if (event.data.type === "gameComplete") {
//           console.log(`Le gagnant est: ${event.data.data?.winner}`);
//           setTimeout(() => {
//             if (document.body.contains(modal)) {
//               document.body.removeChild(modal);
//               console.log("Modal fermée automatiquement après la fin du jeu.");
//               isGameInitialized = false;
//             }
//           }, 250);
//           updateProfilOnHome();
//         }
//       });

//       // window.addEventListener("message", (event) => {
//       //   if (event.data.type === "gameComplete") {
//       //     console.log(`Le gagnant est: ${event.data.winner}`);
//       //     setTimeout(() => {
//       //       document.body.removeChild(modal);
//       //       console.log("Modal fermée automatiquement après la fin du jeu.");
//       //       isGameInitialized = false;
//       //     }, 250);
//       //     updateProfilOnHome();
//       //   }
//       // });
//     } else {
//       console.log("Le jeu est déjà initialisé.");
//     }
//   }

//   // Initialize all components
//   TooltipManager.initializeTooltips();
//   ProfileModal.initialize();
//   ContextMenu.initialize();
//   GameOptionsManager.initialize();
//   OnlineGameModal.initialize();

//   DOM.game.playButton.addEventListener("click", () => {
//     GameActions.handlePlayButtonClick();
//   });
// }

/////////////////////////////////////////////////////////////////////////////////////////////
function updateProfilOnHome() {
  console.log("fonction updateprofilonhome appelee...")
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

        if (win_ratio < 33) {
          document.getElementById("rankImage").src =
            "static/assets/icons/bronze.png";
          document.getElementById("rankText").innerText = "Bronze";
        } else if (win_ratio < 66 && win_ratio >= 33) {
          document.getElementById("rankImage").src =
            "static/assets/icons/silver.png";
          document.getElementById("rankText").innerText = "Silver";
        } else if (
          (win_ratio < 80 && win_ratio >= 66) ||
          (win_ratio >= 66 && totalGames < 5)
        ) {
          document.getElementById("rankImage").src =
            "static/assets/icons/gold.png";
          document.getElementById("rankText").innerText = "Gold";
        } else if (win_ratio >= 80 && totalGames >= 5) {
          document.getElementById("rankImage").src =
            "static/assets/icons/platinium.png";
          document.getElementById("rankText").innerText = "Platinium";
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

function initializeHome() {
  console.log("fonction initializeHome appelée..");

  // Constants and DOM Elements
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
  let currentUser = null;

  class ChatHandler {
    static async initialize() {
      try {
        const response = await fetch("/api/profil/", {
          credentials: "include",
        });

        if (response.ok) {
          currentUser = await response.json();
          ChatHandler.blockedUsers = new Set();
          ChatHandler.setupEventListeners();
          ChatHandler.initializeContextMenu();
          window.wsManager.addMessageListener(ChatHandler.handleMessage);

          const messageHistory = window.wsManager.getMessageHistory();
          messageHistory.forEach((message) =>
            ChatHandler.handleMessage(message)
          );
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du chat:", error);
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

    static initializeContextMenu() {
      const chatMessages = DOM.chat.messages;
      let activeMenu = null;

      chatMessages.addEventListener("click", (e) => {
        const avatar = e.target.closest(".messageAvatar");
        if (!avatar) return;

        e.preventDefault();
        e.stopPropagation();

        if (activeMenu) {
          activeMenu.remove();
          activeMenu = null;
        }

        const messageElement = avatar.closest(".message");
        const username =
          messageElement.querySelector(".messageHeader").textContent;
        const avatarSrc = avatar.src;
        const isBlocked = ChatHandler.blockedUsers.has(username);

        const menu = document.createElement("div");
        menu.className = "chat-context-menu";
        menu.innerHTML = `
            <div class="chat-menu-option" data-action="profile">
                See profile
            </div>
            <div class="chat-menu-option" data-action="add-friend">
                Add friend
            </div>
            <div class="chat-menu-option" data-action="block">
                ${isBlocked ? "Unblock user" : "Block user"}
            </div>
            <div class="chat-menu-option" data-action="private-message">
                Private message
            </div>
        `;

        document.body.appendChild(menu);
        const rect = avatar.getBoundingClientRect();
        ChatHandler.positionMenuWithinViewport(menu, rect);

        activeMenu = menu;

        menu.addEventListener("click", (e) => {
          const option = e.target.closest(".chat-menu-option");
          if (!option) return;

          const action = option.dataset.action;
          if (action === "profile") {
            const playerData = {
              nickname: username,
              avatar: avatarSrc,
              rank: "Bronze",
              stats: { totalGames: 0, winRate: "0%" },
            };
            ProfileModal.show(playerData);
          } else if (action === "add-friend") {
            ContextMenu.showConfirmation(username);
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
    }

    static toggleBlockUser(username) {
      if (ChatHandler.blockedUsers.has(username)) {
        ChatHandler.blockedUsers.delete(username);
      } else {
        ChatHandler.blockedUsers.add(username);
      }

      const messages = DOM.chat.messages.querySelectorAll(".message");
      messages.forEach((message) => {
        const messageUsername =
          message.querySelector(".messageHeader").textContent;
        if (messageUsername === username) {
          message.style.opacity = ChatHandler.blockedUsers.has(username)
            ? "0.5"
            : "1";
          const messageText = message.querySelector(".messageText");
          if (ChatHandler.blockedUsers.has(username)) {
            messageText.dataset.originalText = messageText.textContent;
            messageText.textContent = "Message blocked";
          } else {
            messageText.textContent =
              messageText.dataset.originalText || messageText.textContent;
          }
        }
      });
    }

    static showBlockConfirmation(username, isBlocking) {
      const homePageMain = document.querySelector(".homePageMain");
      if (!homePageMain) return;

      const confirmation = document.createElement("div");
      confirmation.classList.add("confirmation-animation");
      confirmation.innerHTML = `
          <div class="confirmation-icon"></div>
          <div class="confirmation-text">
              ${
                isBlocking
                  ? `User ${username} has been blocked`
                  : `User ${username} has been unblocked`
              }
          </div>
      `;

      homePageMain.appendChild(confirmation);
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
        data.message = "Message blocked";
      }

      const isCurrentUser =
        currentUser && data.username === currentUser.username;
      const messageElement = document.createElement("div");
      messageElement.className = `message ${
        isCurrentUser ? "sent" : "received"
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
              title="Click for options">
          <div class="messageContent">
              <div class="messageHeader">${data.username}</div>
              <div class="messageText" ${
                ChatHandler.blockedUsers.has(data.username)
                  ? 'data-original-text="' + data.originalMessage + '"'
                  : ""
              }>${data.message}</div>
          </div>
      `;

      DOM.chat.messages.appendChild(messageElement);
      DOM.chat.messages.scrollTop = DOM.chat.messages.scrollHeight;
    }

    static sendMessage() {
      if (!DOM.chat.input || !currentUser) return;

      const message = DOM.chat.input.value.trim();
      if (!message) return;

      const pmMatch = message.match(/^\/pm\s+(\S+)\s+(.+)$/);
      if (pmMatch) {
        const [, recipient, privateMessage] = pmMatch;
        window.wsManager.sendMessage({
          type: "private_message",
          message: privateMessage,
          username: currentUser.username,
          avatar: currentUser.avatar,
          recipient: recipient,
        });
      } else {
        window.wsManager.sendMessage({
          type: "chat_message",
          message: message,
          username: currentUser.username,
          avatar: currentUser.avatar,
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

  // Profile Modal Management
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

    static show(playerData) {
      if (!DOM.profile.modal) return;

      DOM.profile.avatar.src = playerData.avatar;
      DOM.profile.nickname.textContent = playerData.nickname;
      DOM.profile.rankIcon.src = `/static/assets/icons/${playerData.rank.toLowerCase()}.png`;
      DOM.profile.rankText.textContent = playerData.rank;
      DOM.profile.totalGames.textContent = playerData.stats.totalGames;
      DOM.profile.winRate.textContent = playerData.stats.winRate;

      DOM.profile.modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }

    static hide() {
      if (DOM.profile.modal) {
        DOM.profile.modal.style.display = "none";
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

        if (action === "profile") {
          const playerData = {
            nickname: player,
            rank: "Bronze",
            avatar: "/static/assets/avatars/clown-fish.png",
            stats: { totalGames: 0, winRate: "0%" },
          };
          ProfileModal.show(playerData);
        } else if (action === "add-friend") {
          ContextMenu.showConfirmation(player);
        }

        contextMenuElement.style.display = "none";
      });

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
  ProfileModal.initialize();
  ContextMenu.initialize();
  GameOptionsManager.initialize();
  OnlineGameModal.initialize();
  ChatHandler.initialize();

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
