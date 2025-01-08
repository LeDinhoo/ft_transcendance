document.addEventListener("DOMContentLoaded", function () {
  const appDiv = document.getElementById("app");
  const navbar = document.getElementById("navbarContainer");

  let isLoading = false;

  async function isAuthenticated() {
    try {
      const response = await fetch("/api/auth-check/", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        return true;
      }

      if (response.status === 401) {
        const refreshResponse = await fetch("/api/token/refresh/", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (refreshResponse.ok) {
          return true;
        } else {
          return false;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async function redirectToLoginIfNeeded(path) {
    const requiresAuth = path !== "/login-register" && path !== "/";
    const authenticated = await isAuthenticated();

    if (requiresAuth && !authenticated) {
      navigateTo("/login-register");
      return true;
    }

    return false;
  }

  async function loadComponent(
    htmlUrl,
    cssUrl,
    jsUrls,
    shouldInitGame = false
  ) {
    if (isLoading) return;
    isLoading = true;

    try {
      appDiv.classList.add("fade-out");

      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      const response = await fetch(htmlUrl);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de la page");
      }
      const html = await response.text();

      appDiv.innerHTML = html;

      if (cssUrl) {
        loadCSS(cssUrl);
      }

      removePreviousComponentScripts();

      if (jsUrls && jsUrls.length > 0) {
        await loadScriptsInOrder(jsUrls);
      }

      if (typeof initializePage === "function") {
        initializePage();
      }

      if (shouldInitGame && typeof initGame === "function") {
        initGame();
      }

      initializeNavBar();

      appDiv.classList.remove("fade-out");
      appDiv.classList.add("fade-in");

      setTimeout(() => {
        appDiv.classList.remove("fade-in");
      }, 500);
    } catch (err) {
      appDiv.innerHTML =
        "<p>Une erreur est survenue lors du chargement de la page.</p>";
    } finally {
      isLoading = false;
    }
  }

  function loadCSS(cssUrl) {
    removePreviousComponentCSS();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    link.setAttribute("data-component-css", "true");
    document.head.appendChild(link);
  }

  function removePreviousComponentCSS() {
    const componentCSSLinks = document.querySelectorAll(
      "link[data-component-css]"
    );
    componentCSSLinks.forEach((link) => link.remove());
  }

  function removePreviousComponentScripts() {
    const componentScripts = document.querySelectorAll(
      "script[data-component-js]"
    );
    componentScripts.forEach((script) => script.remove());
  }

  function loadScriptsInOrder(jsUrls) {
    if (!jsUrls || jsUrls.length === 0) {
      return Promise.resolve();
    }

    return jsUrls.reduce((promise, jsUrl) => {
      return promise.then(() => loadScript(jsUrl));
    }, Promise.resolve());
  }

  function loadScript(jsUrl) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${jsUrl}"]`)) {
        return resolve();
      }

      const script = document.createElement("script");
      script.src = jsUrl;
      script.defer = true;
      script.setAttribute("data-component-js", "true");
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  window.loadPageFromURL = async function () {
    const path = window.location.pathname;

    const redirected = await redirectToLoginIfNeeded(path);
    if (redirected) {
      return;
    }

    updateNavBarVisibility(path);

    if (await isAuthenticated()) {
      await window.wsManager.initializeChatSocket();
    }

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
        loadFriendRequests();
        initialize2FA();
      });
    } else if (path === "/tournament") {
      loadComponent(
        "/static/spa/tournament/tournament.html",
        "/static/spa/tournament/tournament.css",
        ["/static/spa/tournament/tournament.js"]
      ).then(() => {
        initializeTournamentPage();
      });
    } else if (path === "/settings") {
      loadComponent(
        "/static/spa/settings/newsettings.html",
        "/static/spa/settings/newsettings.css",
        ["/static/spa/settings/newsettings.js"]
      ).then(() => {
        initializeSettingsPage();
      });
    } else {
      navigateTo("/home");
      loadComponent(
        "/static/spa/new_home/new_home.html",
        "/static/spa/new_home/new_home.css",
        ["/static/spa/new_home/new_home.js"]
      ).then(() => {
        initializeHome();
      });
    }
  };

  window.logout = function () {
    fetch("/api/logout/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/login-register";
        } else {
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  function updateNavBarVisibility(path) {
    if (path === "/" || path === "/login-register") {
      navbar.style.display = "none";
    } else {
      navbar.style.display = "flex";
    }
  }

  window.addEventListener("popstate", loadPageFromURL);

  window.navigateTo = function (path) {
    if (window.location.pathname !== path) {
      history.pushState(null, "", path);
      window.loadPageFromURL();
    }
  };

  window.addEventListener("popstate", loadPageFromURL);

  function closeGameModal(modal) {
    if (modal && document.body.contains(modal)) {
      document.body.removeChild(modal);
      isGameInitialized = false;
    }
  }

  window.addEventListener("popstate", () => {
    const modal = document.getElementById("gameModal");
    if (modal) {
      closeGameModal(modal);
    }
  });

  loadPageFromURL();
});
