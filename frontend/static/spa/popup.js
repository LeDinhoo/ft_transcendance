function isLoginPage() {
  return (
    window.location.pathname === "/login-register" ||
    window.location.pathname === "/"
  );
}

async function showErrorPopup(message, isAuthenticated) {
  let translations = {};
  let language = "en";

  if (localStorage.getItem("preferredLanguage")) {
    language = localStorage.getItem("preferredLanguage");
  }

  try {
    if (!isLoginPage()) {
      language = await getLanguageFromAPI();
      await setPreferredLanguage(language);
    }


    const response = await fetch(`/static/languages/${language}.json`);
    if (!response.ok) {
      throw new Error("Failed to load translations");
    }

    translations = await response.json();

    const translateMessage =
      translations.error && translations.error[message]
        ? translations.error[message]
        : `Translation missing for: ${message}`;


    const popupModal = document.getElementById("popupModal");
    const popupOverlay = document.getElementById("popupOverlay");
    const popupTexte = document.querySelector(".popupTexte");

    popupTexte.innerHTML = translateMessage;
    popupOverlay.style.display = "block";
    popupModal.classList.add("active");
  } catch (error) {

    const popupModal = document.getElementById("popupModal");
    const popupOverlay = document.getElementById("popupOverlay");
    const popupTexte = document.querySelector(".popupTexte");

    popupTexte.innerHTML = `An error occurred: ${message}`;
    popupOverlay.style.display = "block";
    popupModal.classList.add("active");
  }
}

function hideErrorPopup() {
  const popupModal = document.getElementById("errorPopup");

  if (popupModal) {
    popupModal.style.display = "none";
    popupModal.classList.remove("active");
  }
}

function closePopup() {
  const popupModal = document.getElementById("popupModal");
  const popupOverlay = document.getElementById("popupOverlay");
  popupModal.classList.remove("active");
  popupOverlay.style.display = "none";
}

async function showInfoPopup(message) {
  const popupModal = document.getElementById("infoPopup");

  let translations = {};

  try {
    const language = await getLanguageFromAPI();
    await setPreferredLanguage(language);

    const response = await fetch(`/static/languages/${language}.json`);
    if (!response.ok) {
      throw new Error("Failed to load translations");
    }

    translations = await response.json();

    const translateMessage =
      translations.info && translations.info[message]
        ? translations.info[message]
        : `Translation missing for: ${message}`;

    if (popupModal) {
      const messageContainer = popupModal.querySelector(".popupTexte");
      if (messageContainer) {
        messageContainer.textContent = translateMessage;
      }

      popupModal.style.display = "flex";
      popupModal.classList.add("active");

      setTimeout(() => hideInfoPopup(), 3000);
    }
  } catch (error) {}
}

function hideInfoPopup() {
  const popupModal = document.getElementById("infoPopup");

  if (popupModal) {
    popupModal.style.display = "none";
    popupModal.classList.remove("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const errorPopupClose = document.querySelector("#errorPopup .popupClose");
  const infoPopupClose = document.querySelector("#infoPopup .popupClose");

  if (errorPopupClose) {
    errorPopupClose.addEventListener("click", hideErrorPopup);
  }

  if (infoPopupClose) {
    infoPopupClose.addEventListener("click", hideInfoPopup);
  }
});

document.getElementById("popupCloseBtn").addEventListener("click", closePopup);
document.getElementById("popupOverlay").addEventListener("click", closePopup);
