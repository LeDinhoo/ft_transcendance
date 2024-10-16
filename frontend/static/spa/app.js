// app.js


document.addEventListener('DOMContentLoaded', function () {
    const appDiv = document.getElementById('app');

    // Redirection manuelle si l'utilisateur accède à "/"
    if (window.location.pathname === '/') {
        history.pushState(null, '', '/login-register');
    }

    // Fonction pour charger un fichier HTML, CSS et un tableau de JS et les injecter dans la page
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
                        })
                        .catch(err => console.error('Erreur lors du chargement des scripts:', err));
                }
            })
            .catch(err => {
                console.error('Erreur lors du chargement de la page:', err);
                appDiv.innerHTML = '<p>Une erreur est survenue lors du chargement de la page.</p>';
            });
    }

    // Fonction pour supprimer les anciens fichiers CSS spécifiques aux composants
    function removePreviousComponentCSS() {
        const componentCSSLinks = document.querySelectorAll('link[data-component-css]');
        componentCSSLinks.forEach(link => link.remove());
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
                ['/static/spa/login/gameScript.js', '/static/spa/login/registerShowHide.js', '/static/spa/login/auth.js', '/static/spa/login/auth.js' ]
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
        } else {
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
