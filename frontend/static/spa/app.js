// app.js

/*document.addEventListener('DOMContentLoaded', function () {
    const appDiv = document.getElementById('app');

    // Redirection manuelle si l'utilisateur accède à "/"
    if (window.location.pathname === '/') {
        history.pushState(null, '', '/login-register');
    }

    // Fonction pour charger un fichier HTML, CSS et un tableau de JS et les injecter dans la page
    //function loadComponent(htmlUrl, cssUrl, jsUrls) {
    //    fetch(htmlUrl)
    //        .then(response => {
    //            if (!response.ok) {
    //                throw new Error('Erreur lors du chargement de la page');
    //            }
    //            return response.text();
    //        })
    //        .then(html => {
    //            appDiv.innerHTML = html;
//
    //            // Charger le fichier CSS spécifique s'il existe
    //            if (cssUrl) {
    //                loadCSS(cssUrl);
    //            }
//
    //            // Charger les fichiers JS spécifiques s'il y en a
    //            if (jsUrls && jsUrls.length > 0) {
    //                loadScriptsInOrder(jsUrls)
    //                    .then(() => {
    //                        // Initialiser les composants spécifiques après le chargement des scripts
    //                        if (typeof initializePage === 'function') {
    //                            initializePage();  // Initialisation pour les pages de login par exemple
    //                        }
    //                        if (typeof initGame === 'function') {
    //                            initGame();  // Initialisation pour les pages de jeu
    //                        }
    //                    })
    //                    .catch(err => console.error('Erreur lors du chargement des scripts:', err));
    //            }
    //        })
    //        .catch(err => {
    //            console.error('Erreur lors du chargement de la page:', err);
    //            appDiv.innerHTML = '<p>Une erreur est survenue lors du chargement de la page.</p>';
    //        });
    //}

    function loadComponent(htmlUrl, cssUrl, jsUrls) {
        fetch(htmlUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement de la page');
                }
                return response.text();
            })
            .then(html => {
                appDiv.innerHTML = html;
    
                // Charger le fichier CSS spécifique s'il existe
                if (cssUrl) {
                    loadCSS(cssUrl);
                }
    
                // Charger les fichiers JS spécifiques s'il y en a
                if (jsUrls && jsUrls.length > 0) {
                    loadScriptsInOrder(jsUrls)
                        .then(() => {
                            // Initialiser les composants spécifiques après le chargement des scripts
                            if (typeof initializePage === 'function') {
                                initializePage();  // Initialisation pour les pages de login par exemple
                            }
                            if (typeof initGame === 'function') {
                                initGame();  // Initialisation pour les pages de jeu
                            }
                            // Réinitialiser la navbar après chaque changement de page
                            initializeNavBar();
                        })
                        .catch(err => console.error('Erreur lors du chargement des scripts:', err));
                } else {
                    // Réinitialiser la navbar même s'il n'y a pas de script à charger
                    initializeNavBar();
                }
            })
            .catch(err => {
                console.error('Erreur lors du chargement de la page:', err);
                appDiv.innerHTML = '<p>Une erreur est survenue lors du chargement de la page.</p>';
            });
    }
    

    // Fonction pour charger un fichier CSS dynamiquement
    function loadCSS(cssUrl) {
        removePreviousComponentCSS();  // Supprimer les anciens fichiers CSS spécifiques
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.setAttribute('data-component-css', 'true');
        document.head.appendChild(link);
    }


    

    // Fonction pour supprimer les anciens fichiers CSS spécifiques aux composants
    function removePreviousComponentCSS() {
        const componentCSSLinks = document.querySelectorAll('link[data-component-css]');
        componentCSSLinks.forEach(link => link.remove());
    }


    // Fonction pour charger les scripts dans l'ordre
    function loadScriptsInOrder(jsUrls) {
        if (!jsUrls || jsUrls.length === 0) {
            return Promise.resolve();  // Rien à charger
        }

        // Charger les scripts un par un dans l'ordre
        return jsUrls.reduce((promise, jsUrl) => {
            return promise.then(() => loadScript(jsUrl));
        }, Promise.resolve());
    }

    // Fonction pour charger un fichier JS dynamiquement
    function loadScript(jsUrl) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = jsUrl;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    // Fonction pour charger la page correcte en fonction de l'URL
    window.loadPageFromURL = function() {
        const path = window.location.pathname;

        if (path === '/' || path === '/login-register') {
            loadComponent(
                '/static/spa/login/login.html',
                '/static/spa/login/login.css',
                ['/static/spa/login/gameScript.js', '/static/spa/login/registerShowHide.js', '/static/spa/login/auth.js']
            );
        } else if (path === '/home') {
            loadComponent(
                '/static/spa/home/home.html',
                '/static/spa/home/home.css',
                ['/static/spa/navBar.js']
            );
        } else if (path === '/profil') {
            loadComponent(
                '/static/spa/profil/profil.html',
                '/static/spa/profil/profil.css',
                ['/static/spa/navBar.js']
            );
        }   else if (path === '/custom') {
            loadComponent(
                '/static/spa/custom/custom.html',
                '/static/spa/custom/custom.css',
                ['/static/spa/navBar.js', '/static/spa/custom/custom.js']
            ); 
        }   else if (path === '/tournament') {
                loadComponent(
                    '/static/spa/tournament/tournament.html',
                    '/static/spa/tournament/tournament.css',
                    ['/static/spa/navBar.js']
                );
            }else {
            appDiv.innerHTML = '<p>Page non trouvée.</p>';
        }
    }

    // Gérer les boutons "précédent" et "suivant" du navigateur
    window.addEventListener('popstate', loadPageFromURL);

    // Assigner la fonction navigateTo à window pour qu'elle soit globale
    window.navigateTo = function (path) {
        history.pushState(null, '', path);
        window.loadPageFromURL();
    };

    // Charger la page en fonction de l'URL au chargement initial
    loadPageFromURL();
});
*/

