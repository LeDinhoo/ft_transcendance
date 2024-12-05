function initializeSettingsPage() {
// Score to Win////////////////////////////////////////////////////////////////////////////////////////
// Sélectionne tous les boutons
	const scoreButtons = document.querySelectorAll(".scoreOptionLabel");

// Fonction pour gérer le clic sur un bouton
	function handleButtonClick(event) {
		// Retirer la classe active de tous les boutons
		scoreButtons.forEach((button) => button.classList.remove("active"));

		// Ajouter la classe active au bouton cliqué
		const clickedButton = event.target;
		clickedButton.classList.add("active");

		// Optionnel : Afficher la valeur sélectionnée (par exemple)
		const selectedScore = clickedButton.getAttribute("win-score");
		console.log("Score sélectionné :", selectedScore);
	}

// Ajouter un gestionnaire d'événements à chaque bouton
	scoreButtons.forEach((button) => {
		button.addEventListener("click", handleButtonClick);
	});

// AI Difficulty //////////////////////////////////////////////////////////////////////////////////////
// Sélectionne tous les boutons
	const difficultyButtons = document.querySelectorAll(".difficultyOptionLabel");

// Fonction pour gérer le clic sur un bouton
	function handleDifficultyButtonClick(event) {
		// Retirer la classe active de tous les boutons
		difficultyButtons.forEach((button) => button.classList.remove("active"));

		// Ajouter la classe active au bouton cliqué
		const clickedButton = event.target;
		clickedButton.classList.add("active");

		// Optionnel : Afficher la valeur sélectionnée (par exemple)
		const selectedDifficulty = clickedButton.getAttribute("ai-difficulty");
		console.log("Difficulté sélectionnée :", selectedDifficulty);
	}

// Ajouter un gestionnaire d'événements à chaque bouton
	difficultyButtons.forEach((button) => {
		button.addEventListener("click", handleDifficultyButtonClick);
	});

// POWERUPS ///////////////////////////////////////////////////////////////////////////////////////////
// Sélectionne tous les boutons des power-ups
	const powerupButtons = document.querySelectorAll(".powerupOptionLabel");

// Fonction pour gérer le clic sur un bouton
	function handlePowerupClick(event) {
		const clickedButton = event.target;

		// Basculer la classe active (activer/désactiver)
		clickedButton.classList.toggle("active");

		// Optionnel : Collecter et afficher les power-ups activés
		const activePowerups = Array.from(powerupButtons)
			.filter((button) => button.classList.contains("active"))
			.map((button) => button.getAttribute("powerups"));

		console.log("Power-ups activés :", activePowerups);
	}

// Ajouter un gestionnaire d'événements à chaque bouton
	powerupButtons.forEach((button) => {
		button.addEventListener("click", handlePowerupClick);
	});

// BALLSPEEDSTART //////////////////////////////////////////////////////////////////////////////////////
// Sélectionne tous les boutons
	const ballSpeedStartButtons = document.querySelectorAll(
		".ballSpeedStartOptionLabel"
	);

// BALLSPEEDMAX ////////////////////////////////////////////////////////////////////////////////////////
// Sélectionne tous les boutons
	const ballSpeedMaxButtons = document.querySelectorAll(
		".ballSpeedMaxOptionLabel"
	);

// Fonction pour gérer le clic sur BallSpeedStart
	function handleBallSpeedStartButtonClick(event) {
		// Retirer la classe active de tous les boutons
		ballSpeedStartButtons.forEach((button) => button.classList.remove("active"));

		// Ajouter la classe active au bouton cliqué
		const clickedButton = event.target;
		clickedButton.classList.add("active");

		// Afficher la valeur sélectionnée (optionnel)
		const selectedBallSpeedStart = parseInt(
			clickedButton.getAttribute("data-start")
		);
		console.log("Vitesse de départ sélectionnée :", selectedBallSpeedStart);

		// Valider la valeur en fonction de BallSpeedMax actuel
		validateBallSpeedStart(selectedBallSpeedStart);
	}

// Fonction pour gérer le clic sur BallSpeedMax
	function handleBallSpeedMaxButtonClick(event) {
		// Retirer la classe active de tous les boutons
		ballSpeedMaxButtons.forEach((button) => button.classList.remove("active"));

		// Ajouter la classe active au bouton cliqué
		const clickedButton = event.target;
		clickedButton.classList.add("active");

		// Afficher la valeur sélectionnée (optionnel)
		const selectedBallSpeedMax = parseInt(clickedButton.getAttribute("data-max"));
		console.log("Vitesse maximale sélectionnée :", selectedBallSpeedMax);

		// Ajuster BallSpeedStart si nécessaire
		adjustBallSpeedStart(selectedBallSpeedMax);
	}

// Fonction pour ajuster BallSpeedStart en fonction de BallSpeedMax
	function adjustBallSpeedStart(maxSpeed) {
		const activeStartButton = document.querySelector(
			".ballSpeedStartOptionLabel.active"
		);
		const activeStartValue = activeStartButton
			? parseInt(activeStartButton.getAttribute("data-start"))
			: null;

		// Si la vitesse de départ actuelle dépasse la vitesse maximale, ajuster
		if (activeStartValue > maxSpeed) {
			// Trouver la valeur valide la plus proche
			const validStartValue = Array.from(ballSpeedStartButtons)
				.map((button) => parseInt(button.getAttribute("data-start")))
				.filter((value) => value <= maxSpeed)
				.pop(); // Dernière valeur valide

			// Mettre à jour l'affichage
			ballSpeedStartButtons.forEach((button) =>
				button.classList.remove("active")
			);
			const validStartButton = document.querySelector(
				`.ballSpeedStartOptionLabel[data-start="${validStartValue}"]`
			);
			if (validStartButton) {
				validStartButton.classList.add("active");
			}

			console.log(
				`Vitesse de départ ajustée à ${validStartValue} pour respecter la vitesse maximale de ${maxSpeed}`
			);
		}
	}

// Fonction pour valider BallSpeedStart lors d'une modification manuelle
	function validateBallSpeedStart(startSpeed) {
		const activeMaxButton = document.querySelector(
			".ballSpeedMaxOptionLabel.active"
		);
		const activeMaxValue = activeMaxButton
			? parseInt(activeMaxButton.getAttribute("data-max"))
			: null;

		// Si la vitesse de départ actuelle dépasse la vitesse maximale, ajuster
		if (startSpeed > activeMaxValue) {
			adjustBallSpeedStart(activeMaxValue);
		}
	}

// Ajouter les gestionnaires d'événements
	ballSpeedStartButtons.forEach((button) => {
		button.addEventListener("click", handleBallSpeedStartButtonClick);
	});
	ballSpeedMaxButtons.forEach((button) => {
		button.addEventListener("click", handleBallSpeedMaxButtonClick);
	});

// BALLSPEEDINCREASE ///////////////////////////////////////////////////////////////////////////////////
// Sélectionne tous les boutons
	const ballSpeedIncreaseButtons = document.querySelectorAll(
		".ballSpeedIncreaseOptionLabel"
	);

// Fonction pour gérer le clic sur un bouton
	function handleBallSpeedIncreaseButtonClick(event) {
		// Retirer la classe active de tous les boutons
		ballSpeedIncreaseButtons.forEach((button) =>
			button.classList.remove("active")
		);

		// Ajouter la classe active au bouton cliqué
		const clickedButton = event.target;
		clickedButton.classList.add("active");

		// Optionnel : Afficher la valeur sélectionnée (par exemple)
		const selectedBallSpeedIncrease = clickedButton.getAttribute("data-increase");
		console.log(
			"Augmentation de vitesse sélectionnée :",
			selectedBallSpeedIncrease
		);
	}

// Ajouter un gestionnaire d'événements à chaque bouton
	ballSpeedIncreaseButtons.forEach((button) => {
		button.addEventListener("click", handleBallSpeedIncreaseButtonClick);
	});

// Fonction pour récupérer et sauvegarder tous les paramètres
	function saveGameSettings() {
		// Récupérer les valeurs des paramètres
		const activeScoreButton = document.querySelector(".scoreOptionLabel.active");
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

		// Créer un objet pour stocker les paramètres
		const gameSettings = {
			scoreToWin: scoreToWin,
			difficulty: difficulty,
			powerups: powerups,
			ballSpeedStart: ballSpeedStart,
			ballSpeedMax: ballSpeedMax,
			ballSpeedIncrease: ballSpeedIncrease,
		};

		// Simuler une requête PATCH
		console.log("Envoi des paramètres au serveur...");
		simulatePatchRequest("/api/game-settings", gameSettings)
			.then((response) => {
				console.log("Réponse du serveur :", response);

				// Feedback visuel pour l'utilisateur
				const saveButton = document.getElementById("save-settings");
				// saveButton.textContent = "Saved!";
				// saveButton.disabled = true;

				// setTimeout(() => {
				//   saveButton.textContent = "SAVE";
				//   saveButton.disabled = false;
				// }, 1500);
			})
			.catch((error) => {
				console.error("Erreur lors de la sauvegarde :", error);
				alert("Une erreur est survenue lors de la sauvegarde des paramètres.");
			});
	}

// Fonction pour simuler une requête PATCH
	function simulatePatchRequest(url, data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log(`PATCH ${url}`, data);

				// Simuler une réponse de succès ou d'erreur
				const isSuccess = Math.random() > 0.1; // 90% de chances de succès
				if (isSuccess) {
					resolve({status: 200, message: "Settings updated successfully"});
				} else {
					reject({status: 500, message: "Server error"});
				}
			}, 1000); // Simule un délai de 1 seconde
		});
	}

