
//document.getElementById('userForm').addEventListener('submit', function (event) {
//    event.preventDefault(); // Empêche la soumission par défaut du formulaire
//
//    // Récupère les données du formulaire
//    const email = document.getElementById('email').value;
//    const password1 = document.getElementById('password1').value;
//
//    // Variables pour inscription
//    let username = null;
//    let password2 = null;
//
//    // Vérifie si on est en mode "inscription"
//    if (isRegistering) {
//        username = document.getElementById('username').value;
//        password2 = document.getElementById('password2').value;
//
//        // Vérifie que les mots de passe correspondent
//        if (password1 !== password2) {
//            alert('Les mots de passe ne correspondent pas.');
//            return;
//        }
//
//        // Vérifie que le champ "username" est rempli
//        if (!username) {
//            alert('Veuillez entrer un nom d\'utilisateur.');
//            return;
//        }
//    }
//
//    // Désactiver le bouton de soumission pendant la requête
//    document.getElementById('submitBtn').disabled = true;
//
//    // Détermine l'URL et les données à envoyer en fonction du mode (inscription ou connexion)
//    const url = isRegistering ? '/api/register/' : '/api/login/';
//    const body = isRegistering
//        ? JSON.stringify({ username: username, email: email, password1: password1, password2: password2 })
//        : JSON.stringify({ email: email, password: password1 });
//
//    // Envoie la requête POST avec fetch
//    fetch(url, {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json',
//        },
//        body: body
//    })
//    .then(response => {
//        if (!response.ok) {
//            throw new Error('Erreur HTTP: ' + response.status);
//        }
//        return response.json();
//    })
//    .then(data => {
//        if (data.success) {
//            alert(isRegistering ? 'Inscription réussie !' : 'Connexion réussie !');
//
//            // Si on est en mode inscription, tenter de se connecter automatiquement
//            if (isRegistering) {
//                fetch('/api/login/', {
//                    method: 'POST',
//                    headers: {
//                        'Content-Type': 'application/json',
//                    },
//                    body: JSON.stringify({
//                        email: email,
//                        password: password1
//                    })
//                })
//                .then(response => {
//                    if (!response.ok) {
//                        throw new Error('Erreur lors de la connexion automatique');
//                    }
//                    return response.json();
//                })
//                .then(loginData => {
//                    if (loginData.success) {
//                        // Stocker les tokens JWT
//                        localStorage.setItem('access_token', loginData.access);
//                        localStorage.setItem('refresh_token', loginData.refresh);
//
//                        // Redirection vers la page du jeu
//                        window.location.href = '/game/';
//                    } else {
//                        alert('Erreur lors de la connexion automatique');
//                    }
//                })
//                .catch(error => {
//                    console.error('Erreur:', error);
//                    alert('Erreur lors de la connexion automatique.');
//                });
//            } else {
//                // Si on est en mode connexion, rediriger vers la page du jeu
//                localStorage.setItem('access_token', data.access);
//                localStorage.setItem('refresh_token', data.refresh);
//                window.location.href = '/game/';
//            }
//        } else {
//            alert('Erreur : ' + data.message);
//        }
//    })
//    .catch(error => {
//        console.error('Erreur:', error);
//        alert('Une erreur est survenue, veuillez réessayer plus tard.');
//    })
//    .finally(() => {
//        // Réactiver le bouton de soumission après la requête
//        document.getElementById('submitBtn').disabled = false;
//    });
//});
//

// auth.js

// Connexion avec gestion 2FA
// document.getElementById("loginWidget").addEventListener("submit", function (event) {
//   event.preventDefault();
//   console.log("Formulaire de connexion intercepté.");

//   const email = document.getElementById("loginEmail").value;
//   const password = document.getElementById("loginPassword").value;

//   // Réinitialiser les messages d'erreur
//   clearErrors();

//   // Désactiver le bouton pendant le traitement
//   document.getElementById("submitLoginBtn").disabled = true;

//   fetch("/api/login/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//   })
//   .then((response) => response.json())
//   .then((data) => {
//       if (data.success) {
//           if (data.require_2fa) {
//               // Afficher le popup 2FA
//               show2FAPopup(data.user_id);
//           } else {
//               // Connexion normale sans 2FA
//               localStorage.setItem("access_token", data.access);
//               localStorage.setItem("refresh_token", data.refresh);
//               window.location.href = "/home";
//           }
//       } else {
//           showErrorPopup(data.message || "Identifiants invalides");
//       }
//   })
//   .catch((error) => {
//       console.error("Erreur lors de la connexion :", error);
//       showErrorPopup("Une erreur est survenue, veuillez réessayer plus tard.");
//   })
//   .finally(() => {
//       document.getElementById("submitLoginBtn").disabled = false;
//   });
// });