//fonctionnel mais souci daccumalation des scripts
// document.addEventListener('DOMContentLoaded', function () {
//     const appDiv = document.getElementById('app');
//     const navbar = document.getElementById('navbarContainer');

//     // Fonction pour charger un fichier HTML, CSS et un tableau de JS et les injecter dans la page
//     function loadComponent(htmlUrl, cssUrl, jsUrls) {
//         fetch(htmlUrl)
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Erreur lors du chargement de la page');
//                 }
//                 return response.text();
//             })
//             .then(html => {
//                 appDiv.innerHTML = html;

//                 // Charger le fichier CSS spécifique s'il existe
//                 if (cssUrl) {
//                     loadCSS(cssUrl);
//                 }

//                 // Charger les fichiers JS spécifiques s'il y en a
//                 if (jsUrls && jsUrls.length > 0) {
//                     loadScriptsInOrder(jsUrls)
//                         .then(() => {
//                             // Initialiser les composants spécifiques après le chargement des scripts
//                             if (typeof initializePage === 'function') {
//                                 initializePage(); // Initialisation pour certaines pages
//                             }
//                             if (typeof initGame === 'function') {
//                                 initGame();  // Initialisation pour les pages de jeu
//                             }
//                             initializeNavBar(); // Réinitialiser la navbar après chaque changement de page
//                         })
//                         .catch(err => console.error('Erreur lors du chargement des scripts:', err));
//                 } else {
//                     initializeNavBar(); // Réinitialiser la navbar même s'il n'y a pas de script à charger
//                 }
//             })
//             .catch(err => {
//                 console.error('Erreur lors du chargement de la page:', err);
//                 appDiv.innerHTML = '<p>Une erreur est survenue lors du chargement de la page.</p>';
//             });
//     }

//     // Fonction pour charger un fichier CSS dynamiquement
//     function loadCSS(cssUrl) {
//         removePreviousComponentCSS();  // Supprimer les anciens fichiers CSS spécifiques
//         const link = document.createElement('link');
//         link.rel = 'stylesheet';
//         link.href = cssUrl;
//         link.setAttribute('data-component-css', 'true');
//         document.head.appendChild(link);
//     }

//     // Fonction pour supprimer les anciens fichiers CSS spécifiques aux composants
//     function removePreviousComponentCSS() {
//         const componentCSSLinks = document.querySelectorAll('link[data-component-css]');
//         componentCSSLinks.forEach(link => link.remove());
//     }

//     // Fonction pour charger les scripts dans l'ordre
//     function loadScriptsInOrder(jsUrls) {
//         if (!jsUrls || jsUrls.length === 0) {
//             return Promise.resolve();  // Rien à charger
//         }

//         // Charger les scripts un par un dans l'ordre
//         return jsUrls.reduce((promise, jsUrl) => {
//             return promise.then(() => loadScript(jsUrl));
//         }, Promise.resolve());
//     }

//     // Fonction pour charger un fichier JS dynamiquement
//     function loadScript(jsUrl) {
//         return new Promise((resolve, reject) => {
//             const script = document.createElement('script');
//             script.src = jsUrl;
//             script.defer = true;
//             script.onload = resolve;
//             script.onerror = reject;
//             document.body.appendChild(script);
//         });
//     }

//     // Fonction pour charger la page correcte en fonction de l'URL
//     window.loadPageFromURL = function() {
//         const path = window.location.pathname;

//         updateNavBarVisibility(path);  // Gérer la visibilité de la navbar