// Ajouter un gestionnaire d'événement au bouton Save
	const saveButton = document.getElementById("save-settings");
	saveButton.addEventListener("click", saveGameSettings);

//GAME SHORTCUTS///////////////////////////////////////////////////////////////////////////////////////
// Fonction pour gérer la modification de la touche
// Fonction pour gérer la modification de la touche
	function handleKeyChange(event) {
		const button = event.target; // Le bouton cliqué

		// Vérifier si un bouton est déjà actif
		const activeButton = document.querySelector(".change-key.active");
		if (activeButton && activeButton !== button) {
			return; // Empêcher l'activation de plusieurs boutons
		}

		// Ajouter la classe active
		button.classList.add("active");

		// Supprimer le texte temporairement
		const oldKey = button.textContent; // Sauvegarder l'ancienne touche au cas où
		button.textContent = "";

		// Désactiver tous les autres boutons
		document.querySelectorAll(".change-key").forEach((otherButton) => {
			if (otherButton !== button) {
				otherButton.disabled = true;
			}
		});

		// Ajouter un écouteur pour capturer la prochaine touche pressée
		function onKeyPress(e) {
			const newKey = e.key.toUpperCase(); // Capturer la touche pressée

			// Vérifier si la touche est déjà assignée à un autre emplacement
			const existingButton = Array.from(
				document.querySelectorAll(".change-key")
			).find((otherButton) => otherButton.textContent === newKey);

			if (existingButton) {
				// Si la touche est déjà assignée, la supprimer de cet emplacement
				console.log(
					`Touche ${newKey} déjà assignée à ${existingButton.id}. Remplacée par null.`
				);
				existingButton.textContent = "";
			}

			// Assigner la nouvelle touche à l'emplacement courant
			button.textContent = newKey;

			// Retirer la classe active
			button.classList.remove("active");

			// Réactiver tous les boutons
			document.querySelectorAll(".change-key").forEach((otherButton) => {
				otherButton.disabled = false;
			});

			// Supprimer cet écouteur après avoir capturé une touche
			window.removeEventListener("keydown", onKeyPress);
		}

		// Ajouter un écouteur temporaire pour la prochaine touche pressée
		window.addEventListener("keydown", onKeyPress);
	}

