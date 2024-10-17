//let accessToken = localStorage.getItem("access_token");
//console.log("Token récupéré:", accessToken);
//
//
//const userInput = document.getElementById("username");
//const emailInput = document.getElementById("registerEmail");
//const modifyButton = document.getElementById("modifyButton");
//
//modifyButton.addEventListener("click", function () {
//  if (userInput.disabled && emailInput.disabled) {
//    userInput.disabled = false;
//    emailInput.disabled = false;
//    userInput.classList.remove("locked");
//    emailInput.classList.remove("locked");
//    console.log("Jai deverouiller");
//  } else {
//    userInput.disabled = true;
//    emailInput.disabled = true;
//    userInput.classList.add("locked");
//    emailInput.classList.add("locked");
//    console.log("Jai verouiller");
//  }
//});
//
//if (accessToken) {
//  fetch("/api/profil/", {
//    method: "GET",
//    headers: {
//      Authorization: `Bearer ${accessToken}`,
//      "Content-Type": "application/json",
//    },
//  })
//    .then((response) => {
//      if (!response.ok) {
//        throw new Error(`Erreur HTTP: ${response.status}`);
//      }
//      return response.json();
//    })
//    .then((data) => {
//      if (data.username && data.email) {
//        // Met à jour les champs du formulaire avec les valeurs récupérées
//        document.getElementById("playerFrame").innerText = data.username;
//        document.getElementById("username").value = data.username;
//        document.getElementById("registerEmail").value = data.email;
//
//      } else {
//        console.error(
//          "Erreur lors de la récupération des informations utilisateur"
//        );
//      }
//    })
//    .catch((error) => {
//      console.error("Erreur lors de la récupération du profil :", error);
//    });
//} else {
//  console.log("Aucun token JWT trouvé.");
//}

// function initializeProfilePage() {
//   let accessToken = localStorage.getItem("access_token");
//   console.log("Token récupéré:", accessToken);

//   const userInput = document.getElementById("username");
//   const emailInput = document.getElementById("registerEmail");
//   const avatarInput = document.getElementById("avatarInput");
//   const avatarDisplay = document.getElementById("avatarDisplay");
//   const modifyButton = document.getElementById("modifyButton");
//   const saveButton = document.getElementById("saveButton");

//   // Couleur pour l'état déverrouillé
//   const unlockedColor = "#ff710d"; // orange liquid lava lorsque déverrouillé

//   // Déverrouiller les champs pour modification
//   modifyButton.addEventListener("click", function () {
//     if (userInput.disabled && emailInput.disabled) {
//       userInput.disabled = false;
//       emailInput.disabled = false;
//       modifyButton.style.backgroundColor = unlockedColor;
//       console.log("Champs déverrouillés");
//     } else {
//       userInput.disabled = true;
//       emailInput.disabled = true;
//       modifyButton.style.backgroundColor = "";
//       console.log("Champs verrouillés");
//     }
//   });

//   // Sauvegarder les changements
//   saveButton.addEventListener("click", function () {
//     if (!userInput.disabled && !emailInput.disabled) {
//       const updatedUsername = userInput.value;
//       const updatedEmail = emailInput.value;
//       const avatarFile = avatarInput.files[0]; // Récupérer le fichier avatar

//       // Validation basique des champs
//       if (!updatedUsername || !updatedEmail) {
//         alert("Le nom d'utilisateur et l'email ne peuvent pas être vides.");
//         return;
//       }

//       const formData = new FormData(); // Utilisation de FormData pour envoyer des fichiers
//       formData.append("username", updatedUsername);
//       formData.append("email", updatedEmail);
//       if (avatarFile) {
//         formData.append("avatar", avatarFile); // Ajouter le fichier avatar s'il est sélectionné
//       }