// // Fonction pour afficher le popup 2FA
// function show2FAPopup(userId) {
//   const popupHTML = `
//       <div class="popup-overlay" id="twoFactorPopup">
//           <div class="popup-content">
//               <h2 class="text-center mb-4">Vérification en deux étapes</h2>
//               <p class="mb-4">Un code de vérification a été envoyé à votre adresse email.</p>
//               <div class="formInputFrame">
//                   <input
//                       type="text"
//                       id="verificationCode"
//                       name="verificationCode"
//                       class="inputFrame"
//                       placeholder=" "
//                       required
//                   />
//                   <label for="verificationCode" class="inputLabel">Code de vérification</label>
//               </div>
//               <div class="modifyButtonsFrame">
//                   <button class="btn-icon" id="verify2FABtn">
//                       <svg>
//                           <use href="/static/assets/icons/sprite.svg#check"></use>
//                       </svg>
//                       Vérifier
//                   </button>
//                   <button class="btn-icon" id="cancel2FABtn">
//                       <svg>
//                           <use href="/static/assets/icons/sprite.svg#close"></use>
//                       </svg>
//                       Annuler
//                   </button>
//               </div>
//           </div>
//       </div>
//   `;

//   document.body.insertAdjacentHTML('beforeend', popupHTML);

//   // Gestion de la vérification
//   document.getElementById('verify2FABtn').addEventListener('click', () => {
//       const code = document.getElementById('verificationCode').value;
//       verify2FACode(userId, code);
//   });

//   // Gestion de l'annulation
//   document.getElementById('cancel2FABtn').addEventListener('click', () => {
//       document.getElementById('twoFactorPopup').remove();
//   });
// }

// // Fonction pour vérifier le code 2FA
// function verify2FACode(userId, code) {
//   fetch("/api/verify-2fa-login/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ user_id: userId, code: code }),
//   })
//   .then((response) => response.json())
//   .then((data) => {
//       if (data.success) {
//           localStorage.setItem("access_token", data.access);
//           localStorage.setItem("refresh_token", data.refresh);
//           window.location.href = "/home";
//       } else {
//           showErrorPopup(data.message || "Code invalide");
//       }
//   })
//   .catch((error) => {
//       console.error("Erreur lors de la vérification 2FA :", error);
//       showErrorPopup("Une erreur est survenue lors de la vérification");
//   });
// }



// Connexion
// document
//   .getElementById("loginWidget")
//   .addEventListener("submit", function (event) {
//     event.preventDefault(); // Empêche la soumission classique du formulaire
//     console.log("Formulaire de connexion intercepté.");

//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;

//     document.getElementById("submitLoginBtn").disabled = true;

//     fetch("/api/login/", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: email, password: password }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.success) {
//           localStorage.setItem("access_token", data.access);
//           localStorage.setItem("refresh_token", data.refresh);

//           // Redirection vers /home
//           window.navigateTo("/home");
//         } else {
//           alert("Erreur : " + data.message);
//         }
//       })
//       .catch((error) => {
//         console.error("Erreur lors de la connexion :", error);
//         alert("Une erreur est survenue, veuillez réessayer plus tard.");
//       })
//       .finally(() => {
//         document.getElementById("submitLoginBtn").disabled = false;
//       });
//   });

// Inscription
// document.getElementById('registerWidget').addEventListener('submit', function (event) {
//     event.preventDefault();  // Empêche la soumission classique du formulaire
//     console.log("Formulaire d'inscription intercepté.");

//     const username = document.getElementById('username').value;
//     const email = document.getElementById('registerEmail').value;
//     const password1 = document.getElementById('registerPassword').value;
//     const password2 = document.getElementById('confirmPassword').value;

//     if (password1 !== password2) {
//         alert('Les mots de passe ne correspondent pas.');
//         return;
//     }

//     document.getElementById('submitRegisterBtn').disabled = true;