// Ajouter un gestionnaire d'événements à tous les boutons configurables
	document.querySelectorAll(".change-key").forEach((button) => {
		button.addEventListener("click", handleKeyChange);
	});

// Fonction pour sauvegarder les paramètres
	function saveKeyboardSettings() {
		// Collecter les valeurs actuelles des touches
		const keySettings = {
			player1: {
				moveUp: document.getElementById("key-player1-moveUp").textContent,
				moveDown: document.getElementById("key-player1-moveDown").textContent,
				launchPower: document.getElementById("key-player1-launchPower").textContent,
			},
			player2: {
				moveUp: document.getElementById("key-player2-moveUp").textContent,
				moveDown: document.getElementById("key-player2-moveDown").textContent,
				launchPower: document.getElementById("key-player2-launchPower").textContent,
			},
		};

		// Simuler une requête PATCH
		console.log("Envoi des paramètres de clavier au serveur...");
		simulatePatchRequest("/api/keyboard-settings", keySettings)
			.then((response) => {
				console.log("Réponse du serveur :", response);

				// Feedback visuel pour l'utilisateur
				const saveButton = document.getElementById("save-keyboard-settings");
				// saveButton.textContent = "Saved!";
				// saveButton.disabled = true;

				// setTimeout(() => {
				//   saveButton.textContent = "Save Settings";
				//   saveButton.disabled = false;
				// }, 1500);
			})
			.catch((error) => {
				console.error("Erreur lors de la sauvegarde :", error);
				alert("Une erreur est survenue lors de la sauvegarde des paramètres.");
			});
	}