//       // fetch("/api/profil/update/", {
//       //   method: "PATCH",
//       //   headers: {
//       //     Authorization: `Bearer ${accessToken}`,
//       //     "Content-Type": "application/json",
//       //   },
//       //   body: JSON.stringify({
//       //     username: updatedUsername,
//       //     email: updatedEmail,
//       //   }),
//       // })
//       fetch("/api/profil/update/", {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: formData,
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`Erreur HTTP: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           // Mettre à jour l'interface utilisateur avec les nouvelles données
//           document.getElementById("playerFrame").innerText = data.username;
//           document.getElementById("username").value = data.username;
//           document.getElementById("registerEmail").value = data.email;

//           if (data.avatar) {
//             avatarDisplay.src = data.avatar; // Mettre à jour l'image de l'avatar
//           }

//           // Verrouiller à nouveau les champs après mise à jour réussie
//           userInput.disabled = true;
//           emailInput.disabled = true;
//           modifyButton.style.backgroundColor = "";
//           console.log("Informations mises à jour et verrouillées");
//         })
//         .catch((error) => {
//           console.error(
//             "Erreur lors de la mise à jour des informations :",
//             error
//           );
//           alert("Erreur lors de la mise à jour, veuillez réessayer.");
//         });
//     }
//   });

//   // Charger les informations du profil lors du chargement de la page
//   if (accessToken) {
//     fetch("/api/profil/", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Erreur HTTP: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         if (data.username && data.email) {
//           // Met à jour les champs du formulaire avec les valeurs récupérées
//           document.getElementById("playerFrame").innerText = data.username;
//           document.getElementById("username").value = data.username;
//           document.getElementById("registerEmail").value = data.email;
//           if (data.avatar) {
//             avatarDisplay.src = data.avatar; // Afficher l'avatar actuel
//           }
//         } else {
//           console.error(
//             "Erreur lors de la récupération des informations utilisateur"
//           );
//         }
//       })
//       .catch((error) => {
//         console.error("Erreur lors de la récupération du profil :", error);
//       });
//   } else {
//     console.log("Aucun token JWT trouvé.");
//   }
// }



//ca fonctionne presque

// // Fonction pour réinitialiser les champs de mot de passe
// function resetPasswordFields() {
//   const newFrame = document.getElementById("newFrame");
//   const newPlusFrame = document.getElementById("newPlusFrame");
//   const toggleChangePassword = document.getElementById("toggleChangePassword");

//   if (newFrame && newPlusFrame && toggleChangePassword) {
//     newFrame.style.display = "none";
//     newPlusFrame.style.display = "none";
//     toggleChangePassword.innerText = "Modify";
//   }
// }

// // Fonction pour initialiser la gestion du mot de passe
// function initializePasswordManagement() {
//   const newFrame = document.getElementById("newFrame");
//   const newPlusFrame = document.getElementById("newPlusFrame");
//   const toggleChangePassword = document.getElementById("toggleChangePassword");

//   toggleChangePassword.addEventListener("click", function () {
//     const isHidden = newFrame.style.display === "none";
//     toggleChangePassword.innerText = isHidden ? "Cancel" : "Modify";
//     newFrame.style.display = isHidden ? "block" : "none";
//     newPlusFrame.style.display = isHidden ? "block" : "none";
//   });
// }

// function initializeProfilePage() {
//   let accessToken = localStorage.getItem("access_token");
//   console.log("Token récupéré:", accessToken);

//   // Réinitialiser les champs de mot de passe à chaque chargement de la page profil
//   resetPasswordFields();

//   const userInput = document.getElementById("username");
//   const emailInput = document.getElementById("registerEmail");
//   const avatarDisplay = document.getElementById("avatarDisplay");
//   const avatarInput = document.getElementById("avatarInput");
//   const modifyButton = document.getElementById("modifyButton");
//   const saveButton = document.getElementById("saveButton");
//   const uploadButton = document.getElementById("uploadButton");
//   // Appeler la fonction de gestion du mot de passe
//   initializePasswordManagement();
//   // Couleur pour l'état déverrouillé
//   const unlockedColor = "#ff710d"; // orange liquid lava lorsque déverrouillé

//   // Déverrouiller les champs pour modification
//   modifyButton.addEventListener("click", function () {
//     if (userInput.disabled && emailInput.disabled) {
//       userInput.disabled = false;
//       emailInput.disabled = false;
//       modifyButton.style.backgroundColor = unlockedColor;
//       console.log("Champs déverrouillés");
//     } else {
//       userInput.disabled = true;
//       emailInput.disabled = true;
//       modifyButton.style.backgroundColor = "";
//       console.log("Champs verrouillés");
//     }
//   });

//   uploadButton.addEventListener("click", function () {
//     avatarInput.click(); // Ouvre la fenêtre de sélection de fichier
//   });

//   // Quand un fichier est sélectionné, déclenche l'envoi de l'image
//   avatarInput.addEventListener("change", function () {
//     const avatarFile = avatarInput.files[0]; // Récupère le fichier sélectionné

//     if (avatarFile) {
//       const formData = new FormData();
//       formData.append("avatar", avatarFile); // Ajoute l'avatar au FormData

//       // Envoyer la requête PATCH pour mettre à jour l'avatar
//       fetch("/api/profil/update/", {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: formData,
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`Erreur HTTP: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           // Mettre à jour l'affichage de l'avatar avec le nouveau fichier
//           if (data.avatar) {
//             avatarDisplay.src = data.avatar; // Affiche le nouvel avatar
//           }
//           console.log("Avatar mis à jour avec succès.");
//         })
//         .catch((error) => {
//           console.error("Erreur lors de la mise à jour de l'avatar :", error);
//           alert("Erreur lors de la mise à jour de l'avatar, veuillez réessayer.");
//         });
//     }
//   });

