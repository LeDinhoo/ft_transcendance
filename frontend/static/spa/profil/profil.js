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

function initializeProfilePage() {
  let accessToken = localStorage.getItem("access_token");
  console.log("Token récupéré:", accessToken);

  // Réinitialiser les champs de mot de passe à chaque chargement de la page profil
  resetPasswordFields();

  const userInput = document.getElementById("username");
  const emailInput = document.getElementById("registerEmail");
  const avatarDisplay = document.getElementById("avatarDisplay");
  const avatarInput = document.getElementById("avatarInput");
  const modifyButton = document.getElementById("modifyButton");
  const saveButton = document.getElementById("saveButton");
  const uploadButton = document.getElementById("uploadButton");

  // Appeler la fonction de gestion du mot de passe
  initializePasswordManagement();
  initialize2FA();
  // Couleur pour l'état déverrouillé
  const unlockedColor = "#ff710d"; // orange liquid lava lorsque déverrouillé

  // Supprimer tous les anciens écouteurs pour éviter les conflits
  const cloneModifyButton = modifyButton.cloneNode(true);
  modifyButton.parentNode.replaceChild(cloneModifyButton, modifyButton);

  cloneModifyButton.addEventListener("click", function () {
    if (userInput.disabled && emailInput.disabled) {
      userInput.disabled = false;
      emailInput.disabled = false;
      cloneModifyButton.style.backgroundColor = unlockedColor;
      console.log("Champs déverrouillés");
    } else {
      userInput.disabled = true;
      emailInput.disabled = true;
      cloneModifyButton.style.backgroundColor = "";
      console.log("Champs verrouillés");
    }
  });

  uploadButton.addEventListener("click", function () {
    avatarInput.click(); // Ouvre la fenêtre de sélection de fichier
  });

  // Quand un fichier est sélectionné, déclenche l'envoi de l'image
  avatarInput.addEventListener("change", function () {
    const avatarFile = avatarInput.files[0]; // Récupère le fichier sélectionné

    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile); // Ajoute l'avatar au FormData

      // Envoyer la requête PATCH pour mettre à jour l'avatar
      fetch("/api/profil/update/", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Mettre à jour l'affichage de l'avatar avec le nouveau fichier
          if (data.avatar) {
            avatarDisplay.src = data.avatar; // Affiche le nouvel avatar
          }
          console.log("Avatar mis à jour avec succès.");
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour de l'avatar :", error);
          // alert(
          //   "Erreur lors de la mise à jour de l'avatar, veuillez réessayer."
          // );

          showErrorPopup(
            "Erreur lors de la mise à jour de l'avatar, veuillez réessayer.<br> Only JPG / JPEG / PNG format accepted"
          );
        });
    }
  });

  // Sauvegarder les changements (y compris la modification de mot de passe)
  saveButton.addEventListener("click", function () {
    if (!userInput.disabled && !emailInput.disabled) {
      const updatedUsername = userInput.value;
      const updatedEmail = emailInput.value;
      const avatarFile = avatarInput.files[0];
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword =
        document.getElementById("confirmNewPassword").value;

      // Validation des champs
      if (!updatedUsername || !updatedEmail) {
        // alert("Le nom d'utilisateur et l'email ne peuvent pas être vides.");
        showErrorPopup(
          "Le nom d'utilisateur et l'email ne peuvent pas être vides."
        );
        return;
      }

      // Validation des mots de passe
      if (newPassword || confirmNewPassword || oldPassword) {
        if (!oldPassword) {
          // alert("Veuillez saisir votre ancien mot de passe.");
          showErrorPopup(
            "Veuillez saisir votre ancien mot de passe."
          );
          return;
        }
        if (newPassword !== confirmNewPassword) {
          showErrorPopup(
            "Les nouveaux mots de passe ne correspondent pas."
          );
          // alert("Les nouveaux mots de passe ne correspondent pas.");
          return;
        }
      }

      // Préparer les données pour la requête PATCH
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Mettre à jour l'interface utilisateur avec les nouvelles données
          document.getElementById("playerFrame").innerText = data.username;
          document.getElementById("username").value = data.username;
          document.getElementById("registerEmail").value = data.email;

          if (data.avatar) {
            avatarDisplay.src = data.avatar; // Mettre à jour l'image de l'avatar
          }

          // Verrouiller à nouveau les champs après mise à jour
          userInput.disabled = true;
          emailInput.disabled = true;
          cloneModifyButton.style.backgroundColor = "";
          console.log("Informations mises à jour et verrouillées");

          // Réinitialiser les champs de mot de passe
          resetPasswordFields();

          // Afficher un message de confirmation
          // showConfirmationMessage("Changements bien pris en compte !");
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la mise à jour des informations :",
            error
          );
          showErrorPopup(
            "Erreur lors de la mise à jour, veuillez réessayer."
          );
          // alert("Erreur lors de la mise à jour, veuillez réessayer.");
        });
    }
  });

  // Charger les informations du profil et de l'avatar lors du chargement de la page
  if (accessToken) {
    fetch("/api/profil/", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    })
    .then((response) => {
        console.log("Statut de la réponse:", response.status);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then((data) => {
        console.log("Données reçues:", data);
        if (data.username && data.email) {
            document.getElementById("playerFrame").innerText = data.username;
            document.getElementById("username").value = data.username;
            document.getElementById("registerEmail").value = data.email;
            
            // Mise à jour du statut 2FA si présent dans la réponse
            if ('is_2fa_enabled' in data) {
                updateUI2FAStatus(data.is_2fa_enabled);
            }

            if (data.avatar) {
                avatarDisplay.src = data.avatar;
            } else {
                avatarDisplay.src = "/static/assets/avatars/buffalo.png";
            }
        }
    })
    .catch((error) => {
        console.error("Erreur lors de la récupération du profil:", error);
    });
  }
}


