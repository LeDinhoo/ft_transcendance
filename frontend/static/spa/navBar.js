//const labels = document.querySelectorAll(".navLabel");
//const icons = document.querySelectorAll(".iconMenu");
//
//labels.forEach((label, index) => {
//  if (index === 0) {
//    label.classList.add('active');
//  } else {
//    label.classList.remove('active');
//  }
//});
//
//icons.forEach((icon, index) => {
//  icon.addEventListener("click", () => {
//    console.log("clicked");
//    labels.forEach((label, i) => {
//      if (index === i) {
//        label.classList.add('active');
//      } else {
//        label.classList.remove('active');
//      }
//    });
//  });
//});

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

//// Fonction pour mettre à jour l'icône active dans la navBar en fonction de l'URL actuelle
//function updateNavBar(currentPath) {
//  const navItems = document.querySelectorAll('.iconMenu .icon');
//
//  // Désactiver toutes les icônes actives
//  navItems.forEach(item => {
//      item.classList.remove('active');
//  });
//
//  // Activer l'icône correspondante à l'URL actuelle
//  if (currentPath === '/home') {
//      document.getElementById('home').classList.add('active');
//  } else if (currentPath === '/custom') {
//      document.getElementById('custom').classList.add('active');
//  } else if (currentPath === '/clash') {
//      document.getElementById('clash').classList.add('active');
//  } else if (currentPath === '/profil') {
//      document.getElementById('profil').classList.add('active');
//  } else if (currentPath === '/online') {
//      document.getElementById('online').classList.add('active');
//  } else if (currentPath === '/settings') {
//      document.getElementById('settings').classList.add('active');
//  }
//}
//
//// Fonction pour gérer les clics sur les icônes de la navBar et naviguer vers les pages correspondantes
//function setupNavBarNavigation() {
//  const navItems = document.querySelectorAll('.iconMenu .icon');
//
//  navItems.forEach(item => {
//      item.addEventListener('click', function() {
//          const pageId = this.id;
//
//          // Correspondance des ID avec les chemins de page
//          let targetPath = '';
//          switch (pageId) {
//              case 'home':
//                  targetPath = '/home';
//                  break;
//              case 'custom':
//                  targetPath = '/custom';
//                  break;
//              case 'clash':
//                  targetPath = '/clash';
//                  break;
//              case 'profil':
//                  targetPath = '/profil';
//                  break;
//              case 'online':
//                  targetPath = '/online';
//                  break;
//              case 'settings':
//                  targetPath = '/settings';
//                  break;
//              default:
//                  targetPath = '/home';  // Chemin par défaut
//          }
//
//          // Utilisation de la fonction navigateTo définie dans app.js pour naviguer
//          window.navigateTo(targetPath);
//      });
//  });
//}
//
//// Initialiser la navigation de la navBar après chargement de la page
//document.addEventListener('DOMContentLoaded', function() {
//  setupNavBarNavigation();
//
//  // Mise à jour de la navBar en fonction de l'URL actuelle au chargement de la page
//  updateNavBar(window.location.pathname);
//});
//
