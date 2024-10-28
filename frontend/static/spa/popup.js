// function initatilizePopUp() {
//   const input = document.getElementById("fileInput");
//   const popupModal = document.getElementById("popupModal");
//   const popupOverlay = document.getElementById("popupOverlay");
//   const previewContainer = document.getElementById("previewContainer");
//   const previewImage = document.getElementById("previewImage");

//   function openPopup() {
//     popupOverlay.style.display = "block";
//     popupModal.classList.add("active");
//   }

//   function closePopup() {
//     popupModal.classList.remove("active"); // Ajout de cette ligne
//     popupOverlay.style.display = "none";
//   }

//   input.addEventListener("change", function (e) {
//     const file = e.target.files[0];

//     if (file) {
//       const validTypes = ["image/png"];
//       const fileExtension = file.name.split(".").pop().toLowerCase();

//       if (!validTypes.includes(file.type) || fileExtension !== "png") {
//         openPopup();
//         input.value = "";
//         previewContainer.style.display = "none";
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = function (e) {
//         previewImage.src = e.target.result;
//         previewContainer.style.display = "block";
//       };
//       reader.readAsDataURL(file);
//     }
//   });

//   document
//     .getElementById("popupCloseBtn")
//     .addEventListener("click", closePopup);
//   popupOverlay.addEventListener("click", closePopup);
// }

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
