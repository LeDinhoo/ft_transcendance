// auth.js

// Connexion
document.getElementById("loginWidget").addEventListener("submit", function (event) {
    event.preventDefault(); // Empêche la soumission classique du formulaire
    console.log("Formulaire de connexion intercepté.");
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    // Désactive le bouton pendant le traitement
    document.getElementById("submitLoginBtn").disabled = true;
  
    fetch("/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Stocker les tokens JWT
          localStorage.setItem("access_token", data.access);
          localStorage.setItem("refresh_token", data.refresh);
  
          // Redirection vers /home après connexion réussie
          window.location.href = "/home";
        } else {
          displayError("email", data.message); // Affiche l'erreur de connexion
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la connexion :", error);
        alert("Une erreur est survenue, veuillez réessayer plus tard.");
      })
      .finally(() => {
        // Réactiver le bouton
        document.getElementById("submitLoginBtn").disabled = false;
      });
  });
  
  // Inscription
  document.getElementById("registerWidget").addEventListener("submit", function (event) {
    event.preventDefault(); // Empêche la soumission classique du formulaire
    console.log("Formulaire d'inscription intercepté.");
  
    const username = document.getElementById("username").value;
    const email = document.getElementById("registerEmail").value;
    const password1 = document.getElementById("registerPassword").value;
    const password2 = document.getElementById("confirmPassword").value;
  
    // Réinitialiser les messages d'erreur
    clearErrors();
  
    // Validation des mots de passe
    if (password1 !== password2) {
      displayError("confirmPassword", "Les mots de passe ne correspondent pas.");
      return;
    }
  
    // Désactiver le bouton pendant le traitement
    document.getElementById("submitRegisterBtn").disabled = true;
  
    fetch("/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        email: email,
        password1: password1,
        password2: password2,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Connexion automatique après inscription réussie
          fetch("/api/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password1 }),
          })
            .then((loginResponse) => loginResponse.json())
            .then((loginData) => {
              if (loginData.success) {
                localStorage.setItem("access_token", loginData.access);
                localStorage.setItem("refresh_token", loginData.refresh);
  
                // Redirection vers /home
                window.location.href = "/home";
              } else {
                alert("Erreur lors de la connexion automatique");
              }
            })
            .catch((error) => {
              console.error("Erreur lors de la connexion automatique :", error);
              alert("Erreur lors de la connexion automatique.");
            });
        } else {
          // Gérer les erreurs spécifiques renvoyées par le serveur
          if (data.errors) {
            for (const [field, messages] of Object.entries(data.errors)) {
              const errorMessages = messages.map((msg) => msg.message).join(", ");
              displayError(field, errorMessages);
            }
          } else {
            alert("Erreur lors de l'inscription : " + data.message);
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'inscription :", error);
        alert("Une erreur est survenue, veuillez réessayer plus tard.");
      })
      .finally(() => {
        // Réactiver le bouton
        document.getElementById("submitRegisterBtn").disabled = false;
      });
  });
  
  // Fonction pour afficher les erreurs sous chaque champ du formulaire
  function displayError(field, message) {
    const errorElement = document.getElementById(`${field}Error`);
    if (errorElement) {
      errorElement.innerText = message;
      errorElement.style.display = "block";
    } else {
      // Si l'élément n'existe pas (erreur inattendue), on affiche une alerte
      alert(`Erreur dans ${field}: ${message}`);
    }
  }
  
  // Fonction pour réinitialiser les erreurs affichées
  function clearErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(function (el) {
      el.innerText = "";
      el.style.display = "none";
    });
  }
  
  // Fonction de navigation pour changer d'URL sans rechargement de page
  function navigateTo(path) {
    history.pushState(null, "", path); // Met à jour l'URL sans recharger
    loadPageFromURL(); // Charge la nouvelle page correspondant à l'URL
  }
  