// Fonction pour simuler une requête PATCH
	function simulatePatchRequest(url, data) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				console.log(`PATCH ${url}`, data);

				// Simuler une réponse de succès ou d'erreur
				const isSuccess = Math.random() > 0.1; // 90% de chances de succès
				if (isSuccess) {
					resolve({
						status: 200,
						message: "Keyboard settings updated successfully",
					});
				} else {
					reject({status: 500, message: "Server error"});
				}
			}, 1000); // Simule un délai de 1 seconde
		});
	}

// Ajouter un gestionnaire d'événements à tous les boutons configurables
	document.querySelectorAll(".change-key").forEach((button) => {
		button.addEventListener("click", handleKeyChange);
	});

// Ajouter un gestionnaire d'événement au bouton Save
	document
		.getElementById("save-keyboard-settings")
		.addEventListener("click", saveKeyboardSettings);

// Simulation de données de la base de données
	const simulatedDatabaseResponse = {
		scoreToWin: "11",
		difficulty: "medium",
		powerups: ["flash", "inverse"],
		ballSpeedStart: "5",
		ballSpeedMax: "15",
		ballSpeedIncrease: "1",
		keyboardSettings: {
			player1: {
				moveUp: "W",
				moveDown: "S",
				launchPower: "E",
			},
			player2: {
				moveUp: "ArrowUp",
				moveDown: "ArrowDown",
				launchPower: "P",
			},
		},
	};

// Fonction pour initialiser un groupe de paramètres
	function setActiveButton(selector, value, attribute) {
		const button = document.querySelector(`${selector}[${attribute}="${value}"]`);
		if (button) {
			button.classList.add("active");
		} else {
			console.warn(`Aucun bouton trouvé pour ${attribute}="${value}"`);
		}
	}

// Fonction pour initialiser les touches de clavier
	function initializeKeyboardSettings(keyboardSettings) {
		Object.entries(keyboardSettings).forEach(([player, controls]) => {
			Object.entries(controls).forEach(([action, key]) => {
				const button = document.getElementById(`key-${player}-${action}`);
				if (button) {
					button.textContent = key;
				} else {
					console.warn(`Bouton non trouvé pour ${player} - ${action}`);
				}
			});
		});
	}

// Fonction pour initialiser les paramètres par défaut
	function initializeSettingsFromDatabase() {
		console.log("Initialisation des paramètres depuis la base de données...");

		const fetchSettings = new Promise((resolve) => {
			setTimeout(() => {
				resolve(simulatedDatabaseResponse);
			}, 500);
		});

		fetchSettings.then((settings) => {
			console.log("Paramètres récupérés :", settings);

			// Initialiser chaque section
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

			console.log("Paramètres initialisés avec succès.");
		});
	}

// Appeler la fonction lors de l'ouverture de la page
	initializeSettingsFromDatabase();

}
