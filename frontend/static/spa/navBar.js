function addLanguageSelector() {
  const navbar = document.querySelector(".headerMenuSection");
  if (!navbar) return;

  const existingSelector = document.querySelector(
    ".language-selector, .languageSwitcher"
  );
  if (existingSelector) {
    return;
  }

  const languageSelector = document.createElement("div");
  languageSelector.className = "language-selector";
  languageSelector.innerHTML = `
        <div class="language-flags">
            <img src="/static/assets/flags/flag-en.svg" alt="English" data-language="en" class="language-flag">
            <img src="/static/assets/flags/flag-fr.svg" alt="Français" data-language="fr" class="language-flag">
            <img src="/static/assets/flags/flag-es.svg" alt="Español" data-language="es" class="language-flag">
            <img src="/static/assets/flags/flag-swe.svg" alt="Svenska" data-language="swe" class="language-flag">
        </div>
    `;

  languageSelector.querySelectorAll(".language-flag").forEach((flag) => {
    flag.addEventListener("click", async (e) => {
      const language = e.target.dataset.language;
      await window.setPreferredLanguage(language);

      document
        .querySelectorAll(".language-flag")
        .forEach((f) => f.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  navbar.insertBefore(languageSelector, navbar.firstChild);

  window.getPreferredLanguage().then((currentLanguage) => {
    const currentFlag = languageSelector.querySelector(
      `[data-language="${currentLanguage}"]`
    );
    if (currentFlag) {
      currentFlag.classList.add("active");
    }
  });
}

function initializeNavBar() {
  addLanguageSelector();

  const labels = document.querySelectorAll(".navLabel");
  const icons = document.querySelectorAll(".iconMenu");

  const routes = ["/home", "/tournament", "/profil", "/settings"];

  icons.forEach((icon, index) => {
    icon.addEventListener("click", () => {
      labels.forEach((label, i) => {
        if (index === i) {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      });

      if (routes[index]) {
        navigateTo(routes[index]);
      }
    });
  });

  const currentPath = window.location.pathname;
  const activeIndex = routes.indexOf(currentPath);

  labels.forEach((label, index) => {
    if (index === activeIndex) {
      label.classList.add("active");
    } else {
      label.classList.remove("active");
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logout-icon");
    if (logoutButton) {
      logoutButton.addEventListener("click", logout);
    } else {
    }
  });

  let language = getLanguageFromAPI();
  language.then((value) => {
    setPreferredLanguage(value);
  });
}

initializeNavBar();
