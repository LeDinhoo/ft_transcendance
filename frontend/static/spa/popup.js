// popup.js
function showErrorPopup(message) {
  const popupModal = document.getElementById("popupModal");
  const popupOverlay = document.getElementById("popupOverlay");
  const popupTexte = document.querySelector(".popupTexte");

  // Met à jour le texte du pop-up avec le message d'erreur
  // popupTexte.textContent = message;
  popupTexte.innerHTML = message; // Utilisez innerHTML pour interpréter le <br>

  // Affiche la pop-up et l'overlay
  popupOverlay.style.display = "block";
  popupModal.classList.add("active");
}

function closePopup() {
  const popupModal = document.getElementById("popupModal");
  const popupOverlay = document.getElementById("popupOverlay");
  popupModal.classList.remove("active");
  popupOverlay.style.display = "none";
}

// Attacher l'événement pour fermer la pop-up quand on clique sur le bouton "OK"
document.getElementById("popupCloseBtn").addEventListener("click", closePopup);

// Attacher l'événement pour fermer la pop-up quand on clique en dehors (sur l'overlay)
document.getElementById("popupOverlay").addEventListener("click", closePopup);
