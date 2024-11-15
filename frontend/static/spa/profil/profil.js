function resetPasswordFields() {
  const newFrame = document.getElementById("newFrame");
  const newPlusFrame = document.getElementById("newPlusFrame");
  const toggleChangePassword = document.getElementById("toggleChangePassword");

  if (newFrame && newPlusFrame && toggleChangePassword) {
    newFrame.style.display = "none";
    newPlusFrame.style.display = "none";
    toggleChangePassword.innerText = "Modify";
  }
}

// Fonction pour afficher un message de confirmation
function showConfirmationMessage(message) {
  const confirmationMessage = document.createElement("div");
  confirmationMessage.className = "confirmation-message";
  confirmationMessage.innerText = message;

  document.body.appendChild(confirmationMessage);

  // Supprimer le message après 3 secondes
  setTimeout(() => {
    confirmationMessage.remove();
  }, 3000);
}

// Fonction pour initialiser la gestion du mot de passe
function initializePasswordManagement() {
  const newFrame = document.getElementById("newFrame");
  const newPlusFrame = document.getElementById("newPlusFrame");
  const toggleChangePassword = document.getElementById("toggleChangePassword");

  // Supprimer tous les anciens écouteurs pour éviter les conflits
  const cloneToggleChangePassword = toggleChangePassword.cloneNode(true);
  toggleChangePassword.parentNode.replaceChild(
    cloneToggleChangePassword,
    toggleChangePassword
  );

  cloneToggleChangePassword.addEventListener("click", function () {
    const isHidden = newFrame.style.display === "none";
    cloneToggleChangePassword.innerText = isHidden ? "Cancel" : "Modify";
    newFrame.style.display = isHidden ? "block" : "none";
    newPlusFrame.style.display = isHidden ? "block" : "none";
  });
}

function loadMatchHistory() {
  fetch("/api/match-history/", {
    method: "GET",
    credentials: "include", // Le cookie est automatiquement envoyé par le navigateur
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.history) {
        updateMatchHistoryUI(data.history); // Appel de la fonction pour mettre à jour l'interface
      }
    })
    .catch((error) =>
      console.error(
        "Erreur lors de la récupération de l'historique des matchs:",
        error
      )
    );
}

function updateMatchHistoryUI(history) {
  console.log("fonction updateMatchHistory appele");

  const matchHistoryDiv = document.querySelector(".matchHistory");
  matchHistoryDiv.innerHTML = ""; // Réinitialise le contenu

  // Limiter l'affichage aux 5 derniers matchs
  const recentMatches = history.slice(0, 5); // Prenez les 5 premiers éléments (les plus récents)

  recentMatches.forEach((match) => {
    const matchResume = document.createElement("div");
    matchResume.className = "matchResume";

    // Avatar de l'utilisateur
    const userAvatar = document.createElement("img");
    userAvatar.className = "avatarHistory";
    userAvatar.src = match.user_avatar;
    userAvatar.alt = "User Avatar";

    // Score de l'utilisateur
    const userScore = document.createElement("div");
    userScore.className = "scorePlayer";
    userScore.textContent = match.score_user;

    // Séparateur
    const separator = document.createElement("div");
    separator.className = "separatorMatch";
    separator.textContent = "-";

    // Score de l'adversaire
    const opponentScore = document.createElement("div");
    opponentScore.className = "scorePlayer";
    opponentScore.textContent = match.score_opponent;

    // Avatar de l'adversaire
    const opponentAvatar = document.createElement("img");
    opponentAvatar.className = "avatarHistory";
    opponentAvatar.src = match.opponent_avatar;
    opponentAvatar.alt = "Opponent Avatar";

    // Résultat (victoire ou défaite)
    const resultLabel = document.createElement("div");
    resultLabel.className = "resultLabel";
    resultLabel.textContent = match.result;

    // Appliquer une couleur grise pour les défaites (style en ligne)
    if (match.result === "DEFEAT") {
      resultLabel.style.color = "#878787"; // Gris clair pour les défaites
    }

    // Ajout des éléments au conteneur de résumé de match
    matchResume.appendChild(userAvatar);
    matchResume.appendChild(userScore);
    matchResume.appendChild(separator);
    matchResume.appendChild(opponentScore);
    matchResume.appendChild(opponentAvatar);
    matchResume.appendChild(resultLabel);

    // Ajout à l'historique des matchs
    matchHistoryDiv.appendChild(matchResume);
  });
}

