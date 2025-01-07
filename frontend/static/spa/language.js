let loadedTranslations = {};

function isLoginPage() {
  return (
    window.location.pathname === "/login-register" ||
    window.location.pathname === "/"
  );
}

async function getLanguageFromAPI() {
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
    loadedTranslations[language] = translations;
    applyTranslations(translations);

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
      if (element.tagName === "INPUT") {
        if (element.hasAttribute("placeholder")) {
          element.setAttribute("placeholder", translatedText);
        }
      } else {
        const svgElement = element.querySelector("svg");

        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.remove();
          }
        });

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
    const savedLanguage = localStorage.getItem("preferredLanguage");
    if (savedLanguage) {
      return savedLanguage;
    }
    const browserLanguage = navigator.language.split("-")[0];
    return ["en", "fr", "es", "swe"].includes(browserLanguage)
      ? browserLanguage
      : "en";
  } else {
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

document.addEventListener("DOMContentLoaded", async () => {
  const userLang = await getPreferredLanguage();
  await loadTranslations(userLang);

  document.querySelectorAll(".language-flag").forEach((flag) => {
    flag.addEventListener("click", async (e) => {
      const language = e.target.dataset.language;
      if (language) {
        await setPreferredLanguage(language);

        document
          .querySelectorAll(".language-flag")
          .forEach((f) => f.classList.remove("active"));
        e.target.classList.add("active");
      }
    });
  });
});

window.setPreferredLanguage = setPreferredLanguage;
window.getPreferredLanguage = getPreferredLanguage;
window.loadTranslations = loadTranslations;
