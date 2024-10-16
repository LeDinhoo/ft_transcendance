document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Empêche la soumission par défaut du formulaire

    // Récupère les données du formulaire
    const email = document.getElementById('email').value;
    const password1 = document.getElementById('password1').value;

    // Variables pour inscription
    let username = null;
    let password2 = null;

    // Vérifie si on est en mode "inscription"
    if (isRegistering) {
        username = document.getElementById('username').value;
        password2 = document.getElementById('password2').value;

        // Vérifie que les mots de passe correspondent
        if (password1 !== password2) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }

        // Vérifie que le champ "username" est rempli
        if (!username) {
            alert('Veuillez entrer un nom d\'utilisateur.');
            return;
        }
    }

    // Désactiver le bouton de soumission pendant la requête
    document.getElementById('submitBtn').disabled = true;

    // Détermine l'URL et les données à envoyer en fonction du mode (inscription ou connexion)
    const url = isRegistering ? '/api/register/' : '/api/login/';
    const body = isRegistering
        ? JSON.stringify({ username: username, email: email, password1: password1, password2: password2 })
        : JSON.stringify({ email: email, password: password1 });

    // Envoie la requête POST avec fetch
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur HTTP: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert(isRegistering ? 'Inscription réussie !' : 'Connexion réussie !');

            // Si on est en mode inscription, tenter de se connecter automatiquement
            if (isRegistering) {
                fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password1
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de la connexion automatique');
                    }
                    return response.json();
                })
                .then(loginData => {
                    if (loginData.success) {
                        // Stocker les tokens JWT
                        localStorage.setItem('access_token', loginData.access);
                        localStorage.setItem('refresh_token', loginData.refresh);

                        // Redirection vers la page du jeu
                        window.location.href = '/game/';
                    } else {
                        alert('Erreur lors de la connexion automatique');
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la connexion automatique.');
                });
            } else {
                // Si on est en mode connexion, rediriger vers la page du jeu
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                window.location.href = '/game/';
            }
        } else {
            alert('Erreur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue, veuillez réessayer plus tard.');
    })
    .finally(() => {
        // Réactiver le bouton de soumission après la requête
        document.getElementById('submitBtn').disabled = false;
    });
});
