let loadedTranslations = {}; // Store loaded translations

function isLoginPage() {
  return (
    window.location.pathname === "/login-register" ||
    window.location.pathname === "/"
  );
}

// Fonction pour charger la langue depuis l'API
async function getLanguageFromAPI() {
  // Verifier si l'utilisateur est sur la page de login
  if (isLoginPage()) {
    return null;
  }
  try {
    const response = await fetch("/api/language/get/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.language;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Fonction pour sauvegarder la langue via l'API
async function setLanguageInAPI(language) {
  if (isLoginPage()) {
    return;
  }
  try {
    const response = await fetch("/api/language/set/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ language }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

async function loadTranslations(language) {
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
      localStorage.setItem("preferredLanguage", language);
    } else {
      localStorage.setItem("preferredLanguage", language);
      await setLanguageInAPI(language);
    }
  } catch (error) {}
}

function applyTranslations(translations) {
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const translationKey = element.getAttribute("data-translate");
    const params = element.getAttribute("data-translate-params")?.split(",");
    let translatedText = getNestedTranslation(translationKey, translations);

    if (params && translatedText) {
      params.forEach((param, index) => {
        translatedText = translatedText.replace(`{${index}}`, param);
      });
    }

    if (translatedText) {
      // Gérer les inputs avec placeholder
      if (element.tagName === "INPUT") {
        if (element.hasAttribute("placeholder")) {
          element.setAttribute("placeholder", translatedText);
        }
        // element.value = translatedText;
      } else {
        // Pour les autres éléments
        const svgElement = element.querySelector("svg");

        // Supprimer les anciens nœuds texte
        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.remove();
          }
        });

        // Insérer le texte après le dernier enfant
        if (svgElement) {
          svgElement.insertAdjacentText("afterend", ` ${translatedText}`);
        } else {
          element.insertAdjacentText("beforeend", translatedText);
        }
      }
    } else {
    }
  });
}

function getNestedTranslation(key, translations) {
  return key.split(".").reduce((obj, keyPart) => {
    return obj && obj[keyPart] ? obj[keyPart] : null;
  }, translations);
}

async function getPreferredLanguage() {
  if (isLoginPage()) {
    // Sur la page de login, utiliser localStorage
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      return savedLanguage;
    }
    const browserLanguage = navigator.language.split("-")[0];
    return ["en", "fr", "es", "swe"].includes(browserLanguage)
      ? browserLanguage
      : "en";
  } else {
    // Pour les autres pages, utiliser l'API
    const apiLanguage = await getLanguageFromAPI();
    return apiLanguage || "en";
  }
}

async function setPreferredLanguage(language) {
  if (!["en", "fr", "es", "swe"].includes(language)) {
    return;
  }

  await loadTranslations(language);
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
  const userLang = await getPreferredLanguage();
  await loadTranslations(userLang);

  // Event listener pour les drapeaux de langue
  document.querySelectorAll(".language-flag").forEach((flag) => {
    flag.addEventListener("click", async (e) => {
      const language = e.target.dataset.language;
      if (language) {
        await setPreferredLanguage(language);

        // Mise à jour visuelle du drapeau actif
        document
          .querySelectorAll(".language-flag")
          .forEach((f) => f.classList.remove("active"));
        e.target.classList.add("active");
      }
    });
  });
});

// Rendre les fonctions disponibles globalement
window.setPreferredLanguage = setPreferredLanguage;
window.getPreferredLanguage = getPreferredLanguage;
window.loadTranslations = loadTranslations;
