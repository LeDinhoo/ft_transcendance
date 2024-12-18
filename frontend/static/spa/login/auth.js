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
        credentials: "include",
        body: JSON.stringify({ email: email, password: password }),
      });

      const loginData = await loginResponse.json();
      console.log("login Data: ", loginData);

      if (loginData.requires_2fa) {
        showTwoFactorPopup(loginData.user_id);
      } else if (loginData.success) {
        handleSuccessfulLogin(loginData);
      } else {
        // showErrorPopup(loginData.message || "Identifiants invalides");
        showErrorPopup("Identifiants invalides");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      showErrorPopup("Une erreur est survenue, veuillez réessayer plus tard.");
    } finally {
      submitBtn.disabled = false;
    }
  });

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

    const response = await fetch("/api/2fa/verify/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
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
      const messageHandler = function (event) {
        console.log("Message received:", event);

        if (event.origin === baseUrl && event.data.type === "auth_success") {
          console.log("Authentication successful, storing tokens...");

          localStorage.setItem("access_token", event.data.tokens.access);
          localStorage.setItem("refresh_token", event.data.tokens.refresh);

          if (event.data.user) {
            localStorage.setItem("user_data", JSON.stringify(event.data.user));
          }

          window.removeEventListener("message", messageHandler);

          console.log("Redirecting to home...");

          window.location.replace(`${baseUrl}/home`);
        }
      };

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

      const checkPopup = setInterval(() => {
        if (authWindow.closed) {
          console.log("Auth window closed, cleaning up...");
          clearInterval(checkPopup);
          window.removeEventListener("message", messageHandler);

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

document
  .getElementById("registerWidget")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Formulaire d'inscription intercepté.");

    const username = document.getElementById("username").value;
    const email = document.getElementById("registerEmail").value;
    const password1 = document.getElementById("registerPassword").value;
    const password2 = document.getElementById("confirmPassword").value;

    clearErrors();

    // Valider les champs
    let validationError = validateRegistrationForm({
      username,
      email,
      password1,
      password2,
    });

    if (validationError) {
      // Affiche une popup pour la première erreur trouvée
      showErrorPopup(validationError);
      return;
    }

    if (password1 !== password2) {
      showErrorPopup("Les mots de passe ne correspondent pas.");
      return;
    }

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
          // Connexion automatique après inscription
          fetch("/api/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: email, password: password1 }),
          })
            .then((loginResponse) => loginResponse.json())
            .then((loginData) => {
              if (loginData.success) {
                window.location.href = "/home";
              } else {
                showErrorPopup("Erreur lors de la connexion automatique.");
              }
            });
        } else {
          // Vérifie si des erreurs spécifiques sont renvoyées
          if (data.errors) {
            let errorMessages = [];
            for (const [field, errors] of Object.entries(data.errors)) {
              errors.forEach((error) => {
                errorMessages.push(`${field}: ${error.message}`);
              });
            }
            showErrorPopup(errorMessages.join("<br>"));
          } else {
            showErrorPopup(data.message || "Une erreur est survenue.");
          }
        }
      })
      .catch((error) => {
        console.error("Erreur lors de l'inscription :", error);
        showErrorPopup("Une erreur est survenue, veuillez réessayer plus tard.");
      })
      .finally(() => {
        document.getElementById("submitRegisterBtn").disabled = false;
      });
    
    

    // fetch("/api/register/", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     username: username,
    //     email: email,
    //     password1: password1,
    //     password2: password2,
    //   }),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     if (data.success) {

    //       fetch("/api/login/", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         credentials: "include",
    //         body: JSON.stringify({ email: email, password: password1 }),
    //       })
    //         .then((loginResponse) => loginResponse.json())
    //         .then((loginData) => {
    //           if (loginData.success) {
    //             window.location.href = "/home";
    //           } else {
    //             showErrorPopup("Erreur lors de la connexion automatique");

    //           }
    //         })
    //         .catch((error) => {
    //           console.error("Erreur lors de la connexion automatique :", error);
    //           showErrorPopup("Erreur lors de la connexion automatique.");

    //         });
    //     } else {
    //       showErrorPopup(
    //         "Votre mot de passe doit contenir au moins : <br>- une majuscule <br>- une minuscule <br>- un chiffre <br>- un caractère spécial <br>- au minimum 8 caractères. "
    //       );
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Erreur lors de l'inscription :", error);
    //     showErrorPopup(
    //       "Une erreur est survenue, veuillez réessayer plus tard."
    //     );

    //   })
    //   .finally(() => {

    //     document.getElementById("submitRegisterBtn").disabled = false;
    //   });
  });

/**
 * Valide le formulaire d'inscription et retourne un message d'erreur en cas de problème.
 * @param {Object} formData - Les données du formulaire à valider
 * @returns {string|null} - Message d'erreur ou null si aucune erreur
 */
function validateRegistrationForm(formData) {
  const { username, email, password1, password2 } = formData;

  // Vérifie si le nom d'utilisateur est vide
  if (!username.trim()) {
    return "Le nom d'utilisateur ne peut pas être vide.";
  }

  // Vérifie si le nom d'utilisateur dépasse 15 caractères
  if (username.length > 15) {
    return "Le nom d'utilisateur ne doit pas dépasser 15 caractères.";
  }

  // Vérifie si l'email est valide
  if (!isValidEmail(email)) {
    return "L'adresse email est invalide.";
  }

  // Vérifie si le mot de passe respecte les règles
  if (!isValidPassword(password1)) {
    return "Le mot de passe doit contenir au moins : <br>- une majuscule <br>- une minuscule <br>- un chiffre <br>- un caractère spécial :  @$!%*?& <br>- 8 caractères minimum.";
  }

  // Vérifie si les mots de passe correspondent
  if (password1 !== password2) {
    return "Les mots de passe ne correspondent pas.";
  }

  // Pas d'erreur
  return null;
}

/**
 * Valide si un email est correct.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide si un mot de passe est valide.
 * @param {string} password
 * @returns {boolean}
 */
function isValidPassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// /**
//  * Affiche une popup d'erreur.
//  * @param {string} message - Message d'erreur à afficher.
//  */
// function showErrorPopup(message) {
//   const popup = document.createElement("div");
//   popup.className = "error-popup";
//   popup.innerHTML = `
//     <div class="popup-content">
//       <p>${message}</p>
//       <button id="closePopup">OK</button>
//     </div>
//   `;
//   document.body.appendChild(popup);

//   // Ajouter un événement pour fermer la popup
//   document.getElementById("closePopup").addEventListener("click", () => {
//     popup.remove();
//   });
// }

function displayError(field, message) {
  const errorElement = document.getElementById(`${field}Error`);
  if (errorElement) {
    errorElement.innerText = message;
    errorElement.style.display = "block";
  } else {
    alert(`Erreur dans ${field}: ${message}`);
  }
}

function clearErrors() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach(function (el) {
    el.innerText = "";
    el.style.display = "none";
  });
}

function navigateTo(path) {
  history.pushState(null, "", path);
  loadPageFromURL();
}
