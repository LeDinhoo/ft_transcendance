function showErrorPopup(message) {
    const popupModal = document.getElementById("popupModal");
    const popupOverlay = document.getElementById("popupOverlay");
    const popupTexte = document.querySelector(".popupTexte");

    popupTexte.innerHTML = message;

    popupOverlay.style.display = "block";
    popupModal.classList.add("active");
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

document.getElementById("popupCloseBtn").addEventListener("click", closePopup);
document.getElementById("popupOverlay").addEventListener("click", closePopup);
