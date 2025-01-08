function initializeSettingsPage() {
  const scoreButtons = document.querySelectorAll(".scoreOptionLabel");

  function handleButtonClick(event) {
    scoreButtons.forEach((button) => button.classList.remove("active"));

    const clickedButton = event.target;
    clickedButton.classList.add("active");

    const selectedScore = clickedButton.getAttribute("win-score");

    hasChanges = true;
    toggleSaveButtonVisibility();
  }

  scoreButtons.forEach((button) => {
    button.addEventListener("click", handleButtonClick);
  });

  const difficultyButtons = document.querySelectorAll(".difficultyOptionLabel");

  function handleDifficultyButtonClick(event) {
    difficultyButtons.forEach((button) => button.classList.remove("active"));

    const clickedButton = event.target;
    clickedButton.classList.add("active");

    const selectedDifficulty = clickedButton.getAttribute("ai-difficulty");
    hasChanges = true;
    toggleSaveButtonVisibility();
  }

  difficultyButtons.forEach((button) => {
    button.addEventListener("click", handleDifficultyButtonClick);
  });

  const powerupButtons = document.querySelectorAll(".powerupOptionLabel");

  function handlePowerupClick(event) {
    const clickedButton = event.target;

    clickedButton.classList.toggle("active");

    const activePowerups = Array.from(powerupButtons)
      .filter((button) => button.classList.contains("active"))
      .map((button) => button.getAttribute("powerups"));

    hasChanges = true;
    toggleSaveButtonVisibility();
  }

  powerupButtons.forEach((button) => {
    button.addEventListener("click", handlePowerupClick);
  });

  const ballSpeedStartButtons = document.querySelectorAll(
    ".ballSpeedStartOptionLabel"
  );

  const ballSpeedMaxButtons = document.querySelectorAll(
    ".ballSpeedMaxOptionLabel"
  );

  function handleBallSpeedStartButtonClick(event) {
    ballSpeedStartButtons.forEach((button) =>
      button.classList.remove("active")
    );

    const clickedButton = event.target;
    clickedButton.classList.add("active");

    const selectedBallSpeedStart = parseInt(
      clickedButton.getAttribute("data-start")
    );

    validateBallSpeedStart(selectedBallSpeedStart);
    hasChanges = true;
    toggleSaveButtonVisibility();
  }

  function handleBallSpeedMaxButtonClick(event) {
    ballSpeedMaxButtons.forEach((button) => button.classList.remove("active"));

    const clickedButton = event.target;
    clickedButton.classList.add("active");

    const selectedBallSpeedMax = parseInt(
      clickedButton.getAttribute("data-max")
    );

    adjustBallSpeedStart(selectedBallSpeedMax);
    hasChanges = true;
    toggleSaveButtonVisibility();
  }

  function adjustBallSpeedStart(maxSpeed) {
    const activeStartButton = document.querySelector(
      ".ballSpeedStartOptionLabel.active"
    );
    const activeStartValue = activeStartButton
      ? parseInt(activeStartButton.getAttribute("data-start"))
      : null;

    if (activeStartValue > maxSpeed) {
      const validStartValue = Array.from(ballSpeedStartButtons)
        .map((button) => parseInt(button.getAttribute("data-start")))
        .filter((value) => value <= maxSpeed)
        .pop();

      ballSpeedStartButtons.forEach((button) =>
        button.classList.remove("active")
      );
      const validStartButton = document.querySelector(
        `.ballSpeedStartOptionLabel[data-start="${validStartValue}"]`
      );
      if (validStartButton) {
        validStartButton.classList.add("active");
      }
    }
  }

  function validateBallSpeedStart(startSpeed) {
    const activeMaxButton = document.querySelector(
      ".ballSpeedMaxOptionLabel.active"
    );
    const activeMaxValue = activeMaxButton
      ? parseInt(activeMaxButton.getAttribute("data-max"))
      : null;

    if (startSpeed > activeMaxValue) {
      adjustBallSpeedStart(activeMaxValue);
    }
  }

  ballSpeedStartButtons.forEach((button) => {
    button.addEventListener("click", handleBallSpeedStartButtonClick);
  });
  ballSpeedMaxButtons.forEach((button) => {
    button.addEventListener("click", handleBallSpeedMaxButtonClick);
  });

  const ballSpeedIncreaseButtons = document.querySelectorAll(
    ".ballSpeedIncreaseOptionLabel"
  );

  function handleBallSpeedIncreaseButtonClick(event) {
    ballSpeedIncreaseButtons.forEach((button) =>
      button.classList.remove("active")
    );

    const clickedButton = event.target;
    clickedButton.classList.add("active");

    const selectedBallSpeedIncrease =
      clickedButton.getAttribute("data-increase");

    hasChanges = true;
    toggleSaveButtonVisibility();
  }

  ballSpeedIncreaseButtons.forEach((button) => {
    button.addEventListener("click", handleBallSpeedIncreaseButtonClick);
  });

  function saveGameSettings() {
    const activeScoreButton = document.querySelector(
      ".scoreOptionLabel.active"
    );
    const scoreToWin = activeScoreButton
      ? activeScoreButton.getAttribute("win-score")
      : null;

    const activeDifficultyButton = document.querySelector(
      ".difficultyOptionLabel.active"
    );
    const difficulty = activeDifficultyButton
      ? activeDifficultyButton.getAttribute("ai-difficulty")
      : null;

    const activePowerupButtons = Array.from(
      document.querySelectorAll(".powerupOptionLabel.active")
    );
    const powerups = activePowerupButtons.map((button) =>
      button.getAttribute("powerups")
    );

    const activeBallSpeedStartButton = document.querySelector(
      ".ballSpeedStartOptionLabel.active"
    );
    const ballSpeedStart = activeBallSpeedStartButton
      ? activeBallSpeedStartButton.getAttribute("data-start")
      : null;

    const activeBallSpeedMaxButton = document.querySelector(
      ".ballSpeedMaxOptionLabel.active"
    );
    const ballSpeedMax = activeBallSpeedMaxButton
      ? activeBallSpeedMaxButton.getAttribute("data-max")
      : null;

    const activeBallSpeedIncreaseButton = document.querySelector(
      ".ballSpeedIncreaseOptionLabel.active"
    );
    const ballSpeedIncrease = activeBallSpeedIncreaseButton
      ? activeBallSpeedIncreaseButton.getAttribute("data-increase")
      : null;

    const gameSettings = {
      scoreToWin: scoreToWin,
      difficulty: difficulty,
      powerups: powerups,
      ballSpeedStart: ballSpeedStart,
      ballSpeedMax: ballSpeedMax,
      ballSpeedIncrease: ballSpeedIncrease,
    };

    fetch("/api/set-game-settings/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameSettings),
    })
      .then((response) => {
        hasChanges = false;
        toggleSaveButtonVisibility();
        return response.json();
      })
      .then((data) => {
        if (data.message !== "Settings updated successfully") {
          throw new Error(data.error || "Erreur inconnue côté serveur");
        }
      })
      .catch((error) => {
        // alert("Une erreur est survenue lors de la sauvegarde des paramètres.");
      });
  }

  const saveButton = document.getElementById("save-settings");
  saveButton.addEventListener("click", saveGameSettings);

  function handleKeyChange(event) {
    const button = event.target;

    const activeButton = document.querySelector(".change-key.active");
    if (activeButton && activeButton !== button) {
      return;
    }

    button.classList.add("active");

    const oldKey = button.textContent;
    button.textContent = "";

    document.querySelectorAll(".change-key").forEach((otherButton) => {
      if (otherButton !== button) {
        otherButton.disabled = true;
      }
    });

    function isSettingsPage() {
      return window.location.pathname === "/settings";
    }

    function onKeyPress(e) {
      if (!isSettingsPage()) {
        return;
      }

      const newKey = e.key.toUpperCase();

      if (newKey === " " || newKey === "SPACE") {
        showErrorPopup("spaceBarError");
        return;
      }

      const existingButton = Array.from(
        document.querySelectorAll(".change-key")
      ).find((otherButton) => otherButton.textContent === newKey);

      if (existingButton) {
        existingButton.textContent = "";
      }

      button.textContent = newKey;

      button.classList.remove("active");

      document.querySelectorAll(".change-key").forEach((otherButton) => {
        otherButton.disabled = false;
      });

      hasKeyboardChanges = true;
      toggleKeyboardSaveButtonVisibility();

      window.removeEventListener("keydown", onKeyPress);
    }

    window.addEventListener("keydown", onKeyPress);
  }

  document.querySelectorAll(".change-key").forEach((button) => {
    button.addEventListener("click", handleKeyChange);
  });

  function saveKeyboardSettings() {
    const keySettings = {
      keyboardSettings: {
        player1: {
          moveUp: document.getElementById("key-player1-moveUp").textContent,
          moveDown: document.getElementById("key-player1-moveDown").textContent,
          launchPower: document.getElementById("key-player1-launchPower")
            .textContent,
        },
        player2: {
          moveUp: document.getElementById("key-player2-moveUp").textContent,
          moveDown: document.getElementById("key-player2-moveDown").textContent,
          launchPower: document.getElementById("key-player2-launchPower")
            .textContent,
        },
      },
    };

    fetch("/api/set-game-settings/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keySettings),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.message !== "Settings updated successfully") {
          throw new Error(data.error || "Erreur inconnue côté serveur");
        }
      })
      .catch((error) => {
        // alert("Une erreur est survenue lors de la sauvegarde des paramètres.");
      });
    hasKeyboardChanges = false;
    toggleKeyboardSaveButtonVisibility();
  }

  document.querySelectorAll(".change-key").forEach((button) => {
    button.addEventListener("click", handleKeyChange);
  });

  document
    .getElementById("save-keyboard-settings")
    .addEventListener("click", saveKeyboardSettings);

  function setActiveButton(selector, value, attribute) {
    const button = document.querySelector(
      `${selector}[${attribute}="${value}"]`
    );
    if (button) {
      button.classList.add("active");
    } else {
    }
  }

  function initializeKeyboardSettings(keyboardSettings) {
    Object.entries(keyboardSettings).forEach(([player, controls]) => {
      Object.entries(controls).forEach(([action, key]) => {
        const button = document.getElementById(`key-${player}-${action}`);
        if (button) {
          button.textContent = key;
        } else {
        }
      });
    });
  }

  function initializeSettingsFromDatabase() {
    language = getLanguageFromAPI();
    language.then((value) => {
      setPreferredLanguage(value);
    });

    fetch("/api/game-settings", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.statusText}`);
        }
        return response.json();
      })
      .then((settings) => {
        setActiveButton(".scoreOptionLabel", settings.scoreToWin, "win-score");
        setActiveButton(
          ".difficultyOptionLabel",
          settings.difficulty,
          "ai-difficulty"
        );

        settings.powerups.forEach((powerup) =>
          setActiveButton(".powerupOptionLabel", powerup, "powerups")
        );

        setActiveButton(
          ".ballSpeedStartOptionLabel",
          settings.ballSpeedStart,
          "data-start"
        );
        setActiveButton(
          ".ballSpeedMaxOptionLabel",
          settings.ballSpeedMax,
          "data-max"
        );
        setActiveButton(
          ".ballSpeedIncreaseOptionLabel",
          settings.ballSpeedIncrease,
          "data-increase"
        );

        initializeKeyboardSettings(settings.keyboardSettings);
      })
      .catch((error) => {});
  }

  let hasChanges = false;

  function toggleSaveButtonVisibility() {
    const saveButton = document.getElementById("save-settings");
    if (hasChanges) {
      saveButton.style.opacity = "1";
      saveButton.style.pointerEvents = "auto";
    } else {
      saveButton.style.opacity = "0";
      saveButton.style.pointerEvents = "none";
    }
  }

  let hasKeyboardChanges = false;

  function toggleKeyboardSaveButtonVisibility() {
    const keyboardSaveButton = document.getElementById(
      "save-keyboard-settings"
    );
    if (hasKeyboardChanges) {
      keyboardSaveButton.style.opacity = "1";
      keyboardSaveButton.style.pointerEvents = "auto";
    } else {
      keyboardSaveButton.style.opacity = "0";
      keyboardSaveButton.style.pointerEvents = "none";
    }
  }

  initializeSettingsFromDatabase();
}