//   // Sauvegarder les changements (sans inclure l'avatar ici)
//   saveButton.addEventListener("click", function () {
//     if (!userInput.disabled && !emailInput.disabled) {
//       const updatedUsername = userInput.value;
//       const updatedEmail = emailInput.value;
//       const avatarFile = avatarInput.files[0];
//       // Validation des champs
//       if (!updatedUsername || !updatedEmail) {
//         alert("Le nom d'utilisateur et l'email ne peuvent pas être vides.");
//         return;
//       }

//       // Préparer les données pour la requête PATCH
//       const formData = new FormData();
//       formData.append("username", updatedUsername);
//       formData.append("email", updatedEmail);
//       if (avatarFile) {
//         formData.append("avatar", avatarFile);
//       }


//       fetch("/api/profil/update/", {
//         method: "PATCH",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: formData,
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`Erreur HTTP: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           // Mettre à jour l'interface utilisateur avec les nouvelles données
//           document.getElementById("playerFrame").innerText = data.username;
//           document.getElementById("username").value = data.username;
//           document.getElementById("registerEmail").value = data.email;

//           if (data.avatar) {
//             avatarDisplay.src = data.avatar; // Mettre à jour l'image de l'avatar
//           }

//           // Verrouiller à nouveau les champs après mise à jour
//           userInput.disabled = true;
//           emailInput.disabled = true;
//           modifyButton.style.backgroundColor = "";
//           console.log("Informations mises à jour et verrouillées");
//         })
//         .catch((error) => {
//           console.error("Erreur lors de la mise à jour des informations :", error);
//           alert("Erreur lors de la mise à jour, veuillez réessayer.");
//         });
//     }
//   });

//   // Charger les informations du profil et de l'avatar lors du chargement de la page
//   if (accessToken) {
//     fetch("/api/profil/", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Erreur HTTP: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         if (data.username && data.email) {
//           // Met à jour les champs du formulaire avec les valeurs récupérées
//           document.getElementById("playerFrame").innerText = data.username;
//           document.getElementById("username").value = data.username;
//           document.getElementById("registerEmail").value = data.email;

//           // Remplacer l'avatar par celui dans la base de données
//           if (data.avatar) {
//             avatarDisplay.src = data.avatar; // Afficher l'avatar de la base de données
//           } else {
//             avatarDisplay.src = '/static/assets/avatars/buffalo.png'; // Utiliser l'avatar par défaut s'il n'y en a pas
//           }
//         } else {
//           console.error("Erreur lors de la récupération des informations utilisateur");
//         }
//       })
//       .catch((error) => {
//         console.error("Erreur lors de la récupération du profil :", error);
//       });
//   } else {
//     console.log("Aucun token JWT trouvé.");
//   }
// }

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

// Fonction pour initialiser la gestion du mot de passe
function initializePasswordManagement() {
  const newFrame = document.getElementById("newFrame");
  const newPlusFrame = document.getElementById("newPlusFrame");
  const toggleChangePassword = document.getElementById("toggleChangePassword");

  // Supprimer tous les anciens écouteurs pour éviter les conflits
  const cloneToggleChangePassword = toggleChangePassword.cloneNode(true);
  toggleChangePassword.parentNode.replaceChild(cloneToggleChangePassword, toggleChangePassword);

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
          alert("Erreur lors de la mise à jour de l'avatar, veuillez réessayer.");
        });
    }
  });

  // Sauvegarder les changements (sans inclure l'avatar ici)
  saveButton.addEventListener("click", function () {
    if (!userInput.disabled && !emailInput.disabled) {
      const updatedUsername = userInput.value;
      const updatedEmail = emailInput.value;
      const avatarFile = avatarInput.files[0];
      // Validation des champs
      if (!updatedUsername || !updatedEmail) {
        alert("Le nom d'utilisateur et l'email ne peuvent pas être vides.");
        return;
      }

      // Préparer les données pour la requête PATCH
      const formData = new FormData();
      formData.append("username", updatedUsername);
      formData.append("email", updatedEmail);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
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
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour des informations :", error);
          alert("Erreur lors de la mise à jour, veuillez réessayer.");
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
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.username && data.email) {
          // Met à jour les champs du formulaire avec les valeurs récupérées
          document.getElementById("playerFrame").innerText = data.username;
          document.getElementById("username").value = data.username;
          document.getElementById("registerEmail").value = data.email;

          // Remplacer l'avatar par celui dans la base de données
          if (data.avatar) {
            avatarDisplay.src = data.avatar; // Afficher l'avatar de la base de données
          } else {
            avatarDisplay.src = '/static/assets/avatars/buffalo.png'; // Utiliser l'avatar par défaut s'il n'y en a pas
          }
        } else {
          console.error("Erreur lors de la récupération des informations utilisateur");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du profil :", error);
      });
  } else {
    console.log("Aucun token JWT trouvé.");
  }
}