function loadUserStatistics() {
  fetch("/api/user/statistics/", {
    method: "GET",
    credentials: "include", // Permet d'envoyer le cookie de session
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Statistiques de l'utilisateur :", data);

      // Affichage des statistiques dans l'interface
      // document.getElementById("rank").innerText = data.rank;
      document.getElementById("total_games").innerText = data.total_games;
      // document.getElementById("total_wins").innerText = data.total_wins;
      document.getElementById("win_ratio").innerText =
        data.win_ratio.toFixed(2) + "%";
      // document.getElementById("power_catch_avg").innerText = data.power_catch_avg.toFixed(2);
      document.getElementById("ball_speed_avg").innerText =
        data.ball_speed_avg.toFixed(2);
      // document.getElementById("longest_rally").innerText = data.longest_rally;
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des statistiques :", error);
    });
}

function initializeProfilePage() {
  initializeAvatarFeature();
  resetPasswordFields();

  const userInput = document.getElementById("username");
  const emailInput = document.getElementById("registerEmail");
  const avatarDisplay = document.getElementById("avatarDisplay");
  const avatarInput = document.getElementById("avatarInput");
  const modifyButton = document.getElementById("modifyButton");
  const saveButton = document.getElementById("saveButton");
  const uploadButton = document.getElementById("uploadButton");

  initializePasswordManagement();
  initialize2FA();

  const unlockedColor = "#ff710d";

  const cloneModifyButton = modifyButton.cloneNode(true);
  modifyButton.parentNode.replaceChild(cloneModifyButton, modifyButton);

  cloneModifyButton.addEventListener("click", function () {
    if (userInput.disabled && emailInput.disabled) {
      userInput.disabled = false;
      emailInput.disabled = false;
      cloneModifyButton.style.backgroundColor = unlockedColor;
    } else {
      userInput.disabled = true;
      emailInput.disabled = true;
      cloneModifyButton.style.backgroundColor = "";
    }
  });

  uploadButton.addEventListener("click", function () {
    avatarInput.click();
  });

  avatarInput.addEventListener("change", function () {
    const avatarFile = avatarInput.files[0];

    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      fetch("/api/profil/update/", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.avatar) {
            avatarDisplay.src = data.avatar;
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour de l'avatar :", error);
          showErrorPopup(
            "Erreur lors de la mise à jour de l'avatar, veuillez réessayer.<br> Only JPG / JPEG / PNG format accepted"
          );
        });
    }
  });

  saveButton.addEventListener("click", function () {
    if (!userInput.disabled && !emailInput.disabled) {
      const updatedUsername = userInput.value;
      const updatedEmail = emailInput.value;
      const avatarFile = avatarInput.files[0];
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword =
        document.getElementById("confirmNewPassword").value;

      if (!updatedUsername || !updatedEmail) {
        showErrorPopup(
          "Le nom d'utilisateur et l'email ne peuvent pas être vides."
        );
        return;
      }

      if (newPassword || confirmNewPassword || oldPassword) {
        if (!oldPassword) {
          showErrorPopup("Veuillez saisir votre ancien mot de passe.");
          return;
        }
        if (newPassword !== confirmNewPassword) {
          showErrorPopup("Les nouveaux mots de passe ne correspondent pas.");
          return;
        }
      }

      const formData = new FormData();
      formData.append("username", updatedUsername);
      formData.append("email", updatedEmail);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      if (oldPassword && newPassword) {
        formData.append("old_password", oldPassword);
        formData.append("new_password", newPassword);
      }

      fetch("/api/profil/update/", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          document.getElementById("playerFrame").innerText = data.username;
          document.getElementById("username").value = data.username;
          document.getElementById("registerEmail").value = data.email;

          if (data.avatar) {
            avatarDisplay.src = data.avatar;
          }

          userInput.disabled = true;
          emailInput.disabled = true;
          cloneModifyButton.style.backgroundColor = "";
          resetPasswordFields();
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la mise à jour des informations :",
            error
          );
          showErrorPopup("Erreur lors de la mise à jour, veuillez réessayer.");
        });
    }
  });

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
        document.getElementById("playerFrame").innerText = data.username;
        document.getElementById("username").value = data.username;
        document.getElementById("registerEmail").value = data.email;

        if ("is_2fa_enabled" in data) {
          updateUI2FAStatus(data.is_2fa_enabled);
        }

        avatarDisplay.src = data.avatar || "/static/assets/avatars/buffalo.png";
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du profil:", error);
    });

  // Charger l'historique des matchs de l'utilisateur
  loadMatchHistory();
  loadUserStatistics();
}

