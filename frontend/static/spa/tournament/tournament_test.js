// document.addEventListener("DOMContentLoaded", () => {
//     const DEFAULT_AVATAR = "/static/assets/icons/pending.svg";
//     const tournamentState = {
//       players: [],
//       matches: [],
//       currentMatch: 0,
//       isStarted: false,
//       currentRound: 1,
//       matchResults: {},
//     };
  
//     // Configuration des boutons et des sections de tournoi
//     const optionButtons = document.querySelectorAll(".option-btn");
//     const shapes = document.querySelectorAll(".shape");
//     const playButton = document.querySelector(".buttonPlay");
//     const tournamentConfig = document.getElementById("tournamentConfig");
  
//     // Création du gestionnaire de jeu
//     let gameManager;
  
//     class TournamentGameManager {
//       constructor(tournamentState) {
//         this.tournamentState = tournamentState;
//         this.currentGameScores = { player1: 0, player2: 0 };
//         this.setupGameContainer();
//       }
  
//       setupGameContainer() {
//         const oldContainer = document.getElementById("gameContainer");
//         if (oldContainer) oldContainer.remove();
  
//         this.gameContainer = document.createElement("iframe");
//         this.gameContainer.id = "gameContainer";
//         this.gameContainer.style.cssText = `
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           border: none;
//           display: none;
//           z-index: 2000;
//           background: black;
//         `;
//         document.body.appendChild(this.gameContainer);
  
//         // Écoute les messages de fin de jeu
//         window.addEventListener("message", (event) => {
//           if (event.data.type === "gameComplete") {
//             this.endGame();
//             progressTournament(event.data.data.winner, event.data.data.finalScores);
//           }
//         });
//       }
  
//       startGame() {
//         this.currentGameScores = { player1: 0, player2: 0 };
//         const currentMatch = this.tournamentState.matches[this.tournamentState.currentMatch];
//         if (!currentMatch || this.tournamentState.currentMatch >= this.tournamentState.matches.length) return;
  
//         this.gameContainer.style.display = "block";
//         this.gameContainer.src = "/game/three.html";
  
//         this.gameContainer.onload = () => {
//           this.gameContainer.contentWindow.postMessage({
//             type: "startGame",
//             data: { player1: currentMatch.player1, player2: currentMatch.player2 },
//           }, "*");
//           this.gameContainer.focus();
//         };
//       }
  
//       endGame() {
//         this.gameContainer.style.display = "none";
//         this.gameContainer.src = "about:blank";
//       }
//     }
  
//     // Affichage initial du tournoi
//     function initializeTournamentDisplay() {
//       const matches = document.querySelector(".shape.active").querySelectorAll(".doubleMatch");
//       matches.forEach((matchElement) => {
//         const players = matchElement.querySelectorAll(".player");
//         players.forEach((player) => {
//           player.querySelector(".nickname").textContent = "";
//           player.querySelector(".logo").src = DEFAULT_AVATAR;
//         });
//         matchElement.querySelectorAll(".score").forEach(score => score.textContent = "0");
//       });
//     }
  
//     function getSelectedPlayerCount() {
//       return parseInt(document.querySelector(".option-btn.active").id);
//     }
  
//     function openTournamentConfig(playerCount) {
//       tournamentConfig.style.display = "block";
//       generatePlayerFields(playerCount);
//     }
  
//     function closeTournamentConfig() {
//       tournamentConfig.style.display = "none";
//     }
  
//     function generatePlayerFields(count) {
//       const container = document.getElementById("players-container");
//       const avatars = ["bullfinch.png", "clown-fish.png", "hedgehog.png", "ladybug.png", "mouse.png", "parrot.png", "penguin.png", "pig.png"];
//       container.innerHTML = `
//         <div class="player-entry">
//           <img class="player-avatar" src="/static/assets/avatars/buffalo.png" />
//           <input type="text" class="player-input" value="YourNickname" />
//         </div>
//       `;
//       for (let i = 1; i < count; i++) {
//         const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
//         container.innerHTML += `
//           <div class="player-entry">
//             <img class="player-avatar" src="/static/assets/avatars/${randomAvatar}" />
//             <input type="text" class="player-input" value="Bot Player ${i}" />
//             <button class="add-friend-btn">
//               <img src="/static/assets/icons/add_friend.svg" style="filter: none;" />
//             </button>
//           </div>
//         `;
//       }
//     }
  
