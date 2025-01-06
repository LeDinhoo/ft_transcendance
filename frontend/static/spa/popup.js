// function showErrorPopup(message) {
//     const popupModal = document.getElementById("popupModal");
//     const popupOverlay = document.getElementById("popupOverlay");
//     const popupTexte = document.querySelector(".popupTexte");

//     popupTexte.innerHTML = message;

//     popupOverlay.style.display = "block";
//     popupModal.classList.add("active");
// }

async function showErrorPopup(message) {
  let translations = {};

  try {
    // Obtenir la langue de l'API
    const language = await getLanguageFromAPI();
    await setPreferredLanguage(language);

    // Charger les traductions
    const response = await fetch(`/static/languages/${language}.json`);
    if (!response.ok) {
      throw new Error("Failed to load translations");
    }

    translations = await response.json();

    // Traduire le message
    const translateMessage =
      translations.error && translations.error[message]
        ? translations.error[message]
        : `Translation missing for: ${message}`;

    console.log("Translated Message:", translateMessage);

    // Afficher le popup
    const popupModal = document.getElementById("popupModal");
    const popupOverlay = document.getElementById("popupOverlay");
    const popupTexte = document.querySelector(".popupTexte");

    popupTexte.innerHTML = translateMessage;
    popupOverlay.style.display = "block";
    popupModal.classList.add("active");
  } catch (error) {
    console.error("Error in showErrorPopup:", error);
  }
}

// Ferme la popup d'erreur
function hideErrorPopup() {
  const popupModal = document.getElementById("errorPopup");

  if (popupModal) {
    popupModal.style.display = "none"; // Cache la popup
    popupModal.classList.remove("active");
  }
}

function closePopup() {
  const popupModal = document.getElementById("popupModal");
  const popupOverlay = document.getElementById("popupOverlay");
  popupModal.classList.remove("active");
  popupOverlay.style.display = "none";
}

// Affiche la popup d'information
async function showInfoPopup(message) {
  const popupModal = document.getElementById("infoPopup");

  let translations = {};

  try {
    // Obtenir la langue de l'API
    const language = await getLanguageFromAPI();
    await setPreferredLanguage(language);

    // Charger les traductions
    const response = await fetch(`/static/languages/${language}.json`);
    if (!response.ok) {
      throw new Error("Failed to load translations");
    }

    translations = await response.json();

    // Traduire le message
    const translateMessage =
      translations.info && translations.info[message]
        ? translations.info[message]
        : `Translation missing for: ${message}`;

    console.log("Translated Message:", translateMessage);

	if (popupModal) {
	  const messageContainer = popupModal.querySelector(".popupTexte");
	  if (messageContainer) {
		messageContainer.textContent = translateMessage;
	  }
  
	  popupModal.style.display = "flex"; // Rend la popup visible
	  popupModal.classList.add("active");
  
	  setTimeout(() => hideInfoPopup(), 3000); // Fermeture automatique après 3 secondes
	}
  } catch (error) {
    console.error("Error in showInfoPopup:", error);
  }
}

// Ferme la popup d'information
function hideInfoPopup() {
  const popupModal = document.getElementById("infoPopup");

  if (popupModal) {
    popupModal.style.display = "none"; // Cache la popup
    popupModal.classList.remove("active");
  }
}

// Ajout des gestionnaires d'événements pour fermer les popups
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
