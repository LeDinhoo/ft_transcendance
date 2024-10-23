// auth.js
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


// Fonction utilitaire pour les requêtes authentifiées
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) {
      window.location.href = '/login-register/';
      return null;
  }

  const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
  };

  try {
      const response = await fetch(url, {
          ...options,
          headers
      });

      if (response.status === 401) {
          // Token invalide ou expiré
          authService.clearAuth();
          window.location.href = '/login-register/';
          return null;
      }

      return response;
  } catch (error) {
      console.error('Fetch error:', error);
      return null;
  }
}

// async function fetchProfile() {
//   try {
//       const response = await fetch('https://localhost:4430/api/profil/', {
//           method: 'GET',
//           credentials: 'include',
//           headers: {
//               'Accept': 'application/json',
//           }
//       });

//       if (response.ok) {
//           const data = await response.json();
//           if (data.success) {
//               // Update UI with profile data
//               console.log('Profile data:', data.user);
//               return data.user;
//           }
//       } else if (response.status === 401) {
//           // Redirect to login if unauthorized
//           window.location.href = '/login-register/';
//       }
//   } catch (error) {
//       console.error('Error fetching profile:', error);
//   }
//   return null;
// }

// // Check authentication status when needed
// window.addEventListener('load', async () => {
//   if (window.location.pathname === '/profil' || window.location.pathname === '/home') {
//       const userData = await fetchProfile();
//       if (!userData) {
//           window.location.href = '/login-register/';
//       }
//   }
// });



// Fonction pour gérer l'authentification
// const handle42Auth = async () => {
//   console.log('Starting 42 authentication process...');

//   try {
//       const baseUrl = 'https://localhost:4430';
      
//       console.log('Fetching auth URL from:', `${baseUrl}/api/get_auth_url/`);
      
//       const response = await fetch(`${baseUrl}/api/get_auth_url/`, {
//           method: 'GET',
//           headers: {
//               'Accept': 'application/json',
//               'Content-Type': 'application/json',
//           },
//           credentials: 'include',
//           mode: 'cors'
//       });

//       if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Received data:', data);

//       if (data.success && data.auth_url) {
//           // Stocker l'état actuel pour la vérification après redirection
//           const state = Math.random().toString(36).substring(7);
//           sessionStorage.setItem('authState', state);
          
//           // Construire l'URL avec l'état
//           const authUrl = `${data.auth_url}&state=${state}`;
//           console.log('Opening auth window with URL:', authUrl);
          
//           // Ouvrir l'authentification dans une nouvelle fenêtre
//           const authWindow = window.open(
//               authUrl,
//               '42 Authentication',
//               'width=600,height=700,scrollbars=yes'
//           );

//           if (!authWindow) {
//               throw new Error('Popup window was blocked. Please allow popups for this site.');
//           }

//           // Fonction pour vérifier l'URL de la popup
//           const checkAuthWindow = setInterval(() => {
//               try {
//                   // Si la fenêtre est fermée
//                   if (authWindow.closed) {
//                       clearInterval(checkAuthWindow);
//                       console.log('Auth window was closed');
//                       return;
//                   }

//                   // Vérifier l'URL de la popup
//                   const currentUrl = authWindow.location.href;
                  
//                   if (currentUrl.includes('/api/callback-42')) {
//                       clearInterval(checkAuthWindow);
                      
//                       // Extraire le code et l'état de l'URL
//                       const urlParams = new URLSearchParams(new URL(currentUrl).search);
//                       const code = urlParams.get('code');
//                       const returnedState = urlParams.get('state');
                      
//                       // Vérifier l'état pour la sécurité
//                       const originalState = sessionStorage.getItem('authState');
//                       if (returnedState !== originalState) {
//                           throw new Error('State mismatch - possible CSRF attack');
//                       }
                      
//                       if (code) {
//                           console.log('Authorization code received:', code);
                          
//                           // Nettoyer le state
//                           sessionStorage.removeItem('authState');
                          
//                           // Fermer la fenêtre popup
//                           authWindow.close();
                          
//                           // Envoyer le code au backend
//                           handleAuthCode(code);
//                       } else {
//                           throw new Error('No authorization code received');
//                       }
//                   }
//               } catch (e) {
//                   // Ignorer les erreurs de même origine
//                   if (!e.message.includes('cross-origin')) {
//                       clearInterval(checkAuthWindow);
//                       console.error('Error checking auth window:', e);
//                       authWindow.close();
//                   }
//               }
//           }, 500);

//       } else {
//           throw new Error(data.error || 'URL d\'authentification non reçue');
//       }
//   } catch (error) {
//       console.error('Authentication error:', error);
//       alert('Erreur lors de l\'authentification 42: ' + error.message);
//   }
// };

// // Fonction pour gérer le code d'autorisation
// const handleAuthCode = async (code) => {
//   try {
//       const baseUrl = 'https://localhost:4430';
//       const callbackUrl = `${baseUrl}/api/callback-42/?code=${code}`;
//       console.log('Calling callback URL:', callbackUrl);
      
//       const response = await fetch(callbackUrl, {
//           method: 'GET',
//           credentials: 'include',
//           mode: 'cors',
//           headers: {
//               'Accept': 'application/json',
//               'Content-Type': 'application/json',
//           }
//       });
      
//       if (!response.ok) {
//           throw new Error(`Callback error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log('Callback response:', data);
      
//       if (data.success) {
//           console.log('Authentication successful, redirecting to home');
//           window.location.href = `${baseUrl}/home`;
//       } else {
//           throw new Error(data.error || 'Authentication failed');
//       }
//   } catch (error) {
//       console.error('Error processing authentication code:', error);
//       alert('Erreur lors de l\'authentification: ' + error.message);
//   }
// };

// // Attacher le gestionnaire au bouton
// document.getElementById('42').addEventListener('click', handle42Auth);
  
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
  