//         if (path === '/' || path === '/login-register') {
//             loadComponent(
//                 '/static/spa/login/login.html',
//                 '/static/spa/login/login.css',
//                 ['/static/spa/login/gameScript.js', '/static/spa/login/registerShowHide.js', '/static/spa/login/auth.js']
//             );
//         } else if (path === '/home') {
//             loadComponent(
//                 '/static/spa/home/home.html',
//                 '/static/spa/home/home.css',
//                 ['/static/spa/navBar.js']
//             );
//         } else if (path === '/profil') {
//             loadComponent(
//                 '/static/spa/profil/profil.html',
//                 '/static/spa/profil/profil.css',
//                 ['/static/spa/navBar.js']
//             );
//         } else if (path === '/custom') {
//             loadComponent(
//                 '/static/spa/custom/custom.html',
//                 '/static/spa/custom/custom.css',
//                 ['/static/spa/navBar.js', '/static/spa/custom/custom.js']
//             );
//         } else if (path === '/tournament') {
//             loadComponent(
//                 '/static/spa/tournament/tournament.html',
//                 '/static/spa/tournament/tournament.css',
//                 ['/static/spa/navBar.js']
//             );
//         } else {
//             appDiv.innerHTML = '<p>Page non trouvée.</p>';
//         }
//     };

//     // Fonction pour gérer la visibilité de la navbar
//     function updateNavBarVisibility(path) {
//         if (path === '/' || path === '/login-register') {
//             navbar.style.display = 'none';  // Cacher la navbar sur la page de login
//         } else {
//             navbar.style.display = 'flex';  // Afficher la navbar sur toutes les autres pages
//         }
//     }

//     // Gérer les boutons "précédent" et "suivant" du navigateur
//     window.addEventListener('popstate', loadPageFromURL);

//     // Assigner la fonction navigateTo à window pour qu'elle soit globale
//     window.navigateTo = function (path) {
//         history.pushState(null, '', path);
//         window.loadPageFromURL();
//     };

//     // Charger la page en fonction de l'URL au chargement initial
//     loadPageFromURL();
// });

