//Fichier avant integration des JWT.

//document.getElementById('loginSubmit').addEventListener('submit', function (event) {
//    event.preventDefault(); // Empêche la soumission par défaut
//
//    const username = document.getElementById('username').value;
//    const password1 = document.getElementById('password1').value;
//
//    // Validation simple des champs
//    if (!username || !password1) {
//        alert('Veuillez remplir tous les champs.');
//        return;
//    }
//
//    // Désactiver le bouton de soumission pendant la requête
//    document.getElementById('submitBtn').disabled = true;
//
//    // Envoyer la requête POST avec fetch
//    fetch('/api/login/', {  // Utiliser l'URL avec le préfixe API si applicable
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json',
//        },
//        body: JSON.stringify({
//            username: username,
//            password1: password1
//        })
//    })
//    .then(response => {
//        if (!response.ok) {
//            throw new Error('Erreur HTTP: ' + response.status);  // Gérer les erreurs HTTP
//        }
//        return response.json();
//    })
//    .then(data => {
//        if (data.success) {
//            alert('Connexion réussie !');
//            // Redirection après succès
//            window.location.href = '/game/';
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


document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Empêche la soumission par défaut

    const email = document.getElementById('email').value;
    const password = document.getElementById('password1').value;

    // Validation simple des champs
    if (!email || !password) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    // Désactiver le bouton de soumission pendant la requête
    document.getElementById('submitBtn').disabled = true;

    // Envoyer la requête POST avec fetch
    fetch('/api/login/', {  // Utiliser l'URL avec le préfixe API si applicable
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur HTTP: ' + response.status);  // Gérer les erreurs HTTP
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Connexion réussie !');

            // Stocker les tokens JWT
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            // Redirection après succès
            window.location.href = '/game/';
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