///////////////////////////////////////////////////////////////////////


// Ajouter cette fonction à votre fichier profil.js existant

function initialize2FA() {
  const toggle2FAButton = document.getElementById('toggle2FAButton');
  const confirm2FAButton = document.getElementById('confirm2FAButton');
  const verificationFrame = document.getElementById('2faVerificationFrame');
  const statusSpan = document.getElementById('2faStatus');
  let is2FAEnabled = false;

  // Fonction pour mettre à jour l'interface selon le statut 2FA
  function updateUI2FAStatus(enabled) {
    is2FAEnabled = enabled;
    statusSpan.textContent = enabled ? '2FA: ON' : '2FA: OFF';
    statusSpan.style.color = enabled ? '#4CAF50' : '#FF5722';
    
    toggle2FAButton.innerHTML = `
      <svg>
        <use href="/static/assets/icons/sprite.svg#${enabled ? 'unlock' : 'lock'}"></use>
      </svg>
      ${enabled ? 'Disable 2FA' : 'Enable 2FA'}
    `;
    
    // Cacher le frame de vérification
    verificationFrame.style.display = 'none';
  }

  // Vérifier le statut initial de la 2FA
  fetch('/api/profil/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })
  .then(response => response.json())
  .then(data => {
    updateUI2FAStatus(data.is_2fa_enabled);
  })
  .catch(error => {
    console.error('Erreur lors de la vérification du statut 2FA:', error);
  });

  // Gestionnaire pour le bouton toggle 2FA
  toggle2FAButton.addEventListener('click', function() {
    const action = is2FAEnabled ? 'disable' : 'enable';
    
    fetch('/api/2fa/toggle/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: action })
    })
    .then(response => response.json())
    .then(data => {
      if (action === 'enable') {
        // Afficher le frame de vérification
        verificationFrame.style.display = 'flex';
        showConfirmationMessage('Code de vérification envoyé par email');
      } else {
        updateUI2FAStatus(false);
        showConfirmationMessage('2FA désactivé avec succès');
      }
    })
    .catch(error => {
      console.error('Erreur:', error);
      showConfirmationMessage('Une erreur est survenue');
    });
  });

  // Gestionnaire pour le bouton de confirmation
  confirm2FAButton.addEventListener('click', function() {
    const code = document.getElementById('verificationCode').value;
    
    if (!code) {
      showConfirmationMessage('Veuillez entrer le code reçu par email');
      return;
    }

    fetch('/api/2fa/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: code })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Code invalide');
      }
      return response.json();
    })
    .then(data => {
      updateUI2FAStatus(true);
      showConfirmationMessage('2FA activé avec succès');
      // Réinitialiser le champ du code
      document.getElementById('verificationCode').value = '';
    })
    .catch(error => {
      console.error('Erreur:', error);
      showConfirmationMessage('Code invalide');
    });
  });

  // Fermer le frame de vérification si on clique en dehors
  document.addEventListener('click', function(event) {
    if (!verificationFrame.contains(event.target) && 
        !toggle2FAButton.contains(event.target) &&
        verificationFrame.style.display === 'flex') {
      verificationFrame.style.display = 'none';
    }
  });
}


/////////////////////////////////////////////////////////////////////////