document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.isProfileInitialized === "undefined") {
    window.isProfileInitialized = false;
  }

  const appDiv = document.getElementById("app");
  const navbar = document.getElementById("navbarContainer");

  // Fonction pour charger un fichier HTML, CSS et un tableau de JS et les injecter dans la page
  // function loadComponent(htmlUrl, cssUrl, jsUrls) {
  // fetch(htmlUrl)
  // .then(response => {
  // if (!response.ok) {
  // throw new Error('Erreur lors du chargement de la page');
  // }
  // return response.text();
  // })
  // .then(html => {
  // appDiv.innerHTML = html;
  //
  //Charger le fichier CSS spécifique s'il existe
  // if (cssUrl) {
  // loadCSS(cssUrl);
  // }
  //
  //Supprimer les anciens scripts avant d'en charger de nouveaux
  // removePreviousComponentScripts();
  //
  //Charger les fichiers JS spécifiques s'il y en a
  // if (jsUrls && jsUrls.length > 0) {
  // loadScriptsInOrder(jsUrls)
  // .then(() => {
  //Initialiser les composants spécifiques après le chargement des scripts
  // if (typeof initializePage === 'function') {
  // initializePage(); // Initialisation pour certaines pages
  // }
  // if (typeof initGame === 'function') {
  // initGame();  // Initialisation pour les pages de jeu
  // }
  // initializeNavBar(); // Réinitialiser la navbar après chaque changement de page
  // })
  // .catch(err => console.error('Erreur lors du chargement des scripts:', err));
  // } else {
  // initializeNavBar(); // Réinitialiser la navbar même s'il n'y a pas de script à charger
  // }
  // })
  // .catch(err => {
  // console.error('Erreur lors du chargement de la page:', err);
  // appDiv.innerHTML = '<p>Une erreur est survenue lors du chargement de la page.</p>';
  // });
  // }

  let isLoading = false;

  async function loadComponent(
    htmlUrl,
    cssUrl,
    jsUrls,
    shouldInitGame = false
  ) {
    if (isLoading) return; // Empêcher le chargement multiple
    isLoading = true;

    try {
      // Charger le contenu HTML
      const response = await fetch(htmlUrl);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de la page");
      }
      const html = await response.text();

      // Ne charger le HTML que si c'est différent du contenu actuel
      if (appDiv.innerHTML !== html) {
        appDiv.innerHTML = html;
      }

      // Charger le fichier CSS s'il existe
      if (cssUrl) {
        loadCSS(cssUrl);
      }

      // Supprimer les anciens scripts avant d'en charger de nouveaux
      removePreviousComponentScripts();

      // Charger les scripts JS s'il y en a
      if (jsUrls && jsUrls.length > 0) {
        await loadScriptsInOrder(jsUrls);
      }

      // Initialisation après le chargement
      if (typeof initializePage === "function") {
        initializePage(); // Initialisation spécifique à la page
      }

      // Appeler initGame si le paramètre shouldInitGame est vrai
      if (shouldInitGame && typeof initGame === "function") {
        initGame(); // Initialisation pour les pages de jeu
      }

      // Réinitialisation de la barre de navigation
      initializeNavBar();
    } catch (err) {
      console.error("Erreur lors du chargement de la page:", err);
      appDiv.innerHTML =
        "<p>Une erreur est survenue lors du chargement de la page.</p>";
    } finally {
      isLoading = false; // Remettre le flag à false après le chargement
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

  // Fonction pour supprimer les anciens fichiers CSS spécifiques aux composants
  function removePreviousComponentCSS() {
    const componentCSSLinks = document.querySelectorAll(
      "link[data-component-css]"
    );
    componentCSSLinks.forEach((link) => link.remove());
  }

  // Fonction pour supprimer les anciens scripts spécifiques aux composants
  function removePreviousComponentScripts() {
    const componentScripts = document.querySelectorAll(
      "script[data-component-js]"
    );
    componentScripts.forEach((script) => script.remove());
  }

  // Fonction pour charger les scripts dans l'ordre
  function loadScriptsInOrder(jsUrls) {
    if (!jsUrls || jsUrls.length === 0) {
      return Promise.resolve(); // Rien à charger
    }

    // Charger les scripts un par un dans l'ordre
    return jsUrls.reduce((promise, jsUrl) => {
      return promise.then(() => loadScript(jsUrl));
    }, Promise.resolve());
  }

  //// Fonction pour charger un fichier JS dynamiquement avec cache-busting
  //function loadScript(jsUrl) {
  //    return new Promise((resolve, reject) => {
  //        const script = document.createElement('script');
  //        script.src = jsUrl;  // Cache-busting
  //        script.defer = true;
  //        script.setAttribute('data-component-js', 'true');  // Marquer ce script pour le nettoyage
  //        script.onload = resolve;
  //        script.onerror = reject;
  //        document.body.appendChild(script);
  //    });
  //}

  function loadScript(jsUrl) {
    return new Promise((resolve, reject) => {
      // Vérifier si le script est déjà chargé
      if (document.querySelector(`script[src="${jsUrl}"]`)) {
        // Le script est déjà présent, on résout directement la promesse
        return resolve();
      }

      // Si le script n'est pas présent, on le charge
      const script = document.createElement("script");
      script.src = jsUrl; // Cache-busting ou URL
      script.defer = true;
      script.setAttribute("data-component-js", "true"); // Marquer ce script pour le nettoyage
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script); // Ajouter le script au DOM
    });
  }

  // Fonction pour charger la page correcte en fonction de l'URL
  window.loadPageFromURL = function () {
    const path = window.location.pathname;

    updateNavBarVisibility(path); // Gérer la visibilité de la navbar

    if (path === "/" || path === "/login-register") {
      loadComponent(
        "/static/spa/login/login.html",
        "/static/spa/login/login.css",
        [
          "/static/spa/login/gameScript.js",
          "/static/spa/login/registerShowHide.js",
          "/static/spa/login/auth_test.js",
          "/static/spa/login/visibilityPassword.js",
        ],
        true
      );
    } else if (path === "/home") {
      loadComponent("/static/spa/home/home.html", "/static/spa/home/home.css");
    } else if (path === "/profil") {
      loadComponent(
        "/static/spa/profil/profil.html",
        "/static/spa/profil/profil.css",
        [
          "/static/spa/profil/profil.js",
          "/static/spa/profil/visibilityPasswordProfil.js",
        ]
      ).then(() => {
        initializeProfilePage(); // Initialiser la page profil
        initializePasswordManagement();
        resetPasswordFields(); // Réinitialiser les champs dès le premier chargement

        //    window.isProfileInitialized = true;  // Marquer l'initialisation comme faite
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
        if (typeof initializeTournamentPage === "function") {
          initializeTournamentPage(); // Appelle la fonction d'initialisation spécifique
        }
      });
    } else {
      appDiv.innerHTML = "<p>Page non trouvée.</p>";
    }
  };
  // Fonction pour gérer la visibilité de la navbar
  function updateNavBarVisibility(path) {
    if (path === "/" || path === "/login-register") {
      navbar.style.display = "none"; // Cacher la navbar sur la page de login
    } else {
      navbar.style.display = "flex"; // Afficher la navbar sur toutes les autres pages
    }
  }

  // Gérer les boutons "précédent" et "suivant" du navigateur
  window.addEventListener("popstate", loadPageFromURL);

  // Assigner la fonction navigateTo à window pour qu'elle soit globale
  window.navigateTo = function (path) {
    if (window.location.pathname !== path) {
      // Vérifier si on n'est pas déjà sur la page
      history.pushState(null, "", path);
      window.loadPageFromURL();
    }
  };

  // Charger la page en fonction de l'URL au chargement initial
  loadPageFromURL();
});
