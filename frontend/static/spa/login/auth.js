// auth.js

document
  .getElementById("loginWidget")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Formulaire de connexion intercepté.");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const submitBtn = document.getElementById("submitLoginBtn");

    submitBtn.disabled = true;

    try {
      const loginResponse = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Envoie les cookies avec la requête
        body: JSON.stringify({ email: email, password: password }),
      });

      const loginData = await loginResponse.json();
      console.log("login Data: ", loginData);

      if (loginData.requires_2fa) {
        showTwoFactorPopup(loginData.user_id);
      } else if (loginData.success) {
        handleSuccessfulLogin(loginData);
      } else {
        showErrorPopup(loginData.message || "Identifiants invalides");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      showErrorPopup("Une erreur est survenue, veuillez réessayer plus tard.");
    } finally {
      submitBtn.disabled = false;
    }
  });

// Nouvelles fonctions pour le 2FA
function showTwoFactorPopup(userId) {
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.innerHTML = `
      <div class="popup-content">
          <h3>Vérification en deux étapes</h3>
          <p>Un code a été envoyé à votre adresse email</p>
          <div class="code-input-container">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
              <input type="text" class="code-input" maxlength="1" pattern="[0-9]" inputmode="numeric">
          </div>
          <div class="timer">Code valide pendant: <span id="countdown">10:00</span></div>
          <button class="verify-button" id="verifyButton" disabled>Vérifier</button>
          <p class="error-message" style="display: none;"></p>
      </div>
  `;

  document.body.appendChild(popup);
  setupCodeInputs(userId);
  startCountdown(10 * 60);

  return popup;
}

function setupCodeInputs(userId) {
  const inputs = document.querySelectorAll(".code-input");
  const verifyButton = document.getElementById("verifyButton");

  inputs.forEach((input, index) => {
    if (index === 0) input.focus();

    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");

      if (e.target.value) {
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      }

      const isComplete = Array.from(inputs).every(
        (input) => input.value.length === 1
      );
      verifyButton.disabled = !isComplete;
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  verifyButton.addEventListener("click", () => {
    const code = Array.from(inputs)
      .map((input) => input.value)
      .join("");
    verifyTwoFactorCode(userId, code);
  });
}

function startCountdown(duration) {
  const countdownElement = document.getElementById("countdown");
  let timer = duration;

  const countdown = setInterval(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    countdownElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (--timer < 0) {
      clearInterval(countdown);
      countdownElement.textContent = "Code expiré";
      document.getElementById("verifyButton").disabled = true;
    }
  }, 1000);
}

async function verifyTwoFactorCode(userId, code) {
  const verifyButton = document.getElementById("verifyButton");
  const errorMessage = document.querySelector(".error-message");

  try {
    verifyButton.disabled = true;
    verifyButton.textContent = "Vérification...";

    // const response = await fetch("/api/verify-2fa-login/", {
      const response = await fetch("/api/2fa/verify/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Pour envoyer et recevoir les cookies
      body: JSON.stringify({ user_id: userId, code: code }),
    });

    const data = await response.json();

    if (data.success) {
      handleSuccessfulLogin(data);
    } else {
      errorMessage.textContent = data.message || "Code invalide";
      errorMessage.style.display = "block";
      verifyButton.disabled = false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification 2FA:", error);
    errorMessage.textContent =
      "Une erreur est survenue lors de la vérification";
    errorMessage.style.display = "block";
  } finally {
    verifyButton.textContent = "Vérifier";
    verifyButton.disabled = false;
  }
}

function handleSuccessfulLogin(data) {
  const popup = document.querySelector(".popup-overlay");
  if (popup) {
    popup.remove();
  }

  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  window.location.href = "/home";
}

class AuthService {
  constructor() {
    this.baseUrl = "https://localhost:4430";
  }

  setTokens(tokens) {
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  }

  setUserData(userData) {
    localStorage.setItem("user_data", JSON.stringify(userData));
  }

  clearAuth() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  }
}

const authService = new AuthService();

