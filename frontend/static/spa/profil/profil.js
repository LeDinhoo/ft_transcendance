function updateProfilOnProfil() {
  console.log("fonction updateprofilonProfil appelee...")
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

      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du profil :", error);
    });
}

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

function showConfirmationMessage(message) {
  const confirmationMessage = document.createElement("div");
  confirmationMessage.className = "confirmation-message";
  confirmationMessage.innerText = message;

  document.body.appendChild(confirmationMessage);

  setTimeout(() => {
    confirmationMessage.remove();
  }, 3000);
}

function initializePasswordManagement() {
  const newFrame = document.getElementById("newFrame");
  const newPlusFrame = document.getElementById("newPlusFrame");
  const toggleChangePassword = document.getElementById("toggleChangePassword");

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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.history) {
        updateMatchHistoryUI(data.history);
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
  const matchHistoryDiv = document.querySelector(".matchHistory");
  matchHistoryDiv.innerHTML = `
    <div class="settingsHistory">Match History</div>
    <div class="matches-container"></div>
  `;

  const matchesContainer = matchHistoryDiv.querySelector(".matches-container");
  const recentMatches = history.slice(0, 5);

  recentMatches.forEach((match) => {
    const matchResume = document.createElement("div");
    matchResume.className = "matchResume";

    const gameDate = document.createElement("div");
    gameDate.className = "gameDate";
    gameDate.textContent = match.game_date;

    const userAvatar = document.createElement("img");
    userAvatar.className = "avatarHistory";
    userAvatar.src = match.user_avatar;
    userAvatar.alt = "User Avatar";

    const userScore = document.createElement("div");
    userScore.className = "scorePlayer";
    userScore.textContent = match.score_user;

    const separator = document.createElement("div");
    separator.className = "separatorMatch";
    separator.textContent = "-";

    const opponentScore = document.createElement("div");
    opponentScore.className = "scorePlayer";
    opponentScore.textContent = match.score_opponent;

    const opponentAvatar = document.createElement("img");
    opponentAvatar.className = "avatarHistory";
    opponentAvatar.src = match.opponent_avatar;
    opponentAvatar.alt = "Opponent Avatar";

    const resultLabel = document.createElement("div");
    resultLabel.className = "resultLabel";
    resultLabel.textContent = match.result;

    if (match.result === "DEFEAT") {
      resultLabel.style.color = "#878787";
    }

    matchResume.appendChild(gameDate);   
    matchResume.appendChild(userAvatar);
    matchResume.appendChild(userScore);
    matchResume.appendChild(separator);
    matchResume.appendChild(opponentScore);
    matchResume.appendChild(opponentAvatar);
    matchResume.appendChild(resultLabel);

    matchHistoryDiv.appendChild(matchResume);
  });
}

