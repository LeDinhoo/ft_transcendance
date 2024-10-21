// const oldPassword = document.getElementById("oldPassword");
// const newPassword = document.getElementById("newPassword");
// const confirmNewPassword = document.getElementById("confirmNewPassword");

// const toggleOldPassword = document.getElementById("toggleOldPassword");
// const toggleNewPassword = document.getElementById("toggleNewPassword");
// const toggleConfirmNewPassword = document.getElementById(
//   "toggleConfirmNewPassword"
// );

// toggleOldPassword.addEventListener("click", function () {
//   const type =
//     oldPassword.getAttribute("type") === "password" ? "text" : "password";
//   oldPassword.setAttribute("type", type);

//   this.src =
//     type === "password"
//       ? "/static/assets/icons/vibility.png"
//       : "/static/assets/icons/vibility_off.png";
// });

// toggleNewPassword.addEventListener("click", function () {
//   const type =
//     newPassword.getAttribute("type") === "password" ? "text" : "password";
//   newPassword.setAttribute("type", type);

//   this.src =
//     type === "password"
//       ? "/static/assets/icons/vibility.png"
//       : "/static/assets/icons/vibility_off.png";
// });

// toggleConfirmNewPassword.addEventListener("click", function () {
//   const type =
//     confirmNewPassword.getAttribute("type") === "password"
//       ? "text"
//       : "password";
//   confirmNewPassword.setAttribute("type", type);

//   this.src =
//     type === "password"
//       ? "/static/assets/icons/vibility.png"
//       : "/static/assets/icons/vibility_off.png";
// });

// const newFrame = document.getElementById("newFrame");
// const newPlusFrame = document.getElementById("newPlusFrame");

// newFrame.style.display = "none";
// newPlusFrame.style.display = "none";

// const toggleChangePassword = document.getElementById("toggleChangePassword");

// toggleChangePassword.addEventListener("click", function () {
//   const type = newFrame.style.display === "none" ? "block" : "none";
//   toggleChangePassword.innerText = type === "none" ? "Modify" : "Cancel";
//   newFrame.style.display = type;
//   newPlusFrame.style.display = type;
// });

// FONCTIONNE MAIS NE SE RECHARGE PAS
// const oldPassword = document.getElementById("oldPassword");
// const newPassword = document.getElementById("newPassword");
// const confirmNewPassword = document.getElementById("confirmNewPassword");

// const toggleOldPassword = document.getElementById("toggleOldPassword");
// const toggleNewPassword = document.getElementById("toggleNewPassword");
// const toggleConfirmNewPassword = document.getElementById(
//   "toggleConfirmNewPassword"
// );

// toggleOldPassword.addEventListener("click", function () {
//   const type =
//     oldPassword.getAttribute("type") === "password" ? "text" : "password";
//   oldPassword.setAttribute("type", type);

//   this.src =
//     type === "password"
//       ? "/static/assets/icons/vibility.png"
//       : "/static/assets/icons/vibility_off.png";
// });

// toggleNewPassword.addEventListener("click", function () {
//   const type =
//     newPassword.getAttribute("type") === "password" ? "text" : "password";
//   newPassword.setAttribute("type", type);

//   this.src =
//     type === "password"
//       ? "/static/assets/icons/vibility.png"
//       : "/static/assets/icons/vibility_off.png";
// });

// toggleConfirmNewPassword.addEventListener("click", function () {
//   const type =
//     confirmNewPassword.getAttribute("type") === "password"
//       ? "text"
//       : "password";
//   confirmNewPassword.setAttribute("type", type);

//   this.src =
//     type === "password"
//       ? "/static/assets/icons/vibility.png"
//       : "/static/assets/icons/vibility_off.png";
// });

// const newFrame = document.getElementById("newFrame");
// const newPlusFrame = document.getElementById("newPlusFrame");

// newFrame.style.display = "none";
// newPlusFrame.style.display = "none";

// const toggleChangePassword = document.getElementById("toggleChangePassword");

// toggleChangePassword.addEventListener("click", function () {
//   const type = newFrame.style.display === "none" ? "block" : "none";
//   toggleChangePassword.innerText = type === "none" ? "Modify" : "Cancel";
//   newFrame.style.display = type;
//   newPlusFrame.style.display = type;
// });
function initializePasswordVisibility() {
  // Fonction pour gérer la visibilité des champs de mot de passe
  function toggleVisibility(passwordField, toggleButton) {
    if (!passwordField || !toggleButton) return; // Vérifie que les éléments existent

    toggleButton.addEventListener("click", function () {
      const type =
        passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);

      // Change l'icône selon la visibilité du champ
      if (type === "password") {
        toggleButton.src = "/static/assets/icons/vibility.png"; // Icône pour champ masqué
      } else {
        toggleButton.src = "/static/assets/icons/vibility_off.png"; // Icône pour champ visible
      }
    });
  }

  // Obtenir les champs de mot de passe et les boutons de visibilité
  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmNewPassword = document.getElementById("confirmNewPassword");

  const toggleOldPassword = document.getElementById("toggleOldPassword");
  const toggleNewPassword = document.getElementById("toggleNewPassword");
  const toggleConfirmNewPassword = document.getElementById(
    "toggleConfirmNewPassword"
  );

  // Attacher la visibilité pour chaque champ de mot de passe
  toggleVisibility(oldPassword, toggleOldPassword);
  toggleVisibility(newPassword, toggleNewPassword);
  toggleVisibility(confirmNewPassword, toggleConfirmNewPassword);
}

// Fonction pour gérer l'affichage des champs "New Password" et "Confirm New Password" via le bouton "Modify"
function initializePasswordFieldToggle() {
  const newFrame = document.getElementById("newFrame");
  const newPlusFrame = document.getElementById("newPlusFrame");
  const toggleChangePassword = document.getElementById("toggleChangePassword");

  // Masquer les champs de nouveaux mots de passe par défaut
  if (newFrame && newPlusFrame) {
    newFrame.style.display = "none";
    newPlusFrame.style.display = "none";
  }

  // Gérer le bouton "Modify" pour afficher/masquer les champs de nouveaux mots de passe
  if (toggleChangePassword) {
    toggleChangePassword.addEventListener("click", function () {
      const isHidden = newFrame.style.display === "none"; // Vérifie si les champs sont actuellement masqués
      newFrame.style.display = isHidden ? "block" : "none"; // Affiche ou masque le champ "New Password"
      newPlusFrame.style.display = isHidden ? "block" : "none"; // Affiche ou masque le champ "Confirm New Password"
      toggleChangePassword.innerText = isHidden ? "Cancel" : "Modify"; // Change le texte du bouton
    });
  }
}

// Appel explicite des fonctions après le chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  initializePasswordVisibility();
  initializePasswordFieldToggle(); // Gère le bouton "Modify"
});
