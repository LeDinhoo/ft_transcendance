function ensureHumanFirst(player1, player2, gameManager) {
  if (!player1 || !player2) {
    console.error(
      "One or both players are undefined in ensureHumanFirst:",
      player1,
      player2
    );
    return [player1, player2];
  }

  const player1IsBot = gameManager.isBot(player1);
  const player2IsBot = gameManager.isBot(player2);

  if (!player1IsBot && !player2IsBot) {
    console.log(`Both players are human. No swapping needed.`);
    return [player1, player2];
  }

  if (player1IsBot && !player2IsBot) {
    console.log(`Swapping players to make human player1.`);
    return [player2, player1];
  }

  return [player1, player2];
}

function initializeTournamentPage() {
  console.log("fonction initializetournament game appele ...");

  const DEFAULT_AVATAR = "/static/assets/icons/pending.svg";

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
        console.error("Player object is null or undefined.");
        return false;
      }

      const index = this.tournamentState.players.findIndex(
        (p) => p.name === player.name
      );

      if (index === -1) {
        console.error(
          "Player not found in tournamentState.players:",
          player.name
        );
        return false;
      }

      if (index === 0) {
        console.log(
          `Player ${player.name} is the first user and is always human.`
        );
        return false;
      }

      const toggle = document.querySelectorAll(".bot-checkbox")[index - 1];
      if (!toggle) {
        console.error("Bot toggle not found for player at index:", index);
        return false;
      }

      console.log(`Player ${player.name} isBot: ${toggle.checked}`);
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

      window.addEventListener("message", (event) => {
        console.log("event.data: ", event.data);
        if (event.data.type === "scoreUpdate") {
          this.currentGameScores = {
            player1: event.data.data.finalScores.player1Score,
            player2: event.data.data.finalScores.player2Score,
          };
        } else if (event.data.type === "gameComplete") {
          const winner = event.data.data.winner;
          const finalScores = event.data.data.finalScores;
          console.log("winner : ", winner);
          console.log("finalScores : ", finalScores);

          this.endGame();
          progressTournament(winner, finalScores, gameManager);
        }
      });
    }

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
          console.log("Data received:", data);
          this.options = data;
          console.log("Options:", this.options);
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des paramètres :",
            error
          );
        });
    }

    startGame() {
      this.isSimulationInProgress = false;

      this.currentGameScores = {
        player1: 0,
        player2: 0,
      };

      const currentMatch =
        this.tournamentState.matches[this.tournamentState.currentMatch];

      if (
        !currentMatch ||
        this.tournamentState.currentMatch >= this.tournamentState.matches.length
      ) {
        console.log("No more matches to play");
        return;
      }

      console.log(
        "Starting game for match:",
        this.tournamentState.currentMatch
      );
      console.log("Current match data:", currentMatch);

      const player1IsBot = this.isBot(currentMatch.player1);
      const player2IsBot = this.isBot(currentMatch.player2);

      console.log(
        `Player 1 (${currentMatch.player1.name}) isBot:`,
        player1IsBot
      );
      console.log(
        `Player 2 (${currentMatch.player2.name}) isBot:`,
        player2IsBot
      );

      if (!this.options) {
        console.error("Game options not found in localStorage!");
        return;
      }
      console.log("Game options retrieved:", this.options);

      if (player1IsBot && player2IsBot) {
        console.log("Simulating match between two bots...");

        this.isSimulationInProgress = true;
        this.blockSpacebar(true);

        const simulateScores = () => {
          let score1 = 0;
          let score2 = 0;

          while (true) {
            score1 = Math.floor(Math.random() * 6);
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

        const { score1: simulatedScore1, score2: simulatedScore2 } =
          simulateScores();

        const simulatedWinner =
          simulatedScore1 > simulatedScore2
            ? currentMatch.player1
            : currentMatch.player2;

        console.log(
          "Simulation complete. Winner:",
          simulatedWinner,
          "Scores:",
          {
            player1: simulatedScore1,
            player2: simulatedScore2,
          }
        );

        progressTournament(
          null,
          { player1: simulatedScore1, player2: simulatedScore2 },
          this
        );

        this.isSimulationInProgress = false;
        this.blockSpacebar(false);
        return;
      }

      this.gameContainer.style.display = "block";
      this.gameContainer.src = "/static/spa/game3D/three.html";

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

        if (!player1IsBot && player2IsBot) {
          const options = this.options;
          console.log("options : ", options);
          const isAI = true;
          const power = true;
          this.gameContainer.contentWindow.postMessage(
            {
              type: "setOptions",
              data: { options, isAI, power },
            },
            "*"
          );
        } else if (!player1IsBot && !player2IsBot) {
          const options = this.options;
          const isAI = false;
          const power = true;
          this.gameContainer.contentWindow.postMessage(
            {
              type: "setOptions",
              data: { options, isAI, power },
            },
            "*"
          );
        }

        this.gameContainer.focus();
      };
    }

    blockSpacebar(isBlocked) {
      if (isBlocked) {
        window.addEventListener("keydown", this.preventSpacebar, {
          once: true,
        });
      } else {
        window.removeEventListener("keydown", this.preventSpacebar);
      }
    }

    preventSpacebar(event) {
      if (event.code === "Space") {
        event.preventDefault();
        console.log("Barre d'espace bloquée pendant la simulation");
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

  const gameManager = new TournamentGameManager(tournamentState);

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

  const optionButtons = document.querySelectorAll(".option-btn");
  const shapes = document.querySelectorAll(".shape");
  const playButton = document.getElementById("buttonPlay");
  const tournamentConfig = document.getElementById("tournamentConfig");

  function updateCurrentMatchIndicators() {
    document.querySelectorAll(".doubleMatchNumber").forEach((number) => {
      number.classList.remove("active");
    });

    if (!tournamentState.isStarted) return;

    const playerCount = getSelectedPlayerCount();
    const activeShape = document.querySelector(".shape.active");

    const matchNumber = tournamentState.currentMatch + 1;

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
      console.error("No active button found. Defaulting to 4 players.");
      return 4;
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
    container.innerHTML += `
        <div class="player-entry">
            <img class="player-avatar" src="/static/assets/avatars/buffalo.png" />
            <div class="player-controls">
                <input type="text" class="player-input" value="YourNickname" />
            </div>
        </div>
    `;

    for (let i = 1; i < count; i++) {
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      container.innerHTML += `
            <div class="player-entry">
                <img class="player-avatar" src="/static/assets/avatars/${randomAvatar}" />
                <div class="player-controls">
                    <input type="text" class="player-input" value="Bot Player ${i}" maxlenght="15"/>
                    <div class="bot-toggle">
                        <label class="switch">
                            <input type="checkbox" class="bot-checkbox" checked>
                            <span class="slider round"></span>
                        </label>
                        <span class="bot-label">Bot</span>
                    </div>
                </div>
            </div>
        `;
    }

    const botCheckboxes = document.querySelectorAll(".bot-checkbox");
    botCheckboxes.forEach((checkbox, index) => {
      const input = checkbox
        .closest(".player-entry")
        .querySelector(".player-input");

      if (checkbox.checked) {
        input.classList.add("bot-active");
        input.readOnly = true;
        input.value = `Bot Player ${index + 1}`;
      }

      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          input.classList.add("bot-active");
          input.readOnly = true;
          input.value = `Bot Player ${index + 1}`;
        } else {
          input.classList.remove("bot-active");
          input.readOnly = false;
          input.value = "";
          input.placeholder = "Entrez un pseudo";
        }
      });
    });

    setupBotCheckboxListeners();

    setupInputValidation();

    truncateNicknames();
  }

  function setupBotCheckboxListeners() {
    const botCheckboxes = document.querySelectorAll(".bot-checkbox");
    botCheckboxes.forEach((checkbox, index) => {
      const input = checkbox
        .closest(".player-entry")
        .querySelector(".player-input");

      if (checkbox.checked) {
        input.classList.add("bot-active");
        input.readOnly = true;
        input.value = `Bot Player ${index + 1}`;
      }

      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          input.classList.add("bot-active");
          input.readOnly = true;
          input.value = `Bot Player ${index + 1}`;
        } else {
          input.classList.remove("bot-active");
          input.readOnly = false;
          input.value = "";
          input.placeholder = "Entrez un pseudo";
        }
      });
    });
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
      const isFinalWinnerDisplay = index === (playerCount === 4 ? 3 : 7);
      if (isFinalWinnerDisplay) {
        const finalMatchIndex = playerCount === 4 ? 2 : 6;
        const finalMatch = tournamentState.matches[finalMatchIndex];

        const winnerElement = matchElement.querySelector(".player");
        const winnerName = winnerElement.querySelector(".nickname");
        const winnerAvatar = winnerElement.querySelector(".logo");

        if (finalMatch?.winner) {
          winnerName.textContent = finalMatch.winner.name;
          winnerAvatar.src = finalMatch.winner.avatar;
          winnerElement.classList.add("winner-final");
        } else {
          winnerName.textContent = "";
          winnerAvatar.src = DEFAULT_AVATAR;
          winnerElement.classList.remove("winner-final");
        }
        return;
      }

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

  function handleOptionChange(value) {
    optionButtons.forEach((btn) => btn.classList.remove("active"));
    document.getElementById(value).classList.add("active");
    showShape(value + "display");

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
      console.error("No current match or matches array is not valid.");
      gameManager.blockSpacebar(false);
      return;
    }

    const currentMatch = tournamentState.matches[tournamentState.currentMatch];
    if (!currentMatch) {
      console.error("Current match is undefined.");
      gameManager.blockSpacebar(false);
      return;
    }

    const playerCount = getSelectedPlayerCount();

    if (finalScores.player1 > finalScores.player2) {
      currentMatch.winner = currentMatch.player1;
    } else if (finalScores.player2 > finalScores.player1) {
      currentMatch.winner = currentMatch.player2;
    } else {
      console.warn("Tie detected, randomly selecting a winner.");
      currentMatch.winner =
        Math.random() < 0.5 ? currentMatch.player1 : currentMatch.player2;
    }

    if (!currentMatch.winner) {
      console.error(
        `No winner defined for match ${tournamentState.currentMatch}`
      );
      gameManager.blockSpacebar(false);
      return;
    }

    console.log(
      `Match ${tournamentState.currentMatch} winner:`,
      currentMatch.winner
    );

    currentMatch.score1 = finalScores.player1;
    currentMatch.score2 = finalScores.player2;

    tournamentState.matchResults[tournamentState.currentMatch] = {
      winner: currentMatch.winner,
      scores: finalScores,
    };

    if (playerCount === 4) {
      if (
        tournamentState.currentMatch === 0 ||
        tournamentState.currentMatch === 1
      ) {
        const finalMatchIndex = 2;
        const nextMatch = tournamentState.matches[finalMatchIndex];
        if (!nextMatch) {
          console.error(`Final match (${finalMatchIndex}) is not initialized.`);
          gameManager.blockSpacebar(false);
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

        console.log(
          `Updating final match ${finalMatchIndex} with players:`,
          newPlayer1,
          newPlayer2
        );
        nextMatch.player1 = newPlayer1;
        nextMatch.player2 = newPlayer2;
      }
    } else if (playerCount === 8) {
      if (tournamentState.currentMatch < 4) {
        const nextRoundMatchIndex =
          4 + Math.floor(tournamentState.currentMatch / 2);
        const nextMatch = tournamentState.matches[nextRoundMatchIndex];
        if (!nextMatch) {
          console.error(
            `Next round match (${nextRoundMatchIndex}) is not initialized.`
          );
          gameManager.blockSpacebar(false);
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

        console.log(
          `Updating semi-final match ${nextRoundMatchIndex} with players:`,
          newPlayer1,
          newPlayer2
        );
        nextMatch.player1 = newPlayer1;
        nextMatch.player2 = newPlayer2;
      } else if (
        tournamentState.currentMatch >= 4 &&
        tournamentState.currentMatch < 6
      ) {
        const finalMatchIndex = 6;
        const nextMatch = tournamentState.matches[finalMatchIndex];
        if (!nextMatch) {
          console.error(`Final match (${finalMatchIndex}) is not initialized.`);
          gameManager.blockSpacebar(false);
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

        console.log(
          `Updating final match ${finalMatchIndex} with players:`,
          newPlayer1,
          newPlayer2
        );
        nextMatch.player1 = newPlayer1;
        nextMatch.player2 = newPlayer2;
      }
    }

    const isLastMatch =
      (playerCount === 4 && tournamentState.currentMatch === 2) ||
      (playerCount === 8 && tournamentState.currentMatch === 6);

    if (isLastMatch) {
      showTournamentWinner(currentMatch.winner, finalScores);
      setTimeout(() => {
        console.log("Final match winner:", tournamentState.matches[2]?.winner);
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
    gameManager.blockSpacebar(true);

    const playerCount = getSelectedPlayerCount();
    const lastMatchIndex = playerCount === 4 ? 3 : 7;
    const isLastMatch = tournamentState.currentMatch >= lastMatchIndex;
    const nextMatch = tournamentState.matches[tournamentState.currentMatch];
    const playButton = document.getElementById("buttonPlay");

    console.log("current match :", tournamentState.currentMatch);

    if (isLastMatch) {
      playButton.innerHTML = `
        <span class="button-text">Tournament Complete!</span>
      `;
      playButton.classList.add("tournament-complete");
      playButton.disabled = true;

      highlightFinalWinner();

      gameManager.blockSpacebar(false);
      return;
    }

    if (!nextMatch || !nextMatch.player1 || !nextMatch.player2) {
      playButton.innerHTML = `
        <img class="playIcon" src="/static/assets/icons/play.svg" />
        <span class="button-text">Waiting for next matches</span>
      `;
      playButton.disabled = true;

      gameManager.blockSpacebar(false);
      return;
    }

    const player1IsBot = gameManager.isBot(nextMatch.player1);
    const player2IsBot = gameManager.isBot(nextMatch.player2);

    if (player1IsBot && player2IsBot) {
      playButton.innerHTML = `
              <svg>
          <use href="/static/assets/icons/sprite.svg#play"></use>
      </svg>
      SIMULATE BOTS MATCH
      `;
      playButton.disabled = false;

      gameManager.blockSpacebar(false);
      return;
    }

    let matchText = "LAUNCH MATCH";
    if (tournamentState.currentMatch === lastMatchIndex - 1) {
      matchText = "LAUNCH FINAL";
    } else if (playerCount === 8 && tournamentState.currentMatch >= 4) {
      matchText = "LAUNCH SEMI-FINAL";
    }

    playButton.innerHTML = `
              <svg>
          <use href="/static/assets/icons/sprite.svg#play"></use>
      </svg>
      ${matchText}
      `;
    playButton.disabled = false;

    gameManager.blockSpacebar(false);
  }

  function highlightFinalWinner() {
    gameManager.blockSpacebar(true);

    const playerCount = getSelectedPlayerCount();
    const finalMatchIndex = playerCount === 4 ? 3 : 7;
    const activeShape = document.querySelector(".shape.active");

    const finalMatch = activeShape.querySelector(
      `.tournamentSection${playerCount === 4 ? "4" : "4"} .doubleMatch`
    );

    if (finalMatch) {
      const matchNumber = finalMatch.querySelector(".doubleMatchNumber");
      if (matchNumber) {
        matchNumber.classList.remove("active");
        matchNumber.classList.add("winner-number");
      }

      const playerElement = finalMatch.querySelector(".player");
      if (playerElement) {
        playerElement.classList.remove("winner");
        playerElement.classList.add("winner-final");
      }
    }

    gameManager.blockSpacebar(false);
  }

  function startTournament() {
    gameManager.blockSpacebar(true);

    const playerInputs = document.querySelectorAll(
      ".player-entry .player-input"
    );
    const playerAvatars = document.querySelectorAll(
      ".player-entry .player-avatar"
    );

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

    gameManager.blockSpacebar(false);
  }

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

  function createConfetti() {
    const colors = [
      "var(--liquid-lava)",
      "var(--dusty-grey)",
      "var(--slate-grey)",
      "var(--gluon-grey)",
    ];

    const confettiCount = 50;
    const container = document.querySelector(".tournament-winner-overlay");

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";

      confetti.style.left = `${Math.random() * 100}vw`;

      confetti.style.top = `-${Math.random() * 20}px`;

      const size = 5 + Math.random() * 7;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;

      const rotation = Math.random() * 360;
      const animationDuration = 3 + Math.random() * 2;
      const animationDelay = Math.random() * 2;

      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "3px";
      confetti.style.transform = `rotate(${rotation}deg)`;
      confetti.style.animation = `confettiFall ${animationDuration}s linear ${animationDelay}s infinite`;

      container.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 15000);
    }
  }

  function showMatchVictory(winner, score1, score2) {
    gameManager.blockSpacebar(true);

    const overlay = document.querySelector(".victory-overlay");
    const winnerNameElement = overlay.querySelector(".winner-name");
    const scoreElement = overlay.querySelector(".victory-score");
    const continueBtn = overlay.querySelector(".continue-btn");

    winnerNameElement.textContent = winner.name;
    scoreElement.innerHTML = `WON THE GAME`;

    overlay.classList.add("show");

    overlay.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        console.log("Barre d'espace bloquée dans la pop-up");
      }
    });

    overlay.tabIndex = -1;
    overlay.focus();

    const handleContinue = () => {
      gameManager.blockSpacebar(false);

      overlay.classList.remove("show");
      continueBtn.removeEventListener("click", handleContinue);
    };

    continueBtn.addEventListener("click", handleContinue);
  }

  function showTournamentWinner(winner, finalScores) {
    gameManager.blockSpacebar(true);

    const overlay = document.querySelector(".tournament-winner-overlay");
    const winnerNameElement = overlay.querySelector(".winner-name");
    const titleElement = overlay.querySelector(".winner-title");
    const scoreElement = overlay.querySelector(".final-score");
    const continueBtn = overlay.querySelector(".continue-btn");

    overlay.querySelectorAll(".confetti").forEach((c) => c.remove());

    titleElement.textContent = "TOURNAMENT CHAMPION";
    winnerNameElement.textContent = winner.name;

    if (scoreElement) {
      scoreElement.style.display = "none";
    }

    overlay.classList.add("show");

    createConfetti();

    const confettiInterval = setInterval(() => {
      if (overlay.classList.contains("show")) {
        createConfetti();
      }
    }, 2000);

    const handleContinue = () => {
      gameManager.blockSpacebar(false);

      overlay.classList.remove("show");
      clearInterval(confettiInterval);
      overlay.querySelectorAll(".confetti").forEach((c) => c.remove());
      continueBtn.removeEventListener("click", handleContinue);
    };

    continueBtn.addEventListener("click", handleContinue);
  }
}
