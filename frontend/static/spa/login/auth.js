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


let authWindow;
let authCheckInterval;
let isAuth42ButtonInitialized = false;

function initAuth42Button() {
    if (isAuth42ButtonInitialized) {
        console.log('Bouton 42 déjà initialisé');
        return;
    }

    console.log('Tentative d\'initialisation du bouton 42');
    const auth42Button = document.getElementById('42');
    if (auth42Button) {
        auth42Button.addEventListener('click', handleAuth42Click);
        console.log('Bouton 42 initialisé avec succès');
        isAuth42ButtonInitialized = true;
    } else {
        console.log('Bouton 42 non trouvé, réessai dans 100ms');
        setTimeout(initAuth42Button, 100);
    }
}

function openAuthWindow(authUrl) {
    // Utilisez authWindow sans le redéclarer
    authWindow = window.open(authUrl, '42 Authentication', 'width=600,height=700');
    if (authWindow) {
        authCheckInterval = setInterval(checkAuthStatus, 500);
    } else {
        console.error("Impossible d'ouvrir la fenêtre d'authentification");
    }
}

function handleAuth42Click(e) {
    e.preventDefault();
    console.log('Clic sur le bouton 42');
    fetch('/api/get-auth-url/')
        .then(response => response.json())
        .then(data => {
            if (data.auth_url) {
                console.log('Ouverture de l\'URL d\'authentification:', data.auth_url);
                window.location.href = data.auth_url;
            } else {
                console.error("URL d'authentification non reçue dans les données", data);
            }
        })
        .catch(error => {
            console.error("Erreur lors de la récupération de l'URL d'authentification:", error);
        });
}

// Ajoutez cette fonction pour vérifier l'authentification après la redirection
function checkAuthStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        fetch(`${BASE_URL}/home/${window.location.search}`)
            .then(response => response.json())
            .then(data => {
                if (data.message === "Authentication successful") {
                    console.log("Authentification réussie");
                    console.log("Informations de l'utilisateur :", data.user_info);
                    // Vous pouvez afficher des informations spécifiques ici
                    console.log("ID:", data.user_info.id);
                    console.log("Login:", data.user_info.login);
                    console.log("Email:", data.user_info.email);
                    console.log("Nom complet:", data.user_info.displayname);
                    // Ajoutez d'autres informations que vous souhaitez afficher
                    
                    // Vous pouvez également mettre à jour l'interface utilisateur ici
                } else {
                    console.error("Erreur d'authentification:", data.error);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la vérification de l'authentification:", error);
            });
    }
}


function sendCodeToServer(code) {
    const csrftoken = getCookie('csrftoken');
    fetch('https://localhost:4430/home/', {  // Notez que l'URL front-end reste en HTTPS
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log("Code envoyé avec succès:", data.message);
            // Gérez la réponse ici
        } else {
            console.error("Erreur lors de l'envoi du code:", data.error);
        }
    })
    .catch(error => {
        console.error("Erreur lors de l'envoi du code au serveur:", error);
    });
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Initialisation
console.log('Script d\'authentification 42 chargé');
document.addEventListener('DOMContentLoaded', initAuth42Button);

// Utilisation de MutationObserver pour les changements dynamiques du DOM
const observer = new MutationObserver((mutations) => {
    if (!isAuth42ButtonInitialized) {
        initAuth42Button();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Nettoyage de l'observer quand le bouton est initialisé
function cleanupObserver() {
    if (isAuth42ButtonInitialized) {
        observer.disconnect();
        console.log('MutationObserver déconnecté');
    }
}

// Vérifier périodiquement si on peut nettoyer l'observer
setInterval(cleanupObserver, 1000);

// Connexion


document.getElementById('loginWidget').addEventListener('submit', function (event) {
    event.preventDefault();  // Empêche la soumission classique du formulaire
    console.log("Formulaire de connexion intercepté.");

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    document.getElementById('submitLoginBtn').disabled = true;

    fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Redirection vers /home
            window.navigateTo('/home');
        } else {
            alert('Erreur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur lors de la connexion :', error);
        alert('Une erreur est survenue, veuillez réessayer plus tard.');
    })
    .finally(() => {
        document.getElementById('submitLoginBtn').disabled = false;
    });
});

// Inscription
document.getElementById('registerWidget').addEventListener('submit', function (event) {
    event.preventDefault();  // Empêche la soumission classique du formulaire
    console.log("Formulaire d'inscription intercepté.");

    const username = document.getElementById('username').value;
    const email = document.getElementById('registerEmail').value;
    const password1 = document.getElementById('registerPassword').value;
    const password2 = document.getElementById('confirmPassword').value;

    if (password1 !== password2) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }

    document.getElementById('submitRegisterBtn').disabled = true;

    fetch('/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, email: email, password1: password1, password2: password2 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Connexion automatique après inscription réussie
            fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password1 })
            })
            .then(loginResponse => loginResponse.json())
            .then(loginData => {
                if (loginData.success) {
                    localStorage.setItem('access_token', loginData.access);
                    localStorage.setItem('refresh_token', loginData.refresh);

                    // Redirection vers /home
                    window.navigateTo('/home');
                } else {
                    alert('Erreur lors de la connexion automatique');
                }
            })
            .catch(error => {
                console.error('Erreur lors de la connexion automatique :', error);
                alert('Erreur lors de la connexion automatique.');
            });
        } else {
            alert('Erreur lors de l\'inscription : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur lors de l\'inscription :', error);
        alert('Une erreur est survenue, veuillez réessayer plus tard.');
    })
    .finally(() => {
        document.getElementById('submitRegisterBtn').disabled = false;
    });
});

// Fonction de navigation pour changer d'URL sans rechargement de page
function navigateTo(path) {
    history.pushState(null, '', path);  // Met à jour l'URL sans recharger
    loadPageFromURL();  // Charge la nouvelle page correspondant à l'URL
}