//     function shuffleArray(array) {
//       for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//       }
//       return array;
//     }
  
//     function generateMatches() {
//       const playerCount = getSelectedPlayerCount();
//       const shuffledPlayers = shuffleArray([...tournamentState.players]);
//       tournamentState.matches = [];
  
//       if (playerCount === 4) {
//         tournamentState.matches = [
//           { matchId: 0, round: 1, player1: shuffledPlayers[0], player2: shuffledPlayers[1], score1: 0, score2: 0, winner: null },
//           { matchId: 1, round: 1, player1: shuffledPlayers[2], player2: shuffledPlayers[3], score1: 0, score2: 0, winner: null },
//           { matchId: 2, round: 2, player1: null, player2: null, score1: 0, score2: 0, winner: null },
//         ];
//       } else if (playerCount === 8) {
//         for (let i = 0; i < 4; i++) {
//           tournamentState.matches.push({
//             matchId: i,
//             round: 1,
//             player1: shuffledPlayers[i * 2],
//             player2: shuffledPlayers[i * 2 + 1],
//             score1: 0,
//             score2: 0,
//             winner: null,
//           });
//         }
//         for (let i = 0; i < 2; i++) {
//           tournamentState.matches.push({
//             matchId: i + 4,
//             round: 2,
//             player1: null,
//             player2: null,
//             score1: 0,
//             score2: 0,
//             winner: null,
//           });
//         }
//         tournamentState.matches.push({
//           matchId: 6,
//           round: 3,
//           player1: null,
//           player2: null,
//           score1: 0,
//           score2: 0,
//           winner: null,
//         });
//       }
//     }
  
//     function updateBracketDisplay() {
//       const activeShape = document.querySelector(".shape.active");
//       const matches = activeShape.querySelectorAll(".doubleMatch");
//       matches.forEach((matchElement, index) => {
//         const match = tournamentState.matches[index];
//         if (!match) return;
//         const players = matchElement.querySelectorAll(".player");
//         players[0].querySelector(".nickname").textContent = match.player1?.name || "";
//         players[1].querySelector(".nickname").textContent = match.player2?.name || "";
//         players[0].querySelector(".logo").src = match.player1?.avatar || DEFAULT_AVATAR;
//         players[1].querySelector(".logo").src = match.player2?.avatar || DEFAULT_AVATAR;
//       });
//     }
  
//     function progressTournament(winnerIndex, finalScores) {
//       const currentMatch = tournamentState.matches[tournamentState.currentMatch];
//       const winner = winnerIndex === 0 ? currentMatch.player1 : currentMatch.player2;
//       tournamentState.matchResults[tournamentState.currentMatch] = {
//         winner,
//         scores: finalScores,
//       };
//       tournamentState.currentMatch++;
//       updateBracketDisplay();
//     }
  
//     function updatePlayButton() {
//       playButton.disabled = tournamentState.currentMatch >= tournamentState.matches.length;
//     }
  
//     function startTournament() {
//       const playerInputs = document.querySelectorAll(".player-entry .player-input");
//       const playerAvatars = document.querySelectorAll(".player-entry .player-avatar");
//       tournamentState.players = Array.from(playerInputs).map((input, i) => ({
//         name: input.value,
//         avatar: playerAvatars[i].src,
//       }));
//       generateMatches();
//       updateBracketDisplay();
//       initializeTournamentDisplay();
//       tournamentConfig.style.display = "none";
//       tournamentState.isStarted = true;
//       updatePlayButton();
//     }
  
//     playButton.addEventListener("click", () => {
//       if (!tournamentState.isStarted) {
//         openTournamentConfig(getSelectedPlayerCount());
//       } else {
//         gameManager.startGame();
//       }
//     });
  
//     const startButton = document.querySelector(".start-tournament-btn");
//     startButton.addEventListener("click", startTournament);
  
//     const closeButton = document.querySelector(".close-icon");
//     closeButton.addEventListener("click", closeTournamentConfig);
  
//     optionButtons.forEach((button) => {
//       button.addEventListener("click", (event) => {
//         optionButtons.forEach((btn) => btn.classList.remove("active"));
//         event.target.classList.add("active");
//       });
//     });
  
//     gameManager = new TournamentGameManager(tournamentState);
//   });
  