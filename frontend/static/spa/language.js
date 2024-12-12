let loadedTranslations = {}; // Store loaded translations

// Fonction pour vérifier si on est sur la page login
function isLoginPage() {
    return window.location.pathname === '/login-register' || window.location.pathname === '/';
}

// Fonction pour charger la langue depuis l'API
async function getLanguageFromAPI() {
    try {
        const response = await fetch('/api/language/get/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.language;
        }
        return null;
    } catch (error) {
        console.error('Error fetching language preference:', error);
        return null;
    }
}

// Fonction pour sauvegarder la langue via l'API
async function setLanguageInAPI(language) {
    try {
        const response = await fetch('/api/language/set/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ language })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error saving language preference:', error);
        return false;
    }
}

async function loadTranslations(language) {
    if (loadedTranslations[language]) {
        // Si les traductions sont déjà chargées, les appliquer directement
        applyTranslations(loadedTranslations[language]);
        return;
    }

    try {
        const response = await fetch(`/static/languages/${language}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const translations = await response.json();
        loadedTranslations[language] = translations; // Stocker en cache
        applyTranslations(translations);

        // Sauvegarder la langue selon le contexte
        if (isLoginPage()) {
            localStorage.setItem('preferredLanguage', language);
        } else {
            await setLanguageInAPI(language);
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-translate]').forEach((element) => {
        const translationKey = element.getAttribute('data-translate');
        const params = element.getAttribute('data-translate-params')?.split(',');
        let translatedText = getNestedTranslation(translationKey, translations);

        if (params && translatedText) {
            params.forEach((param, index) => {
                translatedText = translatedText.replace(`{${index}}`, param);
            });
        }

        if (translatedText) {
            if (element.tagName === "INPUT") {
                element.value = translatedText;
            } else {
                element.textContent = translatedText;
            }
        } else {
            console.warn(`No translation found for key: ${translationKey}`);
        }
    });
}

function getNestedTranslation(key, translations) {
    return key.split('.').reduce((obj, keyPart) => {
        return obj && obj[keyPart] ? obj[keyPart] : null;
    }, translations);
}

async function getPreferredLanguage() {
    if (isLoginPage()) {
        // Sur la page de login, utiliser localStorage
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            return savedLanguage;
        }
        const browserLanguage = navigator.language.split('-')[0];
        return ['en', 'fr', 'es', 'swe'].includes(browserLanguage) ? browserLanguage : 'en';
    } else {
        // Pour les autres pages, utiliser l'API
        const apiLanguage = await getLanguageFromAPI();
        return apiLanguage || 'en';
    }
}

async function setPreferredLanguage(language) {
    if (!['en', 'fr', 'es', 'swe'].includes(language)) {
        console.error('Invalid language code');
        return;
    }
    
    await loadTranslations(language);
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    const userLang = await getPreferredLanguage();
    await loadTranslations(userLang);

    // Event listener pour les drapeaux de langue
    document.querySelectorAll('.language-flag').forEach(flag => {
        flag.addEventListener('click', async (e) => {
            const language = e.target.dataset.language;
            if (language) {
                await setPreferredLanguage(language);
                
                // Mise à jour visuelle du drapeau actif
                document.querySelectorAll('.language-flag').forEach(f => 
                    f.classList.remove('active'));
                e.target.classList.add('active');
            }
        });
    });
});

// Rendre les fonctions disponibles globalement
window.setPreferredLanguage = setPreferredLanguage;
window.getPreferredLanguage = getPreferredLanguage;
window.loadTranslations = loadTranslations;