https: function updateUI2FAStatus(enabled) {
  // const statusSpan = document.getElementById("2faStatus");
  const toggle2FAButton = document.getElementById("toggle2FAButton");
  const verificationFrame = document.getElementById("2faVerificationFrame");

  // if (!statusSpan || !toggle2FAButton || !verificationFrame) {
  if (!toggle2FAButton || !verificationFrame) {
    console.error("Éléments pour l'interface 2FA introuvables.");
    return;
  }

  toggle2FAButton.className = enabled ? 'btn-icon enabled' : 'btn-icon';
  const is2FAEnabled = enabled;
  // statusSpan.textContent = enabled ? "2FA: ON" : "2FA: OFF";
  // statusSpan.style.color = enabled ? "#4CAF50" : "#FF5722";

  toggle2FAButton.innerHTML = `
    <svg>
      <use href="/static/assets/icons/sprite.svg#${
        enabled ? "unlock" : "lock"
      }"></use>
    </svg>
    ${enabled ? '2FA ON' : '2FA OFF'}
  `;

  // Cacher le frame de vérification
  verificationFrame.style.display = "none";
}

function initialize2FA() {
  console.log("2FA initialisation appelée");

  const toggle2FAButton = document.getElementById("toggle2FAButton");
  const confirm2FAButton = document.getElementById("confirm2FAButton");
  const verificationFrame = document.getElementById("2faVerificationFrame");
  let is2FAEnabled = false;

  // Vérifiez le statut initial de la 2FA
  fetch("/api/profil/", {
    credentials: "include", // Envoie automatiquement les cookies, y compris l'access_token
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.is_2fa_enabled !== undefined) {
        updateUI2FAStatus(data.is_2fa_enabled);
        is2FAEnabled = data.is_2fa_enabled;
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la vérification du statut 2FA:", error);
    });

  // Retirer les anciens écouteurs pour éviter les doubles appels
  if (toggle2FAButton) {
    const cloneToggle2FAButton = toggle2FAButton.cloneNode(true);
    toggle2FAButton.parentNode.replaceChild(
      cloneToggle2FAButton,
      toggle2FAButton
    );

    cloneToggle2FAButton.addEventListener("click", function () {
      const action = is2FAEnabled ? "disable" : "enable";

      fetch("/api/2fa/toggle/", {
        method: "POST",
        credentials: "include", // Envoie automatiquement les cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: action }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (action === "enable") {
            verificationFrame.style.display = "flex";
            showConfirmationMessage("Code de vérification envoyé par email");
          } else {
            updateUI2FAStatus(false);
            showConfirmationMessage("2FA désactivé avec succès");
          }
          is2FAEnabled = !is2FAEnabled;
        })
        .catch((error) => {
          console.error("Erreur:", error);
          showConfirmationMessage("Une erreur est survenue");
        });
    });
  }

  // Retirer les anciens écouteurs pour éviter les doubles appels sur confirm2FAButton
  if (confirm2FAButton) {
    const cloneConfirm2FAButton = confirm2FAButton.cloneNode(true);
    confirm2FAButton.parentNode.replaceChild(
      cloneConfirm2FAButton,
      confirm2FAButton
    );

    cloneConfirm2FAButton.addEventListener("click", function () {
      const verificationCodeInput = document.getElementById("verificationCode");
      const code = verificationCodeInput ? verificationCodeInput.value : null;

      if (!code) {
        showConfirmationMessage("Veuillez entrer le code reçu par email");
        return;
      }

      fetch("/api/2fa/verify/", {
        method: "POST",
        credentials: "include", // Envoie automatiquement les cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Code invalide");
          }
          return response.json();
        })
        .then((data) => {
          updateUI2FAStatus(true);
          showConfirmationMessage("2FA activé avec succès");
          // Réinitialiser le champ du code
          if (verificationCodeInput) {
            verificationCodeInput.value = "";
          }
        })
        .catch((error) => {
          console.error("Erreur:", error);
          showConfirmationMessage("Code invalide");
        });
    });
  }
}