//     fetch('/api/register/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username: username, email: email, password1: password1, password2: password2 })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             // Connexion automatique après inscription réussie
//             fetch('/api/login/', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email: email, password: password1 })
//             })
//             .then(loginResponse => loginResponse.json())
//             .then(loginData => {
//                 if (loginData.success) {
//                     localStorage.setItem('access_token', loginData.access);
//                     localStorage.setItem('refresh_token', loginData.refresh);

//                     // Redirection vers /home
//                     window.navigateTo('/home');
//                 } else {
//                     alert('Erreur lors de la connexion automatique');
//                 }
//             })
//             .catch(error => {
//                 console.error('Erreur lors de la connexion automatique :', error);
//                 alert('Erreur lors de la connexion automatique.');
//             });
//         } else {
//             alert('Erreur lors de l\'inscription : ' + data.message);
//         }
//     })
//     .catch(error => {
//         console.error('Erreur lors de l\'inscription :', error);
//         alert('Une erreur est survenue, veuillez réessayer plus tard.');
//     })
//     .finally(() => {
//         document.getElementById('submitRegisterBtn').disabled = false;
//     });
// });

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

    if (password1 !== password2) {
      displayError("password2", "Les mots de passe ne correspondent pas.");
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
              displayError(field, messages.join(", "));
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
        document.getElementById("submitRegisterBtn").disabled = false;
      });
  });

// Fonction pour afficher les erreurs sous chaque champ du formulaire
function displayError(field, message) {
  const errorElement = document.getElementById(`${field}Error`);
  if (errorElement) {
    errorElement.innerText = message;
    errorElement.style.display = "block";
  }
}

// Fonction pour réinitialiser les erreurs
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





class AuthService {
  constructor() {
      this.baseUrl = 'https://localhost:4430';
  }

  setTokens(tokens) {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
  }

  setUserData(userData) {
      localStorage.setItem('user_data', JSON.stringify(userData));
  }

  clearAuth() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
  }
}

const authService = new AuthService();

// Gestionnaire d'authentification 42
document.getElementById('42').addEventListener('click', async function(e) {
  e.preventDefault();
  console.log('Starting 42 authentication process...');

  try {
      const baseUrl = 'https://localhost:4430';
      
      console.log('Fetching auth URL...');
      const response = await fetch(`${baseUrl}/api/get_auth_url/`, {
          method: 'GET',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },
          credentials: 'include',
          mode: 'cors'
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received auth URL:', data.auth_url);

      if (data.success && data.auth_url) {
          // Gestionnaire de message pour la fenêtre principale
          const messageHandler = function(event) {
              console.log('Message received:', event);
              
              if (event.origin === baseUrl && event.data.type === 'auth_success') {
                  console.log('Authentication successful, storing tokens...');
                  
                  // Stocker les tokens
                  localStorage.setItem('access_token', event.data.tokens.access);
                  localStorage.setItem('refresh_token', event.data.tokens.refresh);
                  
                  // Stocker les données utilisateur
                  if (event.data.user) {
                      localStorage.setItem('user_data', JSON.stringify(event.data.user));
                  }
                  
                  // Nettoyer le gestionnaire
                  window.removeEventListener('message', messageHandler);
                  
                  console.log('Redirecting to home...');
                  // Rediriger vers la page d'accueil
                  window.location.replace(`${baseUrl}/home`);
              }
          };

          // Ajouter le gestionnaire avant d'ouvrir la popup
          window.addEventListener('message', messageHandler);
          
          console.log('Opening auth window...');
          const authWindow = window.open(
              data.auth_url,
              '42 Authentication',
              'width=600,height=700'
          );

          if (!authWindow) {
              window.removeEventListener('message', messageHandler);
              throw new Error('Popup window was blocked');
          }

          // Vérifier si la fenêtre est fermée
          const checkPopup = setInterval(() => {
            if (authWindow.closed) {
                console.log('Auth window closed, cleaning up...');
                clearInterval(checkPopup);
                window.removeEventListener('message', messageHandler);
                
                // Vérification finale de l'authentification
                fetch(`${baseUrl}/api/check-auth/`, {
                    credentials: 'include'
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Final auth check:', data);
                    if (data.success) {
                        console.log('Confirmed authenticated, redirecting to home...');
                        window.location.replace(`${baseUrl}/home`);
                    }
                })
                .catch(error => console.error('Final auth check failed:', error));
            }
        }, 500);
      }
  } catch (error) {
      console.error('Authentication error:', error);
      alert('Erreur lors de l\'authentification 42: ' + error.message);
  }
});