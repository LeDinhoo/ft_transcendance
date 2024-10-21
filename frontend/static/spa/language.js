
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
	return ['en', 'fr', 'es', 'swe'].includes(browserLanguage) ? browserLanguage : 'en';
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

