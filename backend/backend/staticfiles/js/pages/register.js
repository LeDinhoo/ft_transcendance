//REGISTER.VIEW AVANT INTEGRATION DES JWT

//// Récupère le formulaire d'inscription
//document.getElementById('userForm').addEventListener('submit', function (event) {
//    event.preventDefault(); // Empêche la soumission par défaut du formulaire
//
//    // Récupère les données du formulaire
//    const username = document.getElementById('username').value;
//    const email = document.getElementById('email').value;
//    const password1 = document.getElementById('password1').value;
//    const password2 = document.getElementById('password2').value;
//
//    // Vérifie si les mots de passe correspondent
//    if (password1 !== password2) {
//        alert('Les mots de passe ne correspondent pas.');
//        return;
//    }
//
//    // Désactive le bouton de soumission pendant la requête
//    document.getElementById('submitBtn').disabled = true;
//
//    // Récupère le token CSRF
//    const csrftoken = getCookie('csrftoken');
//
//    // Envoie la requête POST avec fetch
//    //fetch('https://localhost:8443/api/register/', {
//    fetch ('/api/register/', {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json',
//            'X-CSRFToken': csrftoken,  // Ajoute le token CSRF dans les en-têtes
//        },
//        body: JSON.stringify({
//            username: username,
//            email: email,
//            password1: password1,
//            password2: password2
//        })
//    })
//    .then(response => {
//        if (!response.ok) {
//            throw new Error('Erreur HTTP: ' + response.status); // Gère les erreurs HTTP
//        }
//        return response.json();
//    })
//    .then(data => {
//        if (data.success) {
//            alert('Inscription réussie !');
//            // Redirection après succès
//            window.location.href = '/';
//        } else {
//            alert('Erreur : ' + data.message);
//        }
//    })
//    .catch(error => {
//        console.error('Erreur:', error);
//        alert('Une erreur est survenue, veuillez réessayer plus tard.');
//    })
//    .finally(() => {
//        // Réactive le bouton de soumission après la requête
//        document.getElementById('submitBtn').disabled = false;
//    });
//});
//
//// Fonction pour récupérer le token CSRF depuis les cookies
//function getCookie(name) {
//    let cookieValue = null;
//    if (document.cookie && document.cookie !== '') {
//        const cookies = document.cookie.split(';');
//        for (let i = 0; i < cookies.length; i++) {
//            const cookie = cookies[i].trim();
//            if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                break;
//            }
//        }
//    }
//    return cookieValue;
//}
//


// Récupère le formulaire d'inscription
document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Empêche la soumission par défaut du formulaire

    // Récupère les données du formulaire
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password1 = document.getElementById('password1').value;
    const password2 = document.getElementById('password2').value;

    // Vérifie si les mots de passe correspondent
    if (password1 !== password2) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }

    // Désactive le bouton de soumission pendant la requête
    document.getElementById('submitBtn').disabled = true;

    // Envoie la requête POST avec fetch
    fetch('/api/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password1: password1,
            password2: password2
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur HTTP: ' + response.status); // Gère les erreurs HTTP
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Inscription réussie !');

            // Stocker les tokens JWT
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Redirection après succès
            window.location.href = '/api/login/';
        } else {
            alert('Erreur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Une erreur est survenue, veuillez réessayer plus tard.');
    })
    .finally(() => {
        // Réactive le bouton de soumission après la requête
        document.getElementById('submitBtn').disabled = false;
    });
});
