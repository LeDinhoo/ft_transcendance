document.addEventListener('DOMContentLoaded', function () {
    const appDiv = document.getElementById('app');

    // Redirection manuelle si l'utilisateur accède à "/"
    if (window.location.pathname === '/') {
        history.pushState(null, '', '/login-register');
    }

    // Function to load and apply translations from a loaded JSON
	function applyTranslations(translations) {
		document.querySelectorAll('[data-translate]').forEach((element) => {
			const translationKey = element.getAttribute('data-translate');
			const translatedText = getNestedTranslation(translationKey, translations);
			console.log(`Translating key: ${translationKey}, translated text: ${translatedText}`);
			if (translatedText) {
				element.textContent = translatedText;  // Apply the translation
			} else {
				console.warn(`No translation found for key: ${translationKey}`);
			}
		});
	}
	

    // Helper function to handle nested translation keys (like login.title)
    function getNestedTranslation(key, translations) {
        return key.split('.').reduce((obj, keyPart) => {
            return obj && obj[keyPart] ? obj[keyPart] : null;
        }, translations);
    }

    // Load the translations based on the user's preferred language
    function loadTranslations(language) {
        return fetch(`/static/languages/${language}.json`)
            .then((response) => response.json())
            .then((translations) => {
                applyTranslations(translations);
            })
            .catch((error) => {
                console.error('Error loading translations:', error);
            });
    }

    // Get the preferred language from localStorage or default to browser's language
    function getPreferredLanguage() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            return savedLanguage;
        }
        const browserLanguage = navigator.language.split('-')[0];  // e.g., "en-US" -> "en"
        return ['en', 'fr', 'es', 'de'].includes(browserLanguage) ? browserLanguage : 'en';
    }

    // Save the selected language to localStorage
    function setPreferredLanguage(language) {
        localStorage.setItem('preferredLanguage', language);
        loadTranslations(language);
    }

    // Language Selector functionality
    const languageSelector = document.getElementById('languageSelector');
    languageSelector.addEventListener('change', function (event) {
        const selectedLang = event.target.value;
        setPreferredLanguage(selectedLang);
        location.reload();  // Reload the page to apply the new language
    });

    // Set the current language as the selected option when the page loads
    if (languageSelector) {
        const userLang = getPreferredLanguage();
        languageSelector.value = userLang;  // Set the dropdown to the preferred language
        loadTranslations(userLang);  // Load the selected language translations
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
	
							// Apply translations after all scripts and components are loaded
							loadTranslations(getPreferredLanguage());
						})
						.catch(err => console.error('Erreur lors du chargement des scripts:', err));
				} else {
					// Apply translations if no scripts need to be loaded
					loadTranslations(getPreferredLanguage());
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
