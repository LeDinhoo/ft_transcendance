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

// -------------------------------WITHOUT TANSLATION---------------------------------------------

// document.getElementById('userForm').addEventListener('submit', function (event) {
//     event.preventDefault(); // Empêche la soumission par défaut

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password1').value;

//     // Validation simple des champs
//     if (!email || !password) {
//         alert('Veuillez remplir tous les champs.');
//         return;
//     }

//     // Désactiver le bouton de soumission pendant la requête
//     document.getElementById('submitBtn').disabled = true;

//     // Envoyer la requête POST avec fetch
//     fetch('/api/login/', {  // Utiliser l'URL avec le préfixe API si applicable
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             email: email,
//             password: password
//         })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Erreur HTTP: ' + response.status);  // Gérer les erreurs HTTP
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.success) {
//             alert('Connexion réussie !');

//             // Stocker les tokens JWT
//             localStorage.setItem('access_token', data.access);
//             localStorage.setItem('refresh_token', data.refresh);

//             // Redirection après succès
//             window.location.href = '/game/';
//         } else {
//             alert('Erreur : ' + data.message);
//         }
//     })
//     .catch(error => {
//         console.error('Erreur:', error);
//         alert('Une erreur est survenue, veuillez réessayer plus tard.');
//     })
//     .finally(() => {
//         // Réactiver le bouton de soumission après la requête
//         document.getElementById('submitBtn').disabled = false;
//     });
// });

// Function to fetch the appropriate language file
function loadTranslations(language) {
    return fetch(`/static/languages/${language}.json`)  // Adjust the path based on where your language files are stored
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load language file');
            }
            return response.json();
        });
}

document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password1').value;

    // Assuming the user's language preference is stored in localStorage, cookies, or determined by the browser.
    const userLang = localStorage.getItem('preferredLanguage') || 'en';  // Default to 'en' (English)

    loadTranslations(userLang).then(translations => {
        // Simple field validation
        if (!email || !password) {
            alert(translations.form_validation_error);
            return;
        }

        // Disable the submit button during the request
        document.getElementById('submitBtn').disabled = true;

        // Send the POST request with fetch
        fetch('/api/login/', {
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
                throw new Error(translations.http_error + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert(translations.login_success);

                // Store JWT tokens
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);

                // Redirect after successful login
                window.location.href = '/game/';
            } else {
                alert(translations.login_failure + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(translations.generic_error);
        })
        .finally(() => {
            // Re-enable the submit button after the request
            document.getElementById('submitBtn').disabled = false;
        });
    }).catch(error => {
        console.error('Error loading translations:', error);
        alert('Error loading language file.');
    });
});
