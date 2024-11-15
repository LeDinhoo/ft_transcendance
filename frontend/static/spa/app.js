document.addEventListener("DOMContentLoaded", function () {
  const appDiv = document.getElementById("app");
  const navbar = document.getElementById("navbarContainer");

  let isLoading = false;

  async function isAuthenticated() {
    try {
        const response = await fetch("/api/auth-check/", {
            method: "GET",
            credentials: "include", // Inclut les cookies
        });
        return response.ok; // Retourne `true` si authentifié, sinon `false`
    } catch (error) {
        console.error("Erreur d'authentification:", error);
        return false;
    }
}


  // Fonction pour rediriger vers la page de login si l'utilisateur n'est pas authentifié
  async function redirectToLoginIfNeeded(path) {
    const requiresAuth = path !== "/login-register" && path !== "/";
    const authenticated = await isAuthenticated();
    if (requiresAuth && !authenticated) {
      navigateTo("/login-register");
      return true; // Indique qu'on a redirigé vers login
    }
    return false;
  }

  // Charger une page en fonction de l'URL
  async function loadComponent(
    htmlUrl,
    cssUrl,
    jsUrls,
    shouldInitGame = false
  ) {
    if (isLoading) return; // Empêcher le chargement multiple
    isLoading = true;

    try {
      const response = await fetch(htmlUrl);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de la page");
      }
      const html = await response.text();

      // Ne remplacer le contenu HTML que s'il est différent
      if (appDiv.innerHTML !== html) {
        appDiv.innerHTML = html;
      }

      // Charger le fichier CSS s'il existe
      if (cssUrl) {
        loadCSS(cssUrl);
      }

      // Supprimer les anciens scripts avant d'en charger de nouveaux
      removePreviousComponentScripts();

      // Charger les scripts JS dans l'ordre
      if (jsUrls && jsUrls.length > 0) {
        await loadScriptsInOrder(jsUrls);
      }

      // Initialisation spécifique à la page si nécessaire
      if (typeof initializePage === "function") {
        initializePage();
      }

      // Initialisation pour les pages de jeu si nécessaire
      if (shouldInitGame && typeof initGame === "function") {
        initGame();
      }

      // Réinitialiser la barre de navigation
      initializeNavBar();
    } catch (err) {
      console.error("Erreur lors du chargement de la page:", err);
      appDiv.innerHTML =
        "<p>Une erreur est survenue lors du chargement de la page.</p>";
    } finally {
      isLoading = false;
    }
  }

  // Fonction pour charger un fichier CSS dynamiquement
  function loadCSS(cssUrl) {
    removePreviousComponentCSS(); // Supprimer les anciens fichiers CSS spécifiques
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    link.setAttribute("data-component-css", "true");
    document.head.appendChild(link);
  }

  // Supprimer les anciens fichiers CSS
  function removePreviousComponentCSS() {
    const componentCSSLinks = document.querySelectorAll(
      "link[data-component-css]"
    );
    componentCSSLinks.forEach((link) => link.remove());
  }

  // Supprimer les anciens scripts spécifiques aux composants
  function removePreviousComponentScripts() {
    const componentScripts = document.querySelectorAll(
      "script[data-component-js]"
    );
    componentScripts.forEach((script) => script.remove());
  }

  // Charger les scripts JS dans l'ordre
  function loadScriptsInOrder(jsUrls) {
    if (!jsUrls || jsUrls.length === 0) {
      return Promise.resolve(); // Aucun script à charger
    }

    return jsUrls.reduce((promise, jsUrl) => {
      return promise.then(() => loadScript(jsUrl));
    }, Promise.resolve());
  }

  // Charger un fichier JS dynamiquement
  function loadScript(jsUrl) {
    return new Promise((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      if (document.querySelector(`script[src="${jsUrl}"]`)) {
        return resolve(); // Le script est déjà présent
      }

      const script = document.createElement("script");
      script.src = jsUrl;
      script.defer = true;
      script.setAttribute("data-component-js", "true"); // Marquer ce script pour le nettoyage
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Fonction pour charger la page correcte en fonction de l'URL
  window.loadPageFromURL = async function () {
    const path = window.location.pathname;

    // Redirection vers login si non authentifié
    const redirected = await redirectToLoginIfNeeded(path);
    if (redirected) {
      return; // Ne pas charger la page demandée si on redirige vers login
    }

    updateNavBarVisibility(path);

    if (path === "/" || path === "/login-register") {
      loadComponent(
        "/static/spa/login/login.html",
        "/static/spa/login/login.css",
        [
          "/static/spa/login/gameScript.js",
          "/static/spa/login/registerShowHide.js",
          "/static/spa/login/auth.js",
          "/static/spa/login/visibilityPassword.js",
        ],
        true
      );
    } else if (path === "/home") {
      loadComponent(
        "/static/spa/home/home.html", 
        "/static/spa/home/home.css",
        ["/static/spa/home/home.js",
      ]).then(() => {
        initializeHome();
    });
    } else if (path === "/profil") {
      loadComponent(
        "/static/spa/profil/profil.html",
        "/static/spa/profil/profil.css",
        [
          "/static/spa/profil/profil.js",
          "/static/spa/profil/visibilityPasswordProfil.js",
        ]
      ).then(() => {
        initializeProfilePage();
        initializePasswordManagement();
        resetPasswordFields();
        initializePasswordVisibility();
        initializeAvatarFeature();
        initialize2FA();
      });
    } else if (path === "/custom") {
      loadComponent(
        "/static/spa/custom/custom.html",
        "/static/spa/custom/custom.css",
        ["/static/spa/custom/custom.js"]
      );
    } else if (path === "/tournament") {
      loadComponent(
        "/static/spa/tournament/tournament.html",
        "/static/spa/tournament/tournament.css",
        ["/static/spa/tournament/tournament.js"]
      ).then(() => {
        initializeTournamentPage();
      });
    } else {
      appDiv.innerHTML = "<p>Page non trouvée.</p>";
    }
  };


    // Code du logout mis à jour pour ne pas utiliser localStorage
    window.logout = function () {
      console.log("log out function called");
  
      fetch("/api/logout/", {
        method: "POST",
        credentials: "include", // Assure l'envoi des cookies avec la requête
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Logout response data:", data);
          if (data.success) {
            window.location.href = "/login-register";
          } else {
            console.error(data.message);
          }
        })
        .catch((error) => console.error("Error:", error));
    };

  // Fonction pour gérer la visibilité de la navbar
  function updateNavBarVisibility(path) {
    if (path === "/" || path === "/login-register") {
      navbar.style.display = "none"; // Cacher la navbar sur la page de login
    } else {
      navbar.style.display = "flex"; // Afficher la navbar sur les autres pages
    }
  }

  // Gérer les boutons "précédent" et "suivant" du navigateur
  window.addEventListener("popstate", loadPageFromURL);

  // Fonction navigateTo pour changer de page
  window.navigateTo = function (path) {
    if (window.location.pathname !== path) {
      history.pushState(null, "", path);
      window.loadPageFromURL();
    }
  };

  // Charger la page en fonction de l'URL au chargement initial
  loadPageFromURL();
});
