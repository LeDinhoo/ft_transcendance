let loadedTranslations = {}; // Store loaded translations

function loadTranslations(language) {
	if (loadedTranslations[language]) {
		// If translations are already loaded, apply them directly
		applyTranslations(loadedTranslations[language]);
		return;
	}

	return fetch(`/static/languages/${language}.json`)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then((translations) => {
			loadedTranslations[language] = translations; // Store in cache
			applyTranslations(translations);
		})
		.catch((error) => {
			console.error('Error loading translations:', error);
		});
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-translate]').forEach((element) => {
        const translationKey = element.getAttribute('data-translate');
        const translatedText = getNestedTranslation(translationKey, translations);
        console.log(`Translating key: ${translationKey}, translated text: ${translatedText}`);
        if (translatedText) {
            element.textContent = translatedText;
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

// function loadTranslations(language) {
//     return fetch(`/static/languages/${language}.json`)
//         .then((response) => response.json())
//         .then((translations) => {
//             applyTranslations(translations);
//         })
//         .catch((error) => {
//             console.error('Error loading translations:', error);
//         });
// }

function getPreferredLanguage() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        return savedLanguage;
    }
    const browserLanguage = navigator.language.split('-')[0];
    return ['en', 'fr', 'es', 'swe'].includes(browserLanguage) ? browserLanguage : 'en';
}

function setPreferredLanguage(language) {
    localStorage.setItem('preferredLanguage', language);
    loadTranslations(language);
}

document.addEventListener('DOMContentLoaded', () => {
    const userLang = getPreferredLanguage();
    loadTranslations(userLang);
});

