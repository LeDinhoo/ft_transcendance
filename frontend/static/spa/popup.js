// popup.js
function showErrorPopup(message) {
  const popupModal = document.getElementById("popupModal");
  const popupOverlay = document.getElementById("popupOverlay");
  const popupTexte = document.querySelector(".popupTexte");

  popupTexte.innerHTML = message; 

  popupOverlay.style.display = "block";
  popupModal.classList.add("active");
}

function closePopup() {
  const popupModal = document.getElementById("popupModal");
  const popupOverlay = document.getElementById("popupOverlay");
  popupModal.classList.remove("active");
  popupOverlay.style.display = "none";
}

document.getElementById("popupCloseBtn").addEventListener("click", closePopup);
document.getElementById("popupOverlay").addEventListener("click", closePopup);
