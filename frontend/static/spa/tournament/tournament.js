function ensureHumanFirst(player1, player2, gameManager) {
  // Vérification si un ou les deux joueurs sont indéfinis
  if (!player1 || !player2) {
    // Si un joueur est manquant, on retourne les joueurs existants
    return [player1, player2];
  }

  // Vérifier si chaque joueur est un bot ou un humain
  const player1IsBot = gameManager.isBot(player1);
  const player2IsBot = gameManager.isBot(player2);

  // Si les deux joueurs sont humains, ne rien changer
  if (!player1IsBot && !player2IsBot) {
    return [player1, player2];
  }

  // Si player1 est un bot et player2 est humain, on swap pour placer l'humain en premier
  if (player1IsBot && !player2IsBot) {
    return [player2, player1]; // Retourne l'humain en tant que player1
  }

  // Sinon, ne rien changer (cas où player1 est humain et player2 est un bot, ou les deux sont bots)
  return [player1, player2];
}

function initializeTournamentPage() {
  let translations = {};

  language = getLanguageFromAPI();
  language.then((value) => {
    setPreferredLanguage(value);
  });

  language.then((value) => {
    fetch(`/static/languages/${value}.json`) // Utilisation correcte des backticks
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load translations");
        }
        return response.json();
      })
      .then((data) => {
        translations = data;
      })
      .catch((error) => {});
  });

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
      this.options = null;
      this.getGameOptions();
      this.currentGameScores = {
        player1: 0,
        player2: 0,
      };
      this.setupGameContainer();
    }

    isBot(player) {
      if (!player) {
        return false;
      }

      // Trouver l'index du joueur dans la liste des joueurs
      const index = this.tournamentState.players.findIndex(
        (p) => p.name === player.name
      );

      if (index === -1) {
        return false;
      }

      // Le premier joueur est toujours un humain
      if (index === 0) {
        return false;
      }

      // Vérifier l'état de la case à cocher associée
      const toggle = document.querySelectorAll(".bot-checkbox")[index - 1];
      if (!toggle) {
        return false;
      }

      // Retourner l'état de la case à cocher
      return toggle.checked;
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
            player1: event.data.data.finalScores.player1Score,
            player2: event.data.data.finalScores.player2Score,
          };
        } else if (event.data.type === "gameComplete") {
          const winner = event.data.data.winner;
          const finalScores = event.data.data.finalScores;

          this.endGame();
          progressTournament(winner, finalScores, gameManager);
        }
      });
    }

    //   getGameOptions() {
    //     const options = localStorage.getItem('gameOptions');
    //     if (options) {
    //         return JSON.parse(options); // Désérialiser les options stockées
    //     }
    //     return null; // Si aucune option n'est trouvée
    // }

    getGameOptions() {
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
          // localStorage.setItem('gameOptions', JSON.stringify(data));
        })
        .catch((error) => {

        });
    }

    async startGame() {
      try {
        // Initialisation par défaut
        let languageOption = "en";

        // Attendre la réponse de l'API pour récupérer la langue
        const language = await getLanguageFromAPI();
        setPreferredLanguage(language);
        languageOption = language;

        this.isSimulationInProgress = false;

        // Réinitialiser les scores pour la nouvelle partie
        this.currentGameScores = {
          player1: 0,
          player2: 0,
        };

        const currentMatch =
          this.tournamentState.matches[this.tournamentState.currentMatch];

        if (
          !currentMatch ||
          this.tournamentState.currentMatch >=
            this.tournamentState.matches.length
        ) {
          return;
        }

        // Vérifier si chaque joueur est un bot
        const player1IsBot = this.isBot(currentMatch.player1);
        const player2IsBot = this.isBot(currentMatch.player2);

        // Afficher si les joueurs sont des bots

        // Charger les options de jeu depuis localStorage
        if (!this.options) {
          return;
        }

        // Simulation si les deux joueurs sont des bots
        if (player1IsBot && player2IsBot) {
          this.isSimulationInProgress = true;
          this.blockSpacebar(true); // Bloquer la barre d'espace

          const simulateScores = () => {
            let score1 = 0;
            let score2 = 0;

            while (true) {
              score1 = Math.floor(Math.random() * 6); // Génère un score entre 0 et 5
              score2 = Math.floor(Math.random() * 6);

              if (
                Math.max(score1, score2) === 5 &&
                Math.abs(score1 - score2) >= 2
              ) {
                break;
              }
            }
            return { score1, score2 };
          };

          // Simuler les scores
          const { score1: simulatedScore1, score2: simulatedScore2 } =
            simulateScores();

          const simulatedWinner =
            simulatedScore1 > simulatedScore2
              ? currentMatch.player1
              : currentMatch.player2;

          progressTournament(
            null,
            { player1: simulatedScore1, player2: simulatedScore2 },
            this
          );

          this.isSimulationInProgress = false;
          this.blockSpacebar(false);
          return;
        }

        // Charger le conteneur de jeu uniquement si ce n'est pas une simulation
        this.gameContainer.style.display = "block";
        this.gameContainer.src = "/static/spa/game3D/three.html";

        this.gameContainer.onload = () => {
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

          const options = this.options;
          const isAI = player2IsBot;
          const power = true;

          this.gameContainer.contentWindow.postMessage(
            {
              type: "setOptions",
              data: { options, isAI, power, languageOption },
            },
            "*"
          );

          this.gameContainer.focus();
        };
      } catch (error) {
      }
    }

    // Fonction pour bloquer ou autoriser l'appui sur la barre d'espace
    blockSpacebar(isBlocked) {
      if (isBlocked) {
        // Bloquer l'appui sur la barre d'espace
        window.addEventListener("keydown", this.preventSpacebar, {
          once: true,
        });
      } else {
        // Réactiver l'appui sur la barre d'espace
        window.removeEventListener("keydown", this.preventSpacebar);
      }
    }

    // Fonction qui empêche l'événement d'appuyer sur la barre d'espace
    preventSpacebar(event) {
      if (event.code === "Space") {
        event.preventDefault();
      }
    }

    endGame() {
      this.gameContainer.style.display = "none";
      this.gameContainer.src = "about:blank";
      this.gameContainer.blur();

      if (window.gameCleanup) {
        window.gameCleanup();
      }
    }

    static getOptions() {
      return undefined;
    }
  }

  // const gameManager = new TournamentGameManager(tournamentState);
  const gameManager = new TournamentGameManager(tournamentState);

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
  const playButton = document.getElementById("buttonPlay");
  const tournamentConfig = document.getElementById("tournamentConfig");
  // let gameManager;

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
    if (!activeButton) {
      return 4; // Valeur par défaut en cas d'absence de bouton actif
    }
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
      "abeille.png",
      "buffalo.png",
      "chicken.png",
      "cow.png",
      "crabe.png",
      "frog.png",
      "giraffe.png",
      "gorilla.png",
      "hippopotame.png",
      "lapin.png",
      "lelephant.png",
      "lion.png",
      "mouton.png",
      "owl.png",
      "walrus.png",
      "zebra.png",
    ];
    // Premier joueur (toujours humain)
    container.innerHTML += `
        <div class="player-entry">
            <img class="player-avatar" src="/static/assets/avatars/buffalo.png" />
            <div class="player-controls">
                <input type="text" class="player-input" value="YourNickname" />
            </div>
        </div>
    `;

    // Autres joueurs
    for (let i = 1; i < count; i++) {
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      container.innerHTML += `
            <div class="player-entry">
                <img class="player-avatar" src="/static/assets/avatars/${randomAvatar}" />
                <div class="player-controls">
                    <input 
                        type="text" 
                        class="player-input" 
                        value="Bot Player ${i}" 
                        maxlength="15" 
                        data-translate="tournament.bot.name" 
                        data-translate-params="${i}" 
                    />
                    <div class="bot-toggle">
                        <label class="switch">
                            <input type="checkbox" class="bot-checkbox" checked>
                            <span class="slider round"></span>
                        </label>
                        <span 
                            class="bot-label" 
                            data-translate="tournament.bot.label">
                            Bot
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // Ajouter les event listeners pour les toggles
    const botCheckboxes = document.querySelectorAll(".bot-checkbox");
    botCheckboxes.forEach((checkbox, index) => {
      const input = checkbox
        .closest(".player-entry")
        .querySelector(".player-input");

      // Fonction pour mettre à jour l'état du bot
      const updateBotState = (isBot) => {
        if (isBot) {
          input.classList.add("bot-active");
          input.readOnly = true;

          // Accès direct à la traduction "Bot Player {0}"
          const botName = translations.tournament.bot.name;
          input.value = botName.replace("{0}", index + 1);
        } else {
          input.classList.remove("bot-active");
          input.readOnly = false;

          // Accès direct à la traduction pour "Enter your nickname"
          const placeholder = translations.tournament.input.placeholder;
          input.value = "";
          input.placeholder = placeholder;
        }
      };

      // État initial
      updateBotState(checkbox.checked);

      // Event listener pour le changement
      checkbox.addEventListener("change", (e) => {
        updateBotState(e.target.checked);
      });
    });

    // Configurer les cases à cocher pour les bots
    setupBotCheckboxListeners();

    // Ajouter une validation dynamique pour les saisies
    setupInputValidation();

    // Tronquer les pseudos déjà affichés
    truncateNicknames();
  }

  function setupBotCheckboxListeners() {
    const botCheckboxes = document.querySelectorAll(".bot-checkbox");
    botCheckboxes.forEach((checkbox, index) => {
      const input = checkbox
        .closest(".player-entry")
        .querySelector(".player-input");

      // Fonction pour mettre à jour l'état du bot
      const updateBotState = (isBot) => {
        language.then((value) => {
          fetch(`/static/languages/${value}.json`) // Utilisation correcte des backticks
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to load translations");
              }
              return response.json();
            })
            .then((data) => {
              translations = data;
            })
            .catch((error) => {
            });
        });
        if (isBot) {
          input.classList.add("bot-active");
          input.readOnly = true;

          // Accès direct à la traduction "Bot Player {0}"
          const botName = translations.tournament.bot.name;
          input.value = botName.replace("{0}", index + 1);
        } else {
          input.classList.remove("bot-active");
          input.readOnly = false;

          // Accès direct à la traduction pour "Enter your nickname"
          const placeholder = translations.tournament.input.placeholder;
          input.value = "";
          input.placeholder = placeholder;
        }
      };

      // Initialiser l'état de la case à cocher
      updateBotState(checkbox.checked);

      // Écouteur pour le changement d'état
      checkbox.addEventListener("change", (e) => {
        language.then((value) => {
          fetch(`/static/languages/${value}.json`) // Utilisation correcte des backticks
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to load translations");
              }
              return response.json();
            })
            .then((data) => {
              translations = data;
            })
            .catch((error) => {
            });
        });
        updateBotState(e.target.checked);
      });
    });

    // language = getLanguageFromAPI();
    // language.then((value) => {
    //   setPreferredLanguage(value);
    // });
  }

  function truncateNicknames() {
    const nicknames = document.querySelectorAll(".nickname");
    nicknames.forEach((nickname) => {
      if (nickname.textContent.length > 15) {
        nickname.textContent = nickname.textContent.substring(0, 15) + "...";
      }
    });
  }

  function setupInputValidation() {
    document.addEventListener("input", (e) => {
      if (e.target.classList.contains("player-input")) {
        const input = e.target;
        if (input.value.length > 15) {
          input.value = input.value.substring(0, 15);
        }
      }
    });
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
      const [match1Player1, match1Player2] = ensureHumanFirst(
        shuffledPlayers[0],
        shuffledPlayers[1],
        gameManager
      );
      const [match2Player1, match2Player2] = ensureHumanFirst(
        shuffledPlayers[2],
        shuffledPlayers[3],
        gameManager
      );

      tournamentState.matches = [
        {
          matchId: 0,
          round: 1,
          player1: match1Player1,
          player2: match1Player2,
          score1: 0,
          score2: 0,
          winner: null,
        },
        {
          matchId: 1,
          round: 1,
          player1: match2Player1,
          player2: match2Player2,
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
        const [player1, player2] = ensureHumanFirst(
          shuffledPlayers[i * 2],
          shuffledPlayers[i * 2 + 1],
          gameManager
        );
        tournamentState.matches.push({
          matchId: i,
          round: 1,
          player1,
          player2,
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
      // **1. Gestion spéciale pour l'affichage du vainqueur final**
      const isFinalWinnerDisplay = index === (playerCount === 4 ? 3 : 7); // Dernier élément visuel
      if (isFinalWinnerDisplay) {
        const finalMatchIndex = playerCount === 4 ? 2 : 6; // Match final logique
        const finalMatch = tournamentState.matches[finalMatchIndex];

        const winnerElement = matchElement.querySelector(".player");
        const winnerName = winnerElement.querySelector(".nickname");
        const winnerAvatar = winnerElement.querySelector(".logo");

        if (finalMatch?.winner) {
          // Mettre à jour l'affichage du vainqueur
          winnerName.textContent = finalMatch.winner.name;
          winnerAvatar.src = finalMatch.winner.avatar;
          winnerElement.classList.add("winner-final");
        } else {
          // Réinitialiser si aucun gagnant
          winnerName.textContent = "";
          winnerAvatar.src = DEFAULT_AVATAR;
          winnerElement.classList.remove("winner-final");
        }
        return; // Ne pas traiter cet élément comme un match
      }

      // **2. Traitement des autres matchs**
      const match = tournamentState.matches[index];
      if (!match) return;

      const players = matchElement.querySelectorAll(".player");
      const scores = matchElement.querySelectorAll(".score");

      players.forEach((playerElement, playerIndex) => {
        const nickname = playerElement.querySelector(".nickname");
        const avatar = playerElement.querySelector(".logo");

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
      scores.forEach((scoreElement, scoreIndex) => {
        if (match.player1 && match.player2) {
          scoreElement.textContent =
            scoreIndex === 0 ? match.score1 : match.score2;
        } else {
          scoreElement.textContent = "";
        }
      });
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

  function progressTournament(winnerIndex, finalScores, gameManager) {
    gameManager.blockSpacebar(true);
    if (
      !tournamentState.matches ||
      tournamentState.currentMatch >= tournamentState.matches.length
    ) {
      gameManager.blockSpacebar(false);
      return;
    }

    const currentMatch = tournamentState.matches[tournamentState.currentMatch];
    if (!currentMatch) {
      gameManager.blockSpacebar(false);
      return;
    }

    const playerCount = getSelectedPlayerCount();

    // **1. Déterminer le gagnant**
    if (finalScores.player1 > finalScores.player2) {
      currentMatch.winner = currentMatch.player1;
    } else if (finalScores.player2 > finalScores.player1) {
      currentMatch.winner = currentMatch.player2;
    } else {
      currentMatch.winner =
        Math.random() < 0.5 ? currentMatch.player1 : currentMatch.player2;
    }

    if (!currentMatch.winner) {

      gameManager.blockSpacebar(false);
      return;
    }

    // **2. Mise à jour des scores**
    currentMatch.score1 = finalScores.player1;
    currentMatch.score2 = finalScores.player2;

    // **3. Stocker les résultats**
    tournamentState.matchResults[tournamentState.currentMatch] = {
      winner: currentMatch.winner,
      scores: finalScores,
    };

    // **4. Mise à jour des joueurs pour les prochains matchs**
    if (playerCount === 4) {
      if (
        tournamentState.currentMatch === 0 ||
        tournamentState.currentMatch === 1
      ) {
        const finalMatchIndex = 2; // Match 2 est la finale
        const nextMatch = tournamentState.matches[finalMatchIndex];
        if (!nextMatch) {
          gameManager.blockSpacebar(false); // Réactiver la barre d'espace
          return;
        }

        // Ajout de validation et initialisation des joueurs
        if (!nextMatch.player1) {
          nextMatch.player1 = currentMatch.winner;
        } else {
          nextMatch.player2 = currentMatch.winner;
        }

        const [newPlayer1, newPlayer2] = ensureHumanFirst(
          nextMatch.player1,
          nextMatch.player2,
          gameManager
        );

        nextMatch.player1 = newPlayer1;
        nextMatch.player2 = newPlayer2;
      }
    } else if (playerCount === 8) {
      if (tournamentState.currentMatch < 4) {
        // Quarts de finale -> Demi-finales
        const nextRoundMatchIndex =
          4 + Math.floor(tournamentState.currentMatch / 2);
        const nextMatch = tournamentState.matches[nextRoundMatchIndex];
        if (!nextMatch) {

          gameManager.blockSpacebar(false); // Réactiver la barre d'espace
          return;
        }

        if (!nextMatch.player1) {
          nextMatch.player1 = currentMatch.winner;
        } else {
          nextMatch.player2 = currentMatch.winner;
        }

        const [newPlayer1, newPlayer2] = ensureHumanFirst(
          nextMatch.player1,
          nextMatch.player2,
          gameManager
        );

        nextMatch.player1 = newPlayer1;
        nextMatch.player2 = newPlayer2;
      } else if (
        tournamentState.currentMatch >= 4 &&
        tournamentState.currentMatch < 6
      ) {
        // Demi-finales -> Finale
        const finalMatchIndex = 6; // Match 6 est la finale
        const nextMatch = tournamentState.matches[finalMatchIndex];
        if (!nextMatch) {
          gameManager.blockSpacebar(false); // Réactiver la barre d'espace
          return;
        }

        if (!nextMatch.player1) {
          nextMatch.player1 = currentMatch.winner;
        } else {
          nextMatch.player2 = currentMatch.winner;
        }

        const [newPlayer1, newPlayer2] = ensureHumanFirst(
          nextMatch.player1,
          nextMatch.player2,
          gameManager
        );

        nextMatch.player1 = newPlayer1;
        nextMatch.player2 = newPlayer2;
      }
    }

    // **5. Vérifier si c'est le dernier match**
    const isLastMatch =
      (playerCount === 4 && tournamentState.currentMatch === 2) ||
      (playerCount === 8 && tournamentState.currentMatch === 6);

    // **6. Affichage des résultats et progression**
    if (isLastMatch) {
      showTournamentWinner(currentMatch.winner, finalScores);
      setTimeout(() => {
        tournamentState.currentMatch++;
        updateBracketDisplay();
        updateCurrentMatchIndicators();
        updatePlayButton();
        highlightFinalWinner();
      }, 500);
    } else {
      showMatchVictory(
        currentMatch.winner,
        finalScores.player1,
        finalScores.player2
      );
      setTimeout(() => {
        tournamentState.currentMatch++;
        updateBracketDisplay();
        updateCurrentMatchIndicators();
        updatePlayButton();
      }, 500);
    }
    gameManager.blockSpacebar(false);
  }

  function updatePlayButton() {
    // Bloquer la barre d'espace pendant l'exécution de la fonction
    gameManager.blockSpacebar(true);

    //recuperer la langue
    language = getLanguageFromAPI();
    language.then((value) => {
      fetch(`/static/languages/${value}.json`) // Utilisation correcte des backticks
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load translations");
          }
          return response.json();
        })
        .then((data) => {
          translations = data;
        })
        .catch((error) => {
        });
    });

    const playerCount = getSelectedPlayerCount();
    const lastMatchIndex = playerCount === 4 ? 3 : 7;
    const isLastMatch = tournamentState.currentMatch >= lastMatchIndex;
    const nextMatch = tournamentState.matches[tournamentState.currentMatch];
    const playButton = document.getElementById("buttonPlay");

    if (isLastMatch) {
      // remove the button
      playButton.innerHTML = `
        <span class="button-text" data-translate="tournament.complete">Tournament Complete!</span>
      `;
      playButton.classList.add("tournament-complete");
      playButton.disabled = true;

      // Ajouter les effets spéciaux au vainqueur final
      highlightFinalWinner();

      // Réactiver la barre d'espace à la fin de la fonction
      gameManager.blockSpacebar(false);
      return;
    }

    if (!nextMatch || !nextMatch.player1 || !nextMatch.player2) {
      playButton.innerHTML = `
        <img class="playIcon" src="/static/assets/icons/play.svg" />
        <span class="button-text">Waiting for next matches</span>
      `;
      playButton.disabled = true;

      // Réactiver la barre d'espace à la fin de la fonction
      gameManager.blockSpacebar(false);
      return;
    }

    // Vérifier si les deux joueurs du prochain match sont des bots
    const player1IsBot = gameManager.isBot(nextMatch.player1);
    const player2IsBot = gameManager.isBot(nextMatch.player2);

    if (player1IsBot && player2IsBot) {
      playButton.innerHTML = `
              <svg>
          <use href="/static/assets/icons/sprite.svg#play"></use>
      </svg>
      ${translations.tournament.botMatch}
      `;
      playButton.disabled = false;

      // Réactiver la barre d'espace à la fin de la fonction
      gameManager.blockSpacebar(false);
      return;
    }

    let matchText = translations.tournament.launchMatch;
    if (tournamentState.currentMatch === lastMatchIndex - 1) {
      matchText = translations.tournament.launchFinal;
    } else if (playerCount === 8 && tournamentState.currentMatch >= 4) {
      matchText = translations.tournament.launchSemiFinal;
    }

    playButton.innerHTML = `
              <svg>
          <use href="/static/assets/icons/sprite.svg#play"></use>
      </svg>
      ${matchText}
      `;
    playButton.disabled = false;

    // Réactiver la barre d'espace à la fin de la fonction
    gameManager.blockSpacebar(false);
  }

  function highlightFinalWinner() {
    // Bloquer la barre d'espace pendant l'exécution de cette fonction
    gameManager.blockSpacebar(true);

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

    // Réactiver la barre d'espace après la mise en évidence du vainqueur
    gameManager.blockSpacebar(false);
  }

  function startTournament() {
    // Bloquer la barre d'espace pendant l'exécution de cette fonction
    gameManager.blockSpacebar(true);

    const playerInputs = document.querySelectorAll(
      ".player-entry .player-input"
    );
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

    document.getElementById("buttonPlay").innerHTML = `
      <img class="playIcon" src="/static/assets/icons/play.svg" />
      <span class="button-text">LAUNCH NEXT MATCH</span>
    `;
    document.getElementById("resetTournamentButton").style.display = "flex";

    tournamentState.isStarted = true;
    tournamentState.currentMatch = 0;
    tournamentState.currentRound = 1;

    updateCurrentMatchIndicators();
    updatePlayButton();

    // Réactiver la barre d'espace après la mise en place du tournoi
    gameManager.blockSpacebar(false);
  }

  // const playButton = document.querySelector(".buttonPlay");
  if (playButton) {
    playButton.addEventListener("click", () => {
      language = getLanguageFromAPI();
      language.then((value) => {
        setPreferredLanguage(value);
      });
      if (!tournamentState.isStarted) {
        const playerCount = getSelectedPlayerCount();
        openTournamentConfig(playerCount);
      } else {
        gameManager.startGame();
      }
    });
  }

  const startButton = document.getElementById("startTournamentButton");
  if (startButton) {
    startButton.addEventListener("click", startTournament);
  }

  const resetButton = document.getElementById("resetTournamentButton");
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

  handleOptionChange("4");

  window.dispatchGameEnd = function (winner) {
    const event = new CustomEvent("gameEnd", {
      detail: { winner: winner },
    });
    window.dispatchEvent(event);
  };

  // function showVictoryScreen(winner, score1, score2) {
  //   const overlay = document.querySelector(".victory-overlay");
  //   const winnerNameElement = overlay.querySelector(".winner-name");
  //   const scoreElement = overlay.querySelector(".victory-score");
  //   const continueBtn = overlay.querySelector(".continue-btn");

  //   winnerNameElement.textContent = winner.name;
  //   scoreElement.innerHTML = `<span>${score1}</span> - <span>${score2}</span>`;

  //   overlay.classList.add("show");

  //   // Gérer le bouton continue
  //   const handleContinue = () => {
  //     overlay.classList.remove("show");
  //     continueBtn.removeEventListener("click", handleContinue);
  //   };

  //   continueBtn.addEventListener("click", handleContinue);
  // }

  // function showVictoryScreen(winner, score1, score2) {
  //   // Bloquer la barre d'espace lorsque l'écran de victoire est affiché
  //   gameManager.blockSpacebar(true);

  //   const overlay = document.querySelector(".victory-overlay");
  //   const winnerNameElement = overlay.querySelector(".winner-name");
  //   const scoreElement = overlay.querySelector(".victory-score");
  //   const continueBtn = overlay.querySelector(".continue-btn");

  //   winnerNameElement.textContent = winner.name;
  //   scoreElement.innerHTML = `<span>${score1}</span> - <span>${score2}</span>`;

  //   overlay.classList.add("show");

  //   // Gérer le bouton continue
  //   const handleContinue = () => {
  //     // Réactiver la barre d'espace après que l'utilisateur ait cliqué sur "Continue"
  //     gameManager.blockSpacebar(false);

  //     overlay.classList.remove("show");
  //     continueBtn.removeEventListener("click", handleContinue);
  //   };

  //   continueBtn.addEventListener("click", handleContinue);
  // }

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

  // function showMatchVictory(winner, score1, score2) {
  //   // Bloquer la barre d'espace lorsqu'on affiche l'écran de victoire
  //   gameManager.blockSpacebar(true);

  //   const overlay = document.querySelector(".victory-overlay");
  //   const winnerNameElement = overlay.querySelector(".winner-name");
  //   const scoreElement = overlay.querySelector(".victory-score");
  //   const continueBtn = overlay.querySelector(".continue-btn");

  //   winnerNameElement.textContent = winner.name;
  //   scoreElement.innerHTML = `WON THE GAME`;

  //   overlay.classList.add("show");

  //   // Ajouter un écouteur sur l'overlay pour bloquer la barre d'espace dans la pop-up
  //   overlay.addEventListener("keydown", (event) => {
  //     // Empêche la propagation de la barre d'espace si l'overlay est affiché
  //     if (event.code === "Space") {
  //       event.preventDefault(); // Bloque la barre d'espace dans la pop-up
  //     }
  //   });

  //   const handleContinue = () => {
  //     // Réactiver la barre d'espace lorsque l'utilisateur clique sur "Continue"
  //     gameManager.blockSpacebar(false);

  //     overlay.classList.remove("show");
  //     continueBtn.removeEventListener("click", handleContinue);
  //   };

  //   continueBtn.addEventListener("click", handleContinue);

  //   // Focus sur l'overlay pour capter l'événement keydown
  //   overlay.tabIndex = -1; // Rend l'overlay focusable
  //   overlay.focus(); // Donne le focus à l'overlay pour capturer les événements clavier
  // }

  function showMatchVictory(winner, score1, score2) {
    // Bloquer la barre d'espace lorsqu'on affiche l'écran de victoire

    // Récupérer la langue
    language = getLanguageFromAPI();
    language.then((value) => {
      fetch(`/static/languages/${value}.json`) // Utilisation correcte des backticks
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load translations");
          }
          return response.json();
        })
        .then((data) => {
          translations = data;
        })
        .catch((error) => {
        });
    });

    gameManager.blockSpacebar(true);

    const overlay = document.querySelector(".victory-overlay");
    const winnerNameElement = overlay.querySelector(".winner-name");
    const scoreElement = overlay.querySelector(".victory-score");
    const continueBtn = overlay.querySelector(".continue-btn");

    winnerNameElement.textContent = winner.name;
    scoreElement.innerHTML = `${translations.tournament.winAnnouncement}`;

    overlay.classList.add("show");

    // Assurez-vous que l'overlay capte l'événement de la barre d'espace
    overlay.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        event.preventDefault(); // Bloque l'événement sur la pop-up
      }
    });

    // Focus sur l'overlay pour que l'overlay capte les événements
    overlay.tabIndex = -1; // Permet à l'overlay d'être focusable
    overlay.focus(); // Assure que l'overlay a le focus

    const handleContinue = () => {
      // Réactiver la barre d'espace après que l'utilisateur ait cliqué sur "Continue"
      gameManager.blockSpacebar(false);

      overlay.classList.remove("show");
      continueBtn.removeEventListener("click", handleContinue);
    };

    continueBtn.addEventListener("click", handleContinue);
  }

  function showTournamentWinner(winner, finalScores) {
    // Bloquer la barre d'espace lors de l'affichage de l'écran de la victoire finale
    gameManager.blockSpacebar(true);

    const overlay = document.querySelector(".tournament-winner-overlay");
    const winnerNameElement = overlay.querySelector(".winner-name");
    const titleElement = overlay.querySelector(".winner-title");
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
      // Réactiver la barre d'espace quand l'utilisateur clique sur "Continue"
      gameManager.blockSpacebar(false);

      overlay.classList.remove("show");
      clearInterval(confettiInterval);
      overlay.querySelectorAll(".confetti").forEach((c) => c.remove());
      continueBtn.removeEventListener("click", handleContinue);
    };

    continueBtn.addEventListener("click", handleContinue);
  }

  // function showMatchVictory(winner, score1, score2) {
  //   const overlay = document.querySelector(".victory-overlay");
  //   const winnerNameElement = overlay.querySelector(".winner-name");
  //   const scoreElement = overlay.querySelector(".victory-score");
  //   const continueBtn = overlay.querySelector(".continue-btn");

  //   winnerNameElement.textContent = winner.name;
  //   scoreElement.innerHTML = `WON THE GAME`; // Texte modifié ici

  //   overlay.classList.add("show");

  //   const handleContinue = () => {
  //     overlay.classList.remove("show");
  //     continueBtn.removeEventListener("click", handleContinue);
  //   };

  //   continueBtn.addEventListener("click", handleContinue);
  // }

  // function showTournamentWinner(winner, finalScores) {
  //   const overlay = document.querySelector(".tournament-winner-overlay");
  //   const winnerNameElement = overlay.querySelector(".winner-name");
  //   const titleElement = overlay.querySelector(".winner-title"); // Pour le "TOURNAMENT CHAMPION"
  //   const scoreElement = overlay.querySelector(".final-score");
  //   const continueBtn = overlay.querySelector(".continue-btn");

  //   // Nettoyer les confettis existants
  //   overlay.querySelectorAll(".confetti").forEach((c) => c.remove());

  //   titleElement.textContent = "TOURNAMENT CHAMPION";
  //   winnerNameElement.textContent = winner.name;

  //   // On cache ou on enlève le score element qui n'est plus nécessaire
  //   if (scoreElement) {
  //     scoreElement.style.display = "none";
  //   }

  //   overlay.classList.add("show");

  //   // Créer les confettis initiaux
  //   createConfetti();

  //   // Créer de nouveaux confettis toutes les 2 secondes
  //   const confettiInterval = setInterval(() => {
  //     if (overlay.classList.contains("show")) {
  //       createConfetti();
  //     }
  //   }, 2000);

  //   const handleContinue = () => {
  //     overlay.classList.remove("show");
  //     clearInterval(confettiInterval);
  //     overlay.querySelectorAll(".confetti").forEach((c) => c.remove());
  //     continueBtn.removeEventListener("click", handleContinue);
  //   };

  //   continueBtn.addEventListener("click", handleContinue);
  // }
}
