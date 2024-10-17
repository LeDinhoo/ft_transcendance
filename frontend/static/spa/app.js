document.addEventListener('DOMContentLoaded', function () {
    const appDiv = document.getElementById('app');

    // Redirection manuelle si l'utilisateur accède à "/"
    if (window.location.pathname === '/') {
        history.pushState(null, '', '/login-register');
    }

    // Function to load language JSON based on user preference
    function loadTranslations(language) {
        return fetch(`/static/languages/${language}.json`)  // Load the appropriate language file
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load language file');
                }
                return response.json();
            });
    }

    // Load the user's preferred language or default to 'en'
    const userLang = localStorage.getItem('preferredLanguage') || 'en';

    // Fetch translations once the page loads
    let translations = {};
    loadTranslations(userLang).then(langData => {
        translations = langData;
        // Optionally, you could use these translations right away if necessary
        console.log('Loaded translations:', translations);
    }).catch(err => {
        console.error('Error loading translations:', err);
    });

    // Language Selector functionality
    document.getElementById('languageSelector').addEventListener('change', function (event) {
        const selectedLang = event.target.value;
        localStorage.setItem('preferredLanguage', selectedLang);
        location.reload();  // Reload the page to apply the new language
    });

    // Set the current language as the selected option when the page loads
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.value = userLang;
    }

    // Function to load a component's HTML, CSS, and JS
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

                // Load specific CSS if provided
                if (cssUrl) {
                    loadCSS(cssUrl);
                }

                // Load specific JS files if any
                if (jsUrls && jsUrls.length > 0) {
                    loadScriptsInOrder(jsUrls)
                        .then(() => {
                            // Initialize components after JS is loaded
                            if (typeof initializePage === 'function') {
                                initializePage();
                            }
                            if (typeof initGame === 'function') {
                                initGame();
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

    // Function to remove previous CSS for components
    function removePreviousComponentCSS() {
        const componentCSSLinks = document.querySelectorAll('link[data-component-css]');
        componentCSSLinks.forEach(link => link.remove());
    }

    // Function to dynamically load CSS
    function loadCSS(cssUrl) {
        removePreviousComponentCSS();
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.setAttribute('data-component-css', 'true');
        document.head.appendChild(link);
    }

    // Function to load scripts in order
    function loadScriptsInOrder(jsUrls) {
        if (!jsUrls || jsUrls.length === 0) {
            return Promise.resolve();  // Nothing to load
        }

        // Load scripts one by one
        return jsUrls.reduce((promise, jsUrl) => {
            return promise.then(() => loadScript(jsUrl));
        }, Promise.resolve());
    }

    // Function to dynamically load JS files
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

    // Function to load the correct page based on the URL
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
        } else {
            appDiv.innerHTML = '<p>Page non trouvée.</p>';
        }
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', loadPageFromURL);

    // Make navigateTo a global function
    window.navigateTo = function (path) {
        history.pushState(null, '', path);
        window.loadPageFromURL();
    };

    // Load the page based on the URL at initial load
    loadPageFromURL();
});