// Gestionnaire d'authentification 42
document.getElementById("42").addEventListener("click", async function (e) {
  e.preventDefault();
  console.log("Starting 42 authentication process...");

  try {
    const baseUrl = "https://localhost:4430";

    console.log("Fetching auth URL...");
    const response = await fetch(`${baseUrl}/api/get_auth_url/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received auth URL:", data.auth_url);

    if (data.success && data.auth_url) {
      // Gestionnaire de message pour la fenêtre principale
      const messageHandler = function (event) {
        console.log("Message received:", event);

        if (event.origin === baseUrl && event.data.type === "auth_success") {
          console.log("Authentication successful, storing tokens...");

          // Stocker les tokens
          localStorage.setItem("access_token", event.data.tokens.access);
          localStorage.setItem("refresh_token", event.data.tokens.refresh);

          // Stocker les données utilisateur
          if (event.data.user) {
            localStorage.setItem("user_data", JSON.stringify(event.data.user));
          }

          // Nettoyer le gestionnaire
          window.removeEventListener("message", messageHandler);

          console.log("Redirecting to home...");
          // Rediriger vers la page d'accueil
          window.location.replace(`${baseUrl}/home`);
        }
      };

      // Ajouter le gestionnaire avant d'ouvrir la popup
      window.addEventListener("message", messageHandler);

      console.log("Opening auth window...");
      const authWindow = window.open(
        data.auth_url,
        "42 Authentication",
        "width=600,height=700"
      );

      if (!authWindow) {
        window.removeEventListener("message", messageHandler);
        throw new Error("Popup window was blocked");
      }

      // Vérifier si la fenêtre est fermée
      const checkPopup = setInterval(() => {
        if (authWindow.closed) {
          console.log("Auth window closed, cleaning up...");
          clearInterval(checkPopup);
          window.removeEventListener("message", messageHandler);

          // Vérification finale de l'authentification
          fetch(`${baseUrl}/api/check-auth/`, {
            credentials: "include",
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Final auth check:", data);
              if (data.success) {
                console.log("Confirmed authenticated, redirecting to home...");
                window.location.replace(`${baseUrl}/home`);
              }
            })
            .catch((error) => console.error("Final auth check failed:", error));
        }
      }, 500);
    }
  } catch (error) {
    console.error("Authentication error:", error);
    alert("Erreur lors de l'authentification 42: " + error.message);
  }
});

// Fonction utilitaire pour les requêtes authentifiées
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "/login-register/";
    return null;
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token invalide ou expiré
      authService.clearAuth();
      window.location.href = "/login-register/";
      return null;
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// // Attacher le gestionnaire au bouton
// document.getElementById('42').addEventListener('click', handle42Auth);

// Inscription
document
  .getElementById("registerWidget")
  .addEventListener("submit", function (event) {
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
      showErrorPopup("Les mots de passe ne correspondent pas.");
      // displayError("confirmPassword", "Les mots de passe ne correspondent pas.");
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
            credentials: "include", // Pour envoyer et recevoir les cookies
            body: JSON.stringify({ email: email, password: password1 }),
          })
            .then((loginResponse) => loginResponse.json())
            .then((loginData) => {
              if (loginData.success) {
                window.location.href = "/home";
              } else {
                showErrorPopup("Erreur lors de la connexion automatique");
                // alert("Erreur lors de la connexion automatique");
              }
            })
            .catch((error) => {
              console.error("Erreur lors de la connexion automatique :", error);
              showErrorPopup("Erreur lors de la connexion automatique.");
              // alert("Erreur lors de la connexion automatique.");
            });
        } else {
          showErrorPopup(
            "Votre mot de passe doit contenir au moins : <br>- une majuscule <br>- une minuscule <br>- un chiffre <br>- un caractère spécial <br>- au minimum 8 caractères. "
          );
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'inscription :", error);
        showErrorPopup(
          "Une erreur est survenue, veuillez réessayer plus tard."
        );
        // alert("Une erreur est survenue, veuillez réessayer plus tard.");
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
