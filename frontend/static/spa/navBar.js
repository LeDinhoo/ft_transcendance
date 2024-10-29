// Fonction pour initialiser la navbar et gérer les événements de clic
function initializeNavBar() {
  const labels = document.querySelectorAll(".navLabel");
  const icons = document.querySelectorAll(".iconMenu");

  // Tableau des routes correspondantes à chaque icône
  const routes = [
    "/home",
    "/custom",
    "/tournament",
    "/profil",
    "/online",
    "/settings",
  ];

  // Réinitialiser l'état des icônes actives
  icons.forEach((icon, index) => {
    icon.addEventListener("click", () => {
      // Activer/désactiver les labels
      labels.forEach((label, i) => {
        if (index === i) {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      });

      // Rediriger vers la page correspondante
      if (routes[index]) {
        navigateTo(routes[index]); // Utiliser navigateTo pour la redirection
      }
    });
  });

  // Initialiser l'élément actif en fonction de l'URL actuelle
  const currentPath = window.location.pathname;
  const activeIndex = routes.indexOf(currentPath);

  labels.forEach((label, index) => {
    if (index === activeIndex) {
      label.classList.add("active");
    } else {
      label.classList.remove("active");
    }
  });

  // Attendre que le DOM soit entièrement chargé pour ajouter l'événement logout
  window.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById("logout-icon");
    if (logoutButton) {
      logoutButton.addEventListener("click", logout); // Appelle la fonction logout définie dans app.js
      console.log("Logout button event listener attached"); 
    } else {
      console.error("Logout icon not found in the DOM.");
    }
  });
}


// Appeler la fonction d'initialisation au chargement initial
initializeNavBar();

