function initializeSettingsPage() {
  console.log("fonction initializeSettingsPage() appele");

  document.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => {
      const setting = button.dataset.setting;

      document
        .querySelectorAll(`[data-setting="${setting}"]`)
        .forEach((btn) => {
          btn.classList.remove("active");
        });

      button.classList.add("active");
    });
  });

  document.querySelectorAll(".key-input").forEach((input) => {
    const originalValue = input.value;

    input.addEventListener("focus", () => {
      input.value = "Key";
      input.classList.add("listening");
    });

    input.addEventListener("blur", () => {
      if (input.value === "Kkey") {
        input.value = originalValue;
      }
      input.classList.remove("listening");
    });

    input.addEventListener("keydown", (e) => {
      e.preventDefault();

      const allowedKeys = new Set([
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "W",
        "s",
        "S",
        "a",
        "A",
        "d",
        "D",
        "q",
        "Q",
        "e",
        "E",
        "r",
        "R",
        "i",
        "I",
        "o",
        "O",
        "p",
        "P",
        " ",
        "Space",
      ]);

      let displayKey = e.key;
      switch (e.key) {
        case " ":
          displayKey = "Space";
          break;
        case "ArrowUp":
          displayKey = "↑";
          break;
        case "ArrowDown":
          displayKey = "↓";
          break;
        case "ArrowLeft":
          displayKey = "←";
          break;
        case "ArrowRight":
          displayKey = "→";
          break;
        default:
          displayKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      }

      if (allowedKeys.has(e.key)) {
        input.value = displayKey;
        input.blur();

        checkKeyConflicts(input, displayKey);
      }
    });
  });

  function checkKeyConflicts(currentInput, newKey) {
    document.querySelectorAll(".key-input").forEach((input) => {
      if (input !== currentInput && input.value === newKey) {
        const defaultValue = getDefaultValue(input.dataset.control);
        input.value = defaultValue;

        showConflictNotification(
          currentInput.dataset.control,
          input.dataset.control
        );
      }
    });
  }

  function getDefaultValue(control) {
    const defaultControls = {
      "p1-up": "W",
      "p1-down": "S",
      "p1-power-flash": "Q",
      "p1-power-laser": "E",
      "p1-power-multi": "R",
      "p2-up": "↑",
      "p2-down": "↓",
      "p2-power-flash": "I",
      "p2-power-laser": "O",
      "p2-power-multi": "P",
    };
    return defaultControls[control] || "";
  }

  const defaultSettings = {
    score: "5",
    ballSlower: "No",
    starter: "Alternate",
    powerMode: "Yes",
    difficulty: "Medium",
  };

  function showConflictNotification(newControl, conflictControl) {
    console.log(
      `Key conflict detected between ${newControl} and ${conflictControl}`
    );
  }

  Object.entries(defaultSettings).forEach(([setting, value]) => {
    const button = document.querySelector(
      `[data-setting="${setting}"][innerHTML="${value}"]`
    );
    if (button) {
      button.classList.add("active");
    }
  });

  const powerDescriptions = {
    flash:
      "Lancer une paire de lunettes de soleil qui projette une lumière blanche aveuglante à l'écran",
    laser:
      "Tirez un rayon laser qui traverse le terrain, s'il touche votre adversaire, inverse ces commandes",
    multi:
      "Créez deux balles supplémentaires pour rendre la partie plus épique",
  };

  const tooltipContainer = document.createElement("div");
  tooltipContainer.className = "tooltip-container";
  document.body.appendChild(tooltipContainer);

  function addPowerTooltips() {
    document.querySelectorAll(".control-input").forEach((input) => {
      const inputElement = input.querySelector("input");
      if (inputElement?.dataset.control.includes("power-")) {
        const powerType = inputElement.dataset.control.split("power-")[1];
        if (powerDescriptions[powerType]) {
          const label = input.querySelector("label");
          if (label) {
            const tooltipIcon = document.createElement("span");
            tooltipIcon.className = "tooltip-icon";
            tooltipIcon.innerHTML = "?";

            tooltipIcon.addEventListener("mouseenter", (e) => {
              tooltipContainer.textContent = powerDescriptions[powerType];
              tooltipContainer.style.display = "block";

              const iconRect = tooltipIcon.getBoundingClientRect();
              tooltipContainer.style.left = `${
                iconRect.left +
                iconRect.width / 2 -
                tooltipContainer.offsetWidth / 2
              }px`;
              tooltipContainer.style.top = `${
                iconRect.top - tooltipContainer.offsetHeight - 8
              }px`;
            });

            tooltipIcon.addEventListener("mouseleave", () => {
              tooltipContainer.style.display = "none";
            });

            label.appendChild(tooltipIcon);
            input.classList.add("with-tooltip");
          }
        }
      }
    });
  }

  addPowerTooltips();

  document.querySelector(".save-button").addEventListener("click", () => {
    const settings = {
      gameSettings: {
        score: document.querySelector('[data-setting="score"].active')
          ?.innerHTML,
        ballSlower: document.querySelector('[data-setting="ballSlower"].active')
          ?.innerHTML,
        starter: document.querySelector('[data-setting="starter"].active')
          ?.innerHTML,
        powerMode: document.querySelector('[data-setting="powerMode"].active')
          ?.innerHTML,
        difficulty: document.querySelector('[data-setting="difficulty"].active')
          ?.innerHTML,
      },
      controls: {
        player1: {
          movement: {
            up: document.querySelector('[data-control="p1-up"]').value,
            down: document.querySelector('[data-control="p1-down"]').value,
          },
          powers: {
            flash: document.querySelector('[data-control="p1-power-flash"]')
              .value,
            laser: document.querySelector('[data-control="p1-power-laser"]')
              .value,
            multiball: document.querySelector('[data-control="p1-power-multi"]')
              .value,
          },
        },
        player2: {
          movement: {
            up: document.querySelector('[data-control="p2-up"]').value,
            down: document.querySelector('[data-control="p2-down"]').value,
          },
          powers: {
            flash: document.querySelector('[data-control="p2-power-flash"]')
              .value,
            laser: document.querySelector('[data-control="p2-power-laser"]')
              .value,
            multiball: document.querySelector('[data-control="p2-power-multi"]')
              .value,
          },
        },
      },
    };

    localStorage.setItem("gameSettings", JSON.stringify(settings));

    const saveButton = document.querySelector(".save-button");
    saveButton.innerHTML = "Saved!";
    saveButton.style.backgroundColor = "#ff710d";

    setTimeout(() => {
      saveButton.innerHTML = "Save Settings";
      saveButton.style.backgroundColor = "";
    }, 1500);

    console.log("Settings saved:", settings);
  });

  function loadSavedSettings() {
    const savedSettings = localStorage.getItem("gameSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      Object.entries(settings.gameSettings).forEach(([setting, value]) => {
        const button = document.querySelector(
          `[data-setting="${setting}"][innerHTML="${value}"]`
        );
        if (button) {
          document
            .querySelectorAll(`[data-setting="${setting}"]`)
            .forEach((btn) => {
              btn.classList.remove("active");
            });
          button.classList.add("active");
        }
      });

      const { controls } = settings;
      if (controls) {
        document.querySelector('[data-control="p1-up"]').value =
          controls.player1.movement.up;
        document.querySelector('[data-control="p1-down"]').value =
          controls.player1.movement.down;
        document.querySelector('[data-control="p1-power-flash"]').value =
          controls.player1.powers.flash;
        document.querySelector('[data-control="p1-power-laser"]').value =
          controls.player1.powers.laser;
        document.querySelector('[data-control="p1-power-multi"]').value =
          controls.player1.powers.multiball;

        document.querySelector('[data-control="p2-up"]').value =
          controls.player2.movement.up;
        document.querySelector('[data-control="p2-down"]').value =
          controls.player2.movement.down;
        document.querySelector('[data-control="p2-power-flash"]').value =
          controls.player2.powers.flash;
        document.querySelector('[data-control="p2-power-laser"]').value =
          controls.player2.powers.laser;
        document.querySelector('[data-control="p2-power-multi"]').value =
          controls.player2.powers.multiball;
      }
    }
  }

  loadSavedSettings();
}