function loadUserStatistics() {
  fetch("/api/user/statistics/", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Statistiques de l'utilisateur :", data);

      document.getElementById("total_games").innerText = data.total_games;
      document.getElementById("win_ratio").innerText = data.win_ratio.toFixed(2) + "%";
      document.getElementById("max_ball_speed").innerText = data.max_ball_speed.toFixed(2);
      document.getElementById("longest_rally").innerText = data.longest_rally;
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
      .then(async (response) => {
          const data = await response.json();
          if (!response.ok) {
              // On récupère le message d'erreur du backend
              throw new Error(data.error);
          }
          return data;
      })
      .then((data) => {
          if (data.avatar) {
              avatarDisplay.src = data.avatar;
          }
      })
      .catch((error) => {
          console.error("Erreur lors de la mise à jour de l'avatar :", error);
          showErrorPopup(error.message || "Une erreur est survenue lors de la mise à jour");
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
      .then(async (response) => {
          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.error);
          }
          
          return data;
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
          console.error("Erreur lors de la mise à jour des informations :", error);
          showErrorPopup(error.message || "Une erreur est survenue lors de la mise à jour");
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
  
        // Mise à jour du rank
        if (data.rank) {
          document.getElementById("profileRankIcon").src = `/static/assets/icons/${data.rank.toLowerCase()}.png`;
          document.getElementById("profileRankText").textContent = data.rank;
        }
  
        avatarDisplay.src = data.avatar || "/static/assets/avatars/buffalo.png";
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du profil:", error);
    });

  loadMatchHistory();
  loadUserStatistics();
  updateProfilOnProfil();
}

function showTwoFactorPopup() {
  const existingPopup = document.querySelector(".popup-overlay");
  if (existingPopup) {
    console.log("Une pop-up 2FA existe déjà, pas besoin de recréer.");
    return;
  }

  console.log("Création d'une nouvelle pop-up 2FA...");
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.innerHTML = `
      <div class="popup-content">
          <h3>Vérification en deux étapes</h3>
          <p>Un code a été envoyé à votre adresse email</p>
          <div class="code-input-container">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
          </div>
          <div class="timer">Code valide pendant: <span id="countdown">10:00</span></div>
          <button class="verify-button" id="verifyButton" disabled>Vérifier</button>
          <p class="error-message" style="display: none;"></p>
      </div>
  `;

  document.body.appendChild(popup);

  setupCodeInputsForProfile();
  startCountdown(10 * 60);

  return popup;
}

function setupCodeInputsForProfile() {
  const inputs = document.querySelectorAll(".code-input");
  const verifyButton = document.getElementById("verifyButton");

  inputs.forEach((input, index) => {
    if (index === 0) input.focus();

    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");

      if (e.target.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      const isComplete = Array.from(inputs).every(
        (input) => input.value.length === 1
      );
      verifyButton.disabled = !isComplete;
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  verifyButton.addEventListener("click", async () => {
    const code = Array.from(inputs)
      .map((input) => input.value)
      .join("");
    verifyTwoFactorCodeForProfile(code);
  });
}

async function verifyTwoFactorCodeForProfile(code) {
  const verifyButton = document.getElementById("verifyButton");
  const errorMessage = document.querySelector(".error-message");

  try {
    verifyButton.disabled = true;
    verifyButton.textContent = "Vérification...";

    const response = await fetch("/api/2fa/verify/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("2FA activé avec succès.");
      const popup = document.querySelector(".popup-overlay");
      if (popup) popup.remove();
      updateUI2FAStatus(true);
      showConfirmationMessage(data.message);
    } else {
      errorMessage.textContent = data.message || "Code invalide.";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    console.error("Erreur lors de la validation 2FA :", error);
    errorMessage.textContent = "Une erreur est survenue.";
    errorMessage.style.display = "block";
  } finally {
    verifyButton.textContent = "Vérifier";
    verifyButton.disabled = false;
  }
}

function startCountdown(duration) {
  const countdownElement = document.getElementById("countdown");
  if (!countdownElement) {
    console.error("Élément pour le compte à rebours introuvable.");
    return;
  }

  let timer = duration;

  const countdown = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    countdownElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (--timer < 0) {
      clearInterval(countdown);
      countdownElement.textContent = "Code expiré";
      document.getElementById("verifyButton").disabled = true;
    }
  }, 1000);
}

https: function updateUI2FAStatus(enabled) {
  const toggle2FAButton = document.getElementById("toggle2FAButton");
  const verificationFrame = document.getElementById("2faVerificationFrame");

  if (!toggle2FAButton || !verificationFrame) {
    console.error(
      "Éléments pour la mise à jour de l'interface 2FA introuvables."
    );
    return;
  }

  toggle2FAButton.className = enabled ? "btn-icon enabled" : "btn-icon";
  toggle2FAButton.innerHTML = `
 <img src="/static/assets/icons/${enabled ? 'check' : 'close'}.svg" class="popuplogo" />
  ${enabled ? "2FA On" : "2FA Off"}
`;

  verificationFrame.style.display = "none";

  console.log(
    `2FA ${enabled ? "activé" : "désactivé"} : interface mise à jour.`
  );
}

function initialize2FA() {
  console.log("Initialisation de la 2FA");

  const toggle2FAButton = document.getElementById("toggle2FAButton");
  const verificationFrame = document.getElementById("2faVerificationFrame");
  let is2FAEnabled = false;

  if (!toggle2FAButton || !verificationFrame) {
    console.error("Éléments pour la gestion de la 2FA introuvables.");
    return;
  }

  fetch("/api/profil/", {
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du profil");
      }
      return response.json();
    })
    .then((data) => {
      if (data.is_2fa_enabled !== undefined) {
        is2FAEnabled = data.is_2fa_enabled;
        updateUI2FAStatus(is2FAEnabled);
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du statut 2FA :", error);
    });

  const cloneToggle2FAButton = toggle2FAButton.cloneNode(true);
  toggle2FAButton.parentNode.replaceChild(
    cloneToggle2FAButton,
    toggle2FAButton
  );

  cloneToggle2FAButton.addEventListener("click", () => {
    const action = is2FAEnabled ? "disable" : "enable";

    fetch("/api/2fa/toggle/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de l'activation/désactivation 2FA");
        }
        return response.json();
      })
      .then((data) => {
        if (action === "enable") {
          if (!document.querySelector(".popup-overlay")) {
            showTwoFactorPopup();
          }
          showConfirmationMessage("Code de vérification envoyé par email.");
        } else {
          is2FAEnabled = false;
          updateUI2FAStatus(is2FAEnabled);
          showConfirmationMessage("2FA désactivé avec succès.");
        }
      })
      .catch((error) => {
        console.error("Erreur lors du basculement de la 2FA :", error);
        showConfirmationMessage("Une erreur est survenue.");
      });
  });
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
          if (selectedAvatar) {
            selectedAvatar.classList.remove("selected");
          }
          avatarOption.classList.add("selected");
          selectedAvatar = avatarOption;
          tempSelectedSrc = img.src;

          if (applyButton) {
            applyButton.disabled = false;
          }
          console.log("Avatar sélectionné:", tempSelectedSrc);
        });

        rowDiv.appendChild(avatarOption);
      }
    }
    avatarGrid.appendChild(rowDiv);
  }
}

function initializeAvatarFeature() {
  const modal = document.getElementById("avatarModal");
  const applyButton = document.getElementById("applyButton");

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
          credentials: "include",
          body: formData,
          })
          .then(async (response) => {
              const data = await response.json();
              console.log("Réponse brute du serveur:", data);
              
              if (!response.ok) {
                  throw new Error(data.error || `Erreur HTTP: ${response.status}`);
              }
              
              return data;
          })
          .then((data) => {
              console.log("Réponse reçue:", data);
          
              const avatarElements = document.querySelectorAll(".avatarImg");
              avatarElements.forEach((element) => {
                  element.src = data.avatar;
              });
          
              const avatarDisplay = document.getElementById("avatarDisplay");
              if (avatarDisplay) {
                  avatarDisplay.src = data.avatar;
              }
          
              closeModal();
              console.log("Avatar mis à jour avec succès");
          })
          .catch((error) => {
              console.error("Erreur détaillée:", error);
              showErrorPopup(error.message || "Erreur lors de la mise à jour de l'avatar");
          });
          }
    });
  }

  window.openModal = function () {
    if (modal) {
      modal.style.display = "flex";

      const previousSelected = document.querySelector(
        ".avatar-option.selected"
      );
      if (previousSelected) {
        previousSelected.classList.remove("selected");
      }

      selectedAvatar = null;
      tempSelectedSrc = null;

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

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
}

function loadFriendRequests() {
    fetch('/api/friends/pending/', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const requestsList = document.getElementById('friendRequestsList');
        if (!data.pending_requests.length) {
            requestsList.innerHTML = '<div class="no-requests">No pending friend requests</div>';
            return;
        }

        requestsList.innerHTML = data.pending_requests.map(request => `
            <div class="friendRequest">
                <img class="requestAvatar" src="${request.sender.avatar}" alt="${request.sender.username}">
                <div class="requestInfo">
                    <div class="requestUsername">${request.sender.username}</div>
                </div>
                <div class="requestActions">
                    <button class="acceptButton" onclick="handleFriendRequest(${request.request_id}, 'accept')">
                        Accept
                    </button>
                    <button class="rejectButton" onclick="handleFriendRequest(${request.request_id}, 'reject')">
                        Reject
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => console.error('Error loading friend requests:', error));
}

// function handleFriendRequest(requestId, action) {
//     fetch('/api/friends/handle-request/', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ request_id: requestId, action })
//     })
//     .then(response => response.json())
//     .then(() => {
//         loadFriendRequests();
//         if (action === 'accept') {
//             // Créer un événement personnalisé avec des détails
//             const event = new CustomEvent('friendRequestAccepted', {
//                 detail: { requestId, action },
//                 bubbles: true,
//                 composed: true
//             });
//             document.dispatchEvent(event);
            
//             // Forcer une mise à jour immédiate si wsManager est disponible
//             if (window.wsManager && window.wsManager.onlinePlayers) {
//                 console.log("Mise à jour de la liste des joueurs en ligne après acceptation d'ami");
//                 window.wsManager.updateOnlinePlayersList([...window.wsManager.onlinePlayers]);
//             }
//         }
//     })
//     .catch(error => console.error('Error handling friend request:', error));
// }

async function handleFriendRequest(requestId, action) {
    try {
        const response = await fetch('/api/friends/handle-request/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ request_id: requestId, action })
        });

        if (response.ok) {
            // Mettre à jour la liste des demandes d'ami
            loadFriendRequests();
            
            // Utiliser la méthode correcte de wsManager
            if (window.wsManager && window.wsManager.onlinePlayers) {
                await window.wsManager.updateOnlinePlayersList([...window.wsManager.onlinePlayers]);
            }

            // Afficher un message de confirmation
            showConfirmationMessage(`Friend request ${action}ed successfully`);
        }
    } catch (error) {
        console.error('Error handling friend request:', error);
    }
}
