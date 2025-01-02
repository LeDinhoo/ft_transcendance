// Affiche la popup d'erreur
function showErrorPopup(message) {
    const popupModal = document.getElementById("errorPopup");

    if (popupModal) {
        const messageContainer = popupModal.querySelector(".popupTexte");
        if (messageContainer) {
            messageContainer.textContent = message;
        }

        popupModal.style.display = "flex"; // Rend la popup visible
        popupModal.classList.add("active");

        setTimeout(() => hideErrorPopup(), 3000); // Fermeture automatique après 3 secondes
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

// Affiche la popup d'information
function showInfoPopup(message) {
    const popupModal = document.getElementById("infoPopup");

    if (popupModal) {
        const messageContainer = popupModal.querySelector(".popupTexte");
        if (messageContainer) {
            messageContainer.textContent = message;
        }

        popupModal.style.display = "flex"; // Rend la popup visible
        popupModal.classList.add("active");

        setTimeout(() => hideInfoPopup(), 3000); // Fermeture automatique après 3 secondes
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
