function initializeTournamentPage() {
  console.log("fonction initializetournament game appele ...")

  const DEFAULT_AVATAR = "/static/assets/icons/pending.svg";

  // État global du tournoi
  const tournamentState = {
    players: [],
    matches: [],
    currentMatch: 0,
    isStarted: false,
    currentRound: 1,
    matchResults: {},
  };

  class TournamentGameManager {
    constructor(tournamentState) {
      this.tournamentState = tournamentState;
      this.currentGameScores = {
        player1: 0,
        player2: 0,
      };
      this.setupGameContainer();
    }

    setupGameContainer() {
      const oldContainer = document.getElementById("gameContainer");
      if (oldContainer) {
        oldContainer.remove();
      }

      this.gameContainer = document.createElement("iframe");
      this.gameContainer.id = "gameContainer";
      this.gameContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        display: none;
        z-index: 2000;
        background: black;
      `;

      document.body.appendChild(this.gameContainer);

      // Écoute des messages du jeu
      window.addEventListener("message", (event) => {
        if (event.data.type === "scoreUpdate") {
          // Mise à jour des scores en cours de partie
          this.currentGameScores = {
            player1: event.data.data.player1Score,
            player2: event.data.data.player2Score,
          };
        } else if (event.data.type === "gameComplete") {
          console.log("Game completed with data:", event.data.data);
          this.endGame();
          progressTournament(event.data.data.winner, event.data.data.finalScores);
        }
      });
    }

    startGame() {
      // Reset scores for new game
      this.currentGameScores = {
        player1: 0,
        player2: 0,
      };

      const currentMatch =
        this.tournamentState.matches[this.tournamentState.currentMatch];
      console.log("Starting game for match:", this.tournamentState.currentMatch);
      console.log("Current match data:", currentMatch);

      if (
        !currentMatch ||
        this.tournamentState.currentMatch >= this.tournamentState.matches.length
      ) {
        console.log("No more matches to play");
        return;
      }

      this.gameContainer.style.display = "block";
      this.gameContainer.src = "/game/three.html";

      this.gameContainer.onload = () => {
        console.log(
          "Game loaded, sending players:",
          currentMatch.player1,
          currentMatch.player2
        );
        this.gameContainer.contentWindow.postMessage(
          {
            type: "startGame",
            data: {
              player1: currentMatch.player1,
              player2: currentMatch.player2,
            },
          },
          "*"
        );
        this.gameContainer.focus();
      };
    }

    endGame() {
      this.gameContainer.style.display = "none";
      this.gameContainer.src = "about:blank";
      this.gameContainer.blur();

      if (window.gameCleanup) {
        window.gameCleanup();
      }
    }
  }

  // Ajout d'une fonction pour réinitialiser tous les champs au démarrage
  function initializeTournamentDisplay() {
    const activeShape = document.querySelector(".shape.active");
    const matches = activeShape.querySelectorAll(".doubleMatch");

    matches.forEach((matchElement) => {
      const players = matchElement.querySelectorAll(".player");
      players.forEach((player) => {
        const nickname = player.querySelector(".nickname");
        const avatar = player.querySelector(".logo");
        nickname.textContent = "";
        avatar.src = DEFAULT_AVATAR;
      });

      const scores = matchElement.querySelectorAll(".score");
      scores.forEach((score) => {
        score.textContent = "0";
      });
    });
  }

  // Sélecteurs
  const optionButtons = document.querySelectorAll(".option-btn");
  const shapes = document.querySelectorAll(".shape");
  const playButton = document.querySelector(".buttonPlay");
  const tournamentConfig = document.getElementById("tournamentConfig");
  let gameManager;

  function updateCurrentMatchIndicators() {
    // D'abord, retirer tous les indicateurs actifs
    document.querySelectorAll(".doubleMatchNumber").forEach((number) => {
      number.classList.remove("active");
    });

    if (!tournamentState.isStarted) return;

    const playerCount = getSelectedPlayerCount();
    const activeShape = document.querySelector(".shape.active");

    // Sélectionner le numéro de match actuel
    const matchNumber = tournamentState.currentMatch + 1;

    // Trouver le bon sélecteur en fonction de la section de tournoi
    let selector;
    if (playerCount === 4) {
      if (matchNumber <= 2) {
        selector = `.tournamentSection2 .doubleMatch:nth-child(${matchNumber})`;
      } else if (matchNumber === 3) {
        selector = `.tournamentSection3 .doubleMatch`;
      } else if (matchNumber === 4) {
        selector = `.tournamentSection4 .doubleMatch`;
      }
    } else {
      // Pour 8 joueurs...
      if (matchNumber <= 4) {
        selector = `.tournamentSection1 .doubleMatch:nth-child(${matchNumber})`;
      } else if (matchNumber <= 6) {
        selector = `.tournamentSection2 .doubleMatch:nth-child(${
          matchNumber - 4
        })`;
      } else if (matchNumber === 7) {
        selector = `.tournamentSection3 .doubleMatch`;
      } else if (matchNumber === 8) {
        selector = `.tournamentSection4 .doubleMatch`;
      }
    }

    // Ajouter la classe active au numéro de match correspondant
    if (selector) {
      const matchElement = activeShape.querySelector(
        `${selector} .doubleMatchNumber`
      );
      if (matchElement) {
        matchElement.classList.add("active");
      }
    }
  }

  function showShape(shapeId) {
    shapes.forEach((shape) => shape.classList.remove("active"));
    const activeShape = document.getElementById(shapeId);
    if (activeShape) {
      activeShape.classList.add("active");
    }

    if (!tournamentState.isStarted) {
      updateCurrentMatchIndicators();
    }
  }

  function handleOptionChange(value) {
    optionButtons.forEach((btn) => btn.classList.remove("active"));
    document.getElementById(value).classList.add("active");
    showShape(value + "display");
  }

  function getSelectedPlayerCount() {
    const activeButton = document.querySelector(".option-btn.active");
    return parseInt(activeButton.id);
  }

  function openTournamentConfig(playerCount) {
    tournamentConfig.style.display = "block";
    generatePlayerFields(playerCount);
  }

  function closeTournamentConfig() {
    tournamentConfig.style.display = "none";
  }

  function generatePlayerFields(count) {
    const container = document.getElementById("players-container");
    container.innerHTML = "";

    const avatars = [
      "bullfinch.png",
      "clown-fish.png",
      "hedgehog.png",
      "ladybug.png",
      "mouse.png",
      "parrot.png",
      "penguin.png",
      "pig.png",
    ];

    container.innerHTML += `
      <div class="player-entry">
        <img class="player-avatar" src="/static/assets/avatars/buffalo.png" />
        <input type="text" class="player-input" value="YourNickname" />
      </div>
    `;

    for (let i = 1; i < count; i++) {
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      container.innerHTML += `
        <div class="player-entry">
          <img class="player-avatar" src="/static/assets/avatars/${randomAvatar}" />
          <input type="text" class="player-input" value="Bot Player ${i}" />
          <button class="add-friend-btn">
            <img src="/static/assets/icons/add_friend.svg" style="filter: none;" />
          </button>
        </div>
      `;
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function generateMatches() {
    const playerCount = getSelectedPlayerCount();
    const shuffledPlayers = shuffleArray([...tournamentState.players]);
    tournamentState.matches = [];

    if (playerCount === 4) {
      // Premier tour (2 matches)
      tournamentState.matches = [
        {
          matchId: 0,
          round: 1,
          player1: shuffledPlayers[0],
          player2: shuffledPlayers[1],
          score1: 0,
          score2: 0,
          winner: null,
        },
        {
          matchId: 1,
          round: 1,
          player1: shuffledPlayers[2],
          player2: shuffledPlayers[3],
          score1: 0,
          score2: 0,
          winner: null,
        },
        {
          matchId: 2,
          round: 2,
          player1: null,
          player2: null,
          score1: 0,
          score2: 0,
          winner: null,
        },
      ];
    } else if (playerCount === 8) {
      // Premier tour (4 matches)
      for (let i = 0; i < 4; i++) {
        tournamentState.matches.push({
          matchId: i,
          round: 1,
          player1: shuffledPlayers[i * 2],
          player2: shuffledPlayers[i * 2 + 1],
          score1: 0,
          score2: 0,
          winner: null,
        });
      }

      // Demi-finales (2 matches)
      for (let i = 0; i < 2; i++) {
        tournamentState.matches.push({
          matchId: i + 4,
          round: 2,
          player1: null,
          player2: null,
          score1: 0,
          score2: 0,
          winner: null,
        });
      }

      // Finale
      tournamentState.matches.push({
        matchId: 6,
        round: 3,
        player1: null,
        player2: null,
        score1: 0,
        score2: 0,
        winner: null,
      });
    }
  }

  function updateBracketDisplay() {
    const activeShape = document.querySelector(".shape.active");
    const matches = activeShape.querySelectorAll(".doubleMatch");
    const playerCount = getSelectedPlayerCount();

    matches.forEach((matchElement, index) => {
      const match = tournamentState.matches[index];
      if (!match) return;

      // Mise à jour des joueurs
      const players = matchElement.querySelectorAll(".player");
      const scores = matchElement.querySelectorAll(".score");

      players.forEach((playerElement, playerIndex) => {
        const nickname = playerElement.querySelector(".nickname");
        const avatar = playerElement.querySelector(".logo");

        // Si c'est la case finale
        if (index === (playerCount === 4 ? 3 : 7)) {
          const finalWinner =
            tournamentState.matches[playerCount === 4 ? 2 : 6]?.winner;
          if (finalWinner) {
            nickname.textContent = finalWinner.name;
            avatar.src = finalWinner.avatar;
            playerElement.classList.add("winner");
            scores[0]?.classList.add("winner");
          } else {
            nickname.textContent = "";
            avatar.src = DEFAULT_AVATAR;
            playerElement.classList.remove("winner");
            scores[0]?.classList.remove("winner");
          }
          return;
        }

        // Pour tous les autres matches
        const currentPlayer = playerIndex === 0 ? match.player1 : match.player2;
        if (currentPlayer) {
          nickname.textContent = currentPlayer.name;
          avatar.src = currentPlayer.avatar;

          // Vérifier si ce joueur est le gagnant du match
          if (match.winner && match.winner.name === currentPlayer.name) {
            playerElement.classList.add("winner");
            scores[playerIndex]?.classList.add("winner");
          } else {
            playerElement.classList.remove("winner");
            scores[playerIndex]?.classList.remove("winner");
          }
        } else {
          nickname.textContent = "";
          avatar.src = DEFAULT_AVATAR;
          playerElement.classList.remove("winner");
          scores[playerIndex]?.classList.remove("winner");
        }
      });

      // Mise à jour des scores
      if (match.winner) {
        const winnerIndex =
          match.player1 && match.winner.name === match.player1.name ? 0 : 1;
        scores.forEach((scoreElement, scoreIndex) => {
          scoreElement.textContent =
            scoreIndex === 0 ? match.score1 : match.score2;
        });
      }
    });

    updateCurrentMatchIndicators();
  }

  // Ajout d'un écouteur pour la réinitialisation lors du changement de nombre de joueurs
  function handleOptionChange(value) {
    optionButtons.forEach((btn) => btn.classList.remove("active"));
    document.getElementById(value).classList.add("active");
    showShape(value + "display");

    // Réinitialiser l'affichage si le tournoi n'est pas commencé
    if (!tournamentState.isStarted) {
      initializeTournamentDisplay();
    }
  }

  function progressTournament(winnerIndex, finalScores) {
    const currentMatch = tournamentState.matches[tournamentState.currentMatch];
    const winner =
      winnerIndex === 0 ? currentMatch.player1 : currentMatch.player2;
    const playerCount = getSelectedPlayerCount();

    // Déterminer si c'est le dernier match
    const isLastMatch =
      (playerCount === 4 && tournamentState.currentMatch === 2) ||
      (playerCount === 8 && tournamentState.currentMatch === 6);

    // Set the actual scores from the game
    currentMatch.score1 = finalScores.player1;
    currentMatch.score2 = finalScores.player2;
    currentMatch.winner = winner;
    tournamentState.matchResults[tournamentState.currentMatch] = {
      winner: winner,
      scores: finalScores,
    };

    if (playerCount === 4) {
      if (tournamentState.currentMatch < 2) {
        // Premier tour (matchs 0 et 1)
        if (tournamentState.currentMatch === 0) {
          tournamentState.matches[2].player1 = winner;
        } else {
          tournamentState.matches[2].player2 = winner;
        }
      } else if (tournamentState.currentMatch === 2) {
        // Finale
        const finalMatch = tournamentState.matches[2];
        finalMatch.winner = winner;

        // Créer le match virtuel pour l'affichage final
        tournamentState.matches[3] = {
          matchId: 3,
          round: 3,
          player1: winner,
          player2: null,
          score1: finalScores.player1,
          score2: finalScores.player2,
          winner: winner,
        };
      }
    } else if (playerCount === 8) {
      if (tournamentState.currentMatch < 4) {
        // Premier tour (matchs 0 à 3)
        const nextRoundMatchIndex =
          4 + Math.floor(tournamentState.currentMatch / 2);
        if (tournamentState.currentMatch % 2 === 0) {
          tournamentState.matches[nextRoundMatchIndex].player1 = winner;
        } else {
          tournamentState.matches[nextRoundMatchIndex].player2 = winner;
        }
      } else if (tournamentState.currentMatch < 6) {
        // Demi-finales (matchs 4 et 5)
        if (tournamentState.currentMatch === 4) {
          tournamentState.matches[6].player1 = winner;
        } else {
          tournamentState.matches[6].player2 = winner;
        }
      } else if (tournamentState.currentMatch === 6) {
        // Finale
        const finalMatch = tournamentState.matches[6];
        finalMatch.winner = winner;

        // Créer le match virtuel pour l'affichage final
        tournamentState.matches[7] = {
          matchId: 7,
          round: 4,
          player1: winner,
          player2: null,
          score1: finalScores.player1,
          score2: finalScores.player2,
          winner: winner,
        };
      }
    }

    // Montrer l'animation appropriée et mettre à jour l'affichage
    if (isLastMatch) {
      showTournamentWinner(winner, finalScores);
      setTimeout(() => {
        tournamentState.currentMatch++;
        updateBracketDisplay();
        updateCurrentMatchIndicators();
        updatePlayButton();
        setTimeout(highlightFinalWinner, 1000);
      }, 500);
    } else {
      showMatchVictory(winner, finalScores.player1, finalScores.player2);
      setTimeout(() => {
        tournamentState.currentMatch++;
        updateBracketDisplay();
        updateCurrentMatchIndicators();
        updatePlayButton();
      }, 500);
    }
  }

  function updatePlayButton() {
    const playerCount = getSelectedPlayerCount();
    const lastMatchIndex = playerCount === 4 ? 3 : 7;
    const isLastMatch = tournamentState.currentMatch >= lastMatchIndex;
    const nextMatch = tournamentState.matches[tournamentState.currentMatch];
    const playButton = document.querySelector(".buttonPlay");

    if (isLastMatch) {
      playButton.innerHTML = `
        <span class="button-text">Tournament Complete!</span>
      `;
      playButton.classList.add("tournament-complete");
      playButton.disabled = true;

      // Ajouter les effets spéciaux au vainqueur final
      highlightFinalWinner();
      return;
    }

    if (!nextMatch || !nextMatch.player1 || !nextMatch.player2) {
      playButton.innerHTML = `
        <img class="playIcon" src="/static/assets/icons/play.svg" />
        <span class="button-text">Waiting for next matches</span>
      `;
      playButton.disabled = true;
      return;
    }

    let matchText = "LAUNCH MATCH";
    if (tournamentState.currentMatch === lastMatchIndex - 1) {
      matchText = "LAUNCH FINAL";
    } else if (playerCount === 8 && tournamentState.currentMatch >= 4) {
      matchText = "LAUNCH SEMI-FINAL";
    }

    playButton.innerHTML = `
      <img class="playIcon" src="/static/assets/icons/play.svg" />
      <span class="button-text">${matchText}</span>
    `;
    playButton.disabled = false;
  }

  // Nouvelle fonction pour mettre en évidence le vainqueur final
  function highlightFinalWinner() {
    const playerCount = getSelectedPlayerCount();
    const finalMatchIndex = playerCount === 4 ? 3 : 7;
    const activeShape = document.querySelector(".shape.active");

    // Trouver le dernier match
    const finalMatch = activeShape.querySelector(
      `.tournamentSection${playerCount === 4 ? "4" : "4"} .doubleMatch`
    );

    if (finalMatch) {
      // Mettre en évidence le numéro
      const matchNumber = finalMatch.querySelector(".doubleMatchNumber");
      if (matchNumber) {
        matchNumber.classList.remove("active");
        matchNumber.classList.add("winner-number");
      }

      // Mettre en évidence le joueur
      const playerElement = finalMatch.querySelector(".player");
      if (playerElement) {
        playerElement.classList.remove("winner");
        playerElement.classList.add("winner-final");
      }
    }
  }

  function startTournament() {
    const playerInputs = document.querySelectorAll(".player-entry .player-input");
    const playerAvatars = document.querySelectorAll(
      ".player-entry .player-avatar"
    );

    // Réinitialiser d'abord tout l'affichage
    initializeTournamentDisplay();

    tournamentState.players = Array.from(playerInputs).map((input, i) => ({
      name: input.value,
      avatar: playerAvatars[i].src,
    }));

    generateMatches();
    updateBracketDisplay();

    tournamentConfig.style.display = "none";
    document.querySelector(".chipSelectorPlayer").style.display = "none";

    document.querySelector(".buttonPlay").innerHTML = `
      <img class="playIcon" src="/static/assets/icons/play.svg" />
      <span class="button-text">LAUNCH NEXT MATCH</span>
    `;
    document.querySelector(".reset-btn").style.display = "block";

    tournamentState.isStarted = true;
    tournamentState.currentMatch = 0;
    tournamentState.currentRound = 1;

    updateCurrentMatchIndicators();
    updatePlayButton();
  }

  // Event Listeners
  document.addEventListener("DOMContentLoaded", () => {
    gameManager = new TournamentGameManager(tournamentState);

    const playButton = document.querySelector(".buttonPlay");
    if (playButton) {
      playButton.addEventListener("click", () => {
        if (!tournamentState.isStarted) {
          const playerCount = getSelectedPlayerCount();
          openTournamentConfig(playerCount);
        } else {
          gameManager.startGame();
        }
      });
    }

    const startButton = document.querySelector(".start-tournament-btn");
    if (startButton) {
      startButton.addEventListener("click", startTournament);
    }

    const resetButton = document.querySelector(".reset-btn");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        location.reload();
      });
    }

    const closeButton = document.querySelector(".close-icon");
    if (closeButton) {
      closeButton.addEventListener("click", closeTournamentConfig);
    }

    optionButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        handleOptionChange(event.target.id);
      });
    });
  });

  handleOptionChange("4");

  window.dispatchGameEnd = function (winner) {
    const event = new CustomEvent("gameEnd", {
      detail: { winner: winner },
    });
    window.dispatchEvent(event);
  };

  function showVictoryScreen(winner, score1, score2) {
    const overlay = document.querySelector(".victory-overlay");
    const winnerNameElement = overlay.querySelector(".winner-name");
    const scoreElement = overlay.querySelector(".victory-score");
    const continueBtn = overlay.querySelector(".continue-btn");

    winnerNameElement.textContent = winner.name;
    scoreElement.innerHTML = `<span>${score1}</span> - <span>${score2}</span>`;

    overlay.classList.add("show");

    // Gérer le bouton continue
    const handleContinue = () => {
      overlay.classList.remove("show");
      continueBtn.removeEventListener("click", handleContinue);
    };

    continueBtn.addEventListener("click", handleContinue);
  }

  function createConfetti() {
    const colors = [
      "var(--liquid-lava)", // Orange principal
      "var(--dusty-grey)", // Gris clair
      "var(--slate-grey)", // Gris foncé
      "var(--gluon-grey)", // Gris très foncé
    ];

    const confettiCount = 50; // Réduit le nombre pour de meilleures performances
    const container = document.querySelector(".tournament-winner-overlay");

    // Créer un groupe de confettis avec des délais différents
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";

      // Position horizontale aléatoire
      confetti.style.left = `${Math.random() * 100}vw`;

      // Position verticale initiale légèrement au-dessus de l'écran
      confetti.style.top = `-${Math.random() * 20}px`;

      // Propriétés aléatoires pour plus de variété
      const size = 5 + Math.random() * 7; // Taille réduite pour plus de légèreté
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;

      // Rotation et animation personnalisées
      const rotation = Math.random() * 360;
      const animationDuration = 3 + Math.random() * 2; // Entre 3 et 5 secondes
      const animationDelay = Math.random() * 2; // Délai entre 0 et 2 secondes

      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "3px";
      confetti.style.transform = `rotate(${rotation}deg)`;
      confetti.style.animation = `confettiFall ${animationDuration}s linear ${animationDelay}s infinite`;

      container.appendChild(confetti);

      // Supprimer le confetti après quelques animations pour éviter l'accumulation
      setTimeout(() => {
        confetti.remove();
      }, 15000); // Suppression après 15 secondes
    }
  }

  function showMatchVictory(winner, score1, score2) {
    const overlay = document.querySelector(".victory-overlay");
    const winnerNameElement = overlay.querySelector(".winner-name");
    const scoreElement = overlay.querySelector(".victory-score");
    const continueBtn = overlay.querySelector(".continue-btn");

    winnerNameElement.textContent = winner.name;
    scoreElement.innerHTML = `WON THE GAME`; // Texte modifié ici

    overlay.classList.add("show");

    const handleContinue = () => {
      overlay.classList.remove("show");
      continueBtn.removeEventListener("click", handleContinue);
    };

    continueBtn.addEventListener("click", handleContinue);
  }

  function showTournamentWinner(winner, finalScores) {
    const overlay = document.querySelector(".tournament-winner-overlay");
    const winnerNameElement = overlay.querySelector(".winner-name");
    const titleElement = overlay.querySelector(".winner-title"); // Pour le "TOURNAMENT CHAMPION"
    const scoreElement = overlay.querySelector(".final-score");
    const continueBtn = overlay.querySelector(".continue-btn");

    // Nettoyer les confettis existants
    overlay.querySelectorAll(".confetti").forEach((c) => c.remove());

    titleElement.textContent = "TOURNAMENT CHAMPION";
    winnerNameElement.textContent = winner.name;

    // On cache ou on enlève le score element qui n'est plus nécessaire
    if (scoreElement) {
      scoreElement.style.display = "none";
    }

    overlay.classList.add("show");

    // Créer les confettis initiaux
    createConfetti();

    // Créer de nouveaux confettis toutes les 2 secondes
    const confettiInterval = setInterval(() => {
      if (overlay.classList.contains("show")) {
        createConfetti();
      }
    }, 2000);

    const handleContinue = () => {
      overlay.classList.remove("show");
      clearInterval(confettiInterval);
      overlay.querySelectorAll(".confetti").forEach((c) => c.remove());
      continueBtn.removeEventListener("click", handleContinue);
    };

    continueBtn.addEventListener("click", handleContinue);
  }

}
// function initializeTournamentPage() {
//   console.log("Initialisation de la page de tournoi...");

//   const optionButtons = document.querySelectorAll(".option-btn");
//   const playButton = document.querySelector(".buttonPlay");
//   const tournamentConfig = document.getElementById("tournamentConfig");
//   const shapes = document.querySelectorAll(".shape");

//   // État global du tournoi
//   const tournamentState = {
//     players: [],
//     matches: [],
//     currentMatch: 0,
//     isStarted: false,
//   };

//   let gameManager;

//   class TournamentGameManager {
//     constructor(state) {
//       this.state = state;
//       this.setupGameContainer();
//     }

//     setupGameContainer() {
//       this.gameContainer = document.createElement("iframe");
//       this.gameContainer.id = "gameContainer";
//       this.gameContainer.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         border: none;
//         display: none;
//         z-index: 2000;
//         background: black;
//       `;
//       document.body.appendChild(this.gameContainer);

//       window.addEventListener("message", (event) => {
//         if (event.data.type === "gameComplete") {
//           this.endGame();
//           const winnerIndex = event.data.data.winnerIndex;
//           progressTournament(winnerIndex, event.data.data.scores);
//         }
//       });
//     }

//     startGame() {
//       const currentMatch = this.state.matches[this.state.currentMatch];
//       if (
//         !currentMatch ||
//         this.state.currentMatch >= this.state.matches.length
//       ) {
//         console.log("Pas de match à jouer");
//         return;
//       }

//       this.gameContainer.style.display = "block";
//       this.gameContainer.src = "/game/three.html";

//       this.gameContainer.onload = () => {
//         this.gameContainer.contentWindow.postMessage(
//           {
//             type: "startGame",
//             data: {
//               player1: currentMatch.player1,
//               player2: currentMatch.player2,
//             },
//           },
//           "*"
//         );
//       };
//     }

//     endGame() {
//       this.gameContainer.style.display = "none";
//       this.gameContainer.src = "about:blank";
//     }
//   }

//   function handleOptionChange(value) {
//     optionButtons.forEach((btn) => btn.classList.remove("active"));
//     document.getElementById(value).classList.add("active");

//     shapes.forEach((shape) => shape.classList.remove("active"));
//     document.getElementById(`${value}display`).classList.add("active");

//     tournamentState.players = [];
//     tournamentState.matches = [];
//     tournamentState.currentMatch = 0;
//     tournamentState.isStarted = false;
//   }

//   function startTournament() {
//     const playerInputs = document.querySelectorAll(
//       ".player-entry .player-input"
//     );
//     const playerAvatars = document.querySelectorAll(
//       ".player-entry .player-avatar"
//     );

//     tournamentState.players = Array.from(playerInputs).map((input, i) => ({
//       name: input.value,
//       avatar: playerAvatars[i].src,
//     }));

//     generateMatches();
//     updateBracketDisplay();
//     tournamentState.isStarted = true;
//     playButton.innerHTML = "LAUNCH NEXT MATCH";
//   }

//   function generateMatches() {
//     const players = tournamentState.players;
//     const matches = [];
//     for (let i = 0; i < players.length; i += 2) {
//       matches.push({
//         player1: players[i],
//         player2: players[i + 1] || null,
//         winner: null,
//       });
//     }
//     tournamentState.matches = matches;
//     console.log("Matches générés :", matches);
//   }

//   function updateBracketDisplay() {
//     const activeShape = document.querySelector(".shape.active");
//     const matches = activeShape.querySelectorAll(".doubleMatch");

//     matches.forEach((matchElement, index) => {
//       const match = tournamentState.matches[index];
//       if (!match) return;

//       const players = matchElement.querySelectorAll(".player");
//       const nickname1 = players[0].querySelector(".nickname");
//       const nickname2 = players[1]?.querySelector(".nickname");
//       const avatar1 = players[0].querySelector(".logo");
//       const avatar2 = players[1]?.querySelector(".logo");

//       if (match.player1) {
//         nickname1.textContent = match.player1.name;
//         avatar1.src = match.player1.avatar;
//       }
//       if (match.player2) {
//         nickname2.textContent = match.player2.name;
//         avatar2.src = match.player2.avatar;
//       }
//     });
//   }

//   function progressTournament(winnerIndex, scores) {
//     const currentMatch = tournamentState.matches[tournamentState.currentMatch];
//     const winner =
//       winnerIndex === 0 ? currentMatch.player1 : currentMatch.player2;
//     currentMatch.winner = winner;

//     const scoreElements = document
//       .querySelector(".shape.active")
//       .querySelectorAll(".doubleMatch")
//       [tournamentState.currentMatch].querySelectorAll(".score");

//     scoreElements[0].textContent = scores[0];
//     scoreElements[1].textContent = scores[1];

//     tournamentState.currentMatch++;

//     if (tournamentState.currentMatch >= tournamentState.matches.length) {
//       playButton.innerHTML = "Tournament Complete!";
//       playButton.disabled = true;
//     } else {
//       playButton.innerHTML = "LAUNCH NEXT MATCH";
//     }
//   }

//   playButton.addEventListener("click", () => {
//     if (!tournamentState.isStarted) {
//       tournamentConfig.style.display = "block";
//     } else {
//       gameManager.startGame();
//     }
//   });

//   document
//     .querySelector(".start-tournament-btn")
//     .addEventListener("click", () => {
//       startTournament();
//       tournamentConfig.style.display = "none";
//     });

//   optionButtons.forEach((button) => {
//     button.addEventListener("click", (event) => {
//       handleOptionChange(event.target.id);
//     });
//   });

//   handleOptionChange("4");

//   gameManager = new TournamentGameManager(tournamentState);
// }

// // Initialiser la page du tournoi après chargement du DOM
// document.addEventListener("DOMContentLoaded", () => {
//   initializeTournamentPage();
//   console.log("La page du tournoi est initialisée.");
// });
