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
function initializeHome() {
  console.log("fonction initializeHome appelée..");

  // Constants and DOM Elements
  const PLAYER_STATUSES = {
    ONLINE: 'Online',
    IN_GAME: 'In Game',
  };

  const DOM = {
    profile: {
      modal: document.getElementById('profileModal'),
      closeBtn: document.querySelector('.close-profile-modal'),
      avatar: document.getElementById('profileAvatar'),
      nickname: document.getElementById('profileNickname'),
      rankIcon: document.getElementById('profileRankIcon'),
      rankText: document.getElementById('profileRankText'),
      totalGames: document.getElementById('totalGames'),
      winRate: document.getElementById('winRate'),
    },
    game: {
      options: document.querySelectorAll('.gameOption'),
      modeOptions: document.querySelectorAll('.modeOption'),
      playButton: document.querySelector('.playHomePage'),
      onlineOption: Array.from(document.querySelectorAll('.modeOption')).find(option => option.textContent.trim() === 'ONLINE'),
    },
    sections: {
      avatarSection: document.querySelector('.avatarSection'),
      rankSection: document.querySelector('.rankSection'),
    },
    onlineGame: {
      modal: document.querySelector('.online-game-modal'),
      closeBtn: document.querySelector('.close-online-game'),
      launchBtn: document.querySelector('.launch-game'),
      content: document.querySelector('.online-game-sections'),
      loading: document.querySelector('.game-loading'),
      friendsList: document.getElementById('friendsList'),
      playersList: document.getElementById('onlinePlayersList'),
    },
  };

  // Tooltip Management
  class TooltipManager {
    static initializeTooltips() {
      // Avatar Tooltip
      if (DOM.sections.avatarSection) {
        const avatarTooltipTemplate = document.getElementById('avatarTooltipTemplate');
        if (avatarTooltipTemplate) {
          const avatarTooltip = avatarTooltipTemplate.content.cloneNode(true);
          DOM.sections.avatarSection.style.position = 'relative';
          DOM.sections.avatarSection.appendChild(avatarTooltip);

          DOM.sections.avatarSection.addEventListener('mouseenter', () => {
            DOM.sections.avatarSection.querySelector('.avatar-tooltip').classList.add('show');
          });
          DOM.sections.avatarSection.addEventListener('mouseleave', () => {
            DOM.sections.avatarSection.querySelector('.avatar-tooltip').classList.remove('show');
          });
        }
      }

      // Rank Tooltip
      if (DOM.sections.rankSection) {
        const rankTooltipTemplate = document.getElementById('rankTooltipTemplate');
        if (rankTooltipTemplate) {
          const rankTooltip = rankTooltipTemplate.content.cloneNode(true);
          DOM.sections.rankSection.style.position = 'relative';
          DOM.sections.rankSection.appendChild(rankTooltip);

          DOM.sections.rankSection.addEventListener('mouseenter', () => {
            DOM.sections.rankSection.querySelector('.rank-tooltip').classList.add('show');
          });
          DOM.sections.rankSection.addEventListener('mouseleave', () => {
            DOM.sections.rankSection.querySelector('.rank-tooltip').classList.remove('show');
          });
        }
      }
    }
  }

  // Profile Modal Management
  class ProfileModal {
    static initialize() {
      if (!DOM.profile.modal) return;

      DOM.profile.closeBtn?.addEventListener('click', () => ProfileModal.hide());
      window.addEventListener('click', (event) => {
        if (event.target === DOM.profile.modal) ProfileModal.hide();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && DOM.profile.modal.style.display === 'block') {
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

      DOM.profile.modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    static hide() {
      if (DOM.profile.modal) {
        DOM.profile.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    }
  }

  // Context Menu Management
  class ContextMenu {
    static initialize() {
      const contextMenuTemplate = document.getElementById('contextMenuTemplate');
      if (!contextMenuTemplate) return;

      const contextMenu = contextMenuTemplate.content.cloneNode(true);
      document.body.appendChild(contextMenu);

      const contextMenuElement = document.querySelector('.player-context-menu');

      document.body.addEventListener('click', (e) => {
        if (e.target.closest('.onlineNickname')) {
          const nickname = e.target.closest('.onlineNickname');
          const rect = nickname.getBoundingClientRect();
          contextMenuElement.style.top = `${rect.bottom + window.scrollY}px`;
          contextMenuElement.style.left = `${rect.left + window.scrollX}px`;
          contextMenuElement.style.display = 'block';
          contextMenuElement.dataset.player = nickname.textContent.trim();
        } else if (!e.target.closest('.player-context-menu')) {
          contextMenuElement.style.display = 'none';
        }
      });

      contextMenuElement.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const player = contextMenuElement.dataset.player;

        if (action === 'profile') {
          const playerData = {
            nickname: player,
            rank: 'Bronze',
            avatar: '/static/assets/avatars/clown-fish.png',
            stats: { totalGames: 0, winRate: '0%' },
          };
          ProfileModal.show(playerData);
        } else if (action === 'add-friend') {
          ContextMenu.showConfirmation(player);
        }
        contextMenuElement.style.display = 'none';
      });
    }

    static showConfirmation(player) {
      const confirmation = document.createElement('div');
      confirmation.classList.add('confirmation-animation');
      confirmation.innerHTML = `
        <div class="confirmation-icon"></div>
        <div class="confirmation-text">Friend request sent to ${player}</div>
      `;
      document.body.appendChild(confirmation);

      setTimeout(() => confirmation.remove(), 2000);
    }
  }

  // Game Options Management
  class GameOptionsManager {
    static initialize() {
      const handleSelection = (elements, selectedElement) => {
        elements.forEach(el => el.classList.remove('option-selected'));
        selectedElement.classList.add('option-selected');
      };

      DOM.game.options.forEach(option => {
        option.addEventListener('click', () => handleSelection(DOM.game.options, option));
      });

      DOM.game.modeOptions.forEach(option => {
        option.addEventListener('click', () => handleSelection(DOM.game.modeOptions, option));
      });
    }
  }

  // Online Game Modal Management
  class OnlineGameModal {
    static selectedPlayer = null;

    static initialize() {
      if (!DOM.game.playButton) return;

      DOM.game.playButton.addEventListener('click', () => {
        const isOnlineMode = DOM.game.onlineOption?.classList.contains('option-selected');
        if (isOnlineMode) OnlineGameModal.show();
      });

      DOM.onlineGame.closeBtn?.addEventListener('click', OnlineGameModal.hide);
      document.addEventListener('click', (e) => {
        if (e.target === DOM.onlineGame.modal) OnlineGameModal.hide();
      });

      DOM.onlineGame.playersList?.addEventListener('click', (e) => {
        const playerElement = e.target.closest('.online-player');
        if (playerElement) {
          DOM.onlineGame.playersList.querySelectorAll('.online-player').forEach(p => p.classList.remove('selected'));
          playerElement.classList.add('selected');
          OnlineGameModal.selectedPlayer = playerElement.dataset.player;
          DOM.onlineGame.launchBtn.disabled = false;
        }
      });

      DOM.onlineGame.launchBtn?.addEventListener('click', () => {
        if (OnlineGameModal.selectedPlayer) OnlineGameModal.startGame();
      });
    }

    static show() {
      DOM.onlineGame.modal.style.display = 'block';
      OnlineGameModal.generatePlayersList();
    }

    static hide() {
      DOM.onlineGame.modal.style.display = 'none';
      DOM.onlineGame.launchBtn.disabled = true;
    }

    static generatePlayersList() {
      const players = [
        { name: 'Player1', status: PLAYER_STATUSES.ONLINE, avatar: '/static/assets/avatars/buffalo.png' },
        { name: 'Player2', status: PLAYER_STATUSES.IN_GAME, avatar: '/static/assets/avatars/clown-fish.png' },
        { name: 'Player3', status: PLAYER_STATUSES.ONLINE, avatar: '/static/assets/avatars/buffalo.png' },
      ];

      const template = players.map(player => `
        <div class="online-player" data-player="${player.name}">
          <img src="${player.avatar}" alt="avatar" class="player-avatar">
          <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-status">${player.status}</div>
          </div>
        </div>
      `).join('');

      DOM.onlineGame.playersList.innerHTML = template;
    }

    static startGame() {
      console.log(`Starting game with ${OnlineGameModal.selectedPlayer}`);
      DOM.onlineGame.loading.style.display = 'flex';
    }
  }

  // Initialize all components
  TooltipManager.initializeTooltips();
  ProfileModal.initialize();
  ContextMenu.initialize();
  GameOptionsManager.initialize();
  OnlineGameModal.initialize();
}