const avatarUrls = [
  "/static/assets/avatars/abeille.png",
  "/static/assets/avatars/buffalo.png",
  "/static/assets/avatars/bullfinch.png",
  "/static/assets/avatars/clown-fish.png",
  "/static/assets/avatars/crabe.png",
  "/static/assets/avatars/frog.png",
  "/static/assets/avatars/giraffe.png",
  "/static/assets/avatars/gorilla.png",
  "/static/assets/avatars/chicken.png",
  "/static/assets/avatars/hedgehog.png",
  "/static/assets/avatars/hippopotame.png",
  "/static/assets/avatars/ladybug.png",
  "/static/assets/avatars/lapin.png",
  "/static/assets/avatars/lelephant.png",
  "/static/assets/avatars/lion.png",
  "/static/assets/avatars/cow.png",
  "/static/assets/avatars/mouton.png",
  "/static/assets/avatars/owl.png",
  "/static/assets/avatars/parrot.png",
  "/static/assets/avatars/penguin.png",
  "/static/assets/avatars/walrus.png",
  "/static/assets/avatars/porc.png",
  "/static/assets/avatars/souris.png",
  "/static/assets/avatars/zebra.png",
];

let selectedAvatar = null;
let tempSelectedSrc = null;

function createAvatarGrid() {
  const avatarGrid = document.getElementById("avatarGrid");
  const applyButton = document.getElementById("applyButton");

  if (!avatarGrid) return;

  avatarGrid.innerHTML = "";

  for (let row = 0; row < 4; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "avatar-row";

    for (let col = 0; col < 6; col++) {
      const index = row * 6 + col;
      if (index < avatarUrls.length) {
        const avatarOption = document.createElement("div");
        avatarOption.className = "avatar-option";

        const img = document.createElement("img");
        img.src = avatarUrls[index];
        img.alt = `Avatar ${index + 1}`;
        avatarOption.appendChild(img);

        avatarOption.addEventListener("click", () => {
          // Supprimer la sélection précédente
          if (selectedAvatar) {
            selectedAvatar.classList.remove("selected");
          }
          // Mettre à jour la nouvelle sélection
          avatarOption.classList.add("selected");
          selectedAvatar = avatarOption;
          tempSelectedSrc = img.src;

          // Activer le bouton
          if (applyButton) {
            applyButton.disabled = false;
          }
          console.log("Avatar sélectionné:", tempSelectedSrc); // Debug
        });

        rowDiv.appendChild(avatarOption);
      }
    }
    avatarGrid.appendChild(rowDiv);
  }
}

function initializeAvatarFeature() {
  // const accessToken = localStorage.getItem("access_token");
  const modal = document.getElementById("avatarModal");
  const applyButton = document.getElementById("applyButton");

  // Création de la grille
  createAvatarGrid();

  if (applyButton) {
    applyButton.addEventListener("click", () => {
      if (tempSelectedSrc) {
        const formData = new FormData();
        formData.append(
          "selected_avatar",
          tempSelectedSrc.split("/static/")[1]
        );

        fetch("/api/profil/update/", {
          method: "PATCH",
          // headers: {
          //     Authorization: `Bearer ${accessToken}`,
          // },
          credentials: "include", // Le cookie est automatiquement envoyé par le navigateur
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Réponse reçue:", data); // Debug
            // Mettre à jour tous les avatars sur la page
            const avatarElements = document.querySelectorAll(".avatarImg");
            avatarElements.forEach((element) => {
              element.src = data.avatar; // Utiliser l'URL renvoyée par le serveur
            });

            // Mettre à jour l'avatar dans le profil si présent
            const avatarDisplay = document.getElementById("avatarDisplay");
            if (avatarDisplay) {
              avatarDisplay.src = data.avatar;
            }

            closeModal();
            console.log("Avatar mis à jour avec succès");
          })
          .catch((error) => {
            console.error("Erreur:", error);
            alert("Erreur lors de la mise à jour de l'avatar");
          });
      }
    });
  }

  window.openModal = function() {
    if (modal) {
        // Afficher la modal
        modal.style.display = 'flex';

        // Réinitialiser toute sélection précédente
        const previousSelected = document.querySelector('.avatar-option.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Réinitialiser les variables de sélection
        selectedAvatar = null;
        tempSelectedSrc = null;

        // Désactiver le bouton Apply
        if (applyButton) {
            applyButton.disabled = true;
        }
    }
};

  window.closeModal = function () {
    if (modal) {
      modal.style.display = "none";
      selectedAvatar = null;
      tempSelectedSrc = null;
      if (applyButton) {
        applyButton.disabled = true;
      }
    }
  };

  // Gestion du clic en dehors de la modal
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}


