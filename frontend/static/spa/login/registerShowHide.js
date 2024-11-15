const loginWidget = document.getElementById("loginWidget");
const registerWidget = document.getElementById("registerWidget");
const signUpButton = document.getElementById("signUpButton");
const registerButton = document.getElementById("registerButton");
const loginTitle = document.getElementById("loginTitle");
const registerTitle = document.getElementById("registerTitle"); // Ajoutez cette ligne

// Fonction pour ajouter l'effet de rebond
function addBounceEffect(element) {
  element.classList.add("bounce");
  setTimeout(() => {
    element.classList.remove("bounce");
  }, 1000); // Durée de l'animation
}

function addReverseBounceEffect(element) {
  element.classList.add("invertBounce");
  setTimeout(() => {
    element.classList.remove("invertBounce");
  }, 1000); // Durée de l'animation
}

registerButton.addEventListener("click", () => {
  loginWidget.style.display = "none";
  registerWidget.style.display = "flex";
  addBounceEffect(registerTitle);
});

signUpButton.addEventListener("click", () => {
  loginWidget.style.display = "flex";
  registerWidget.style.display = "none";
  addReverseBounceEffect(loginTitle);
});

registerWidget.style.display = "none";
