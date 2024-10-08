//const registerChoice = document.getElementById('registerChoice');
//const signInChoice = document.getElementById('signInChoice');
//const userNameInputDiv = document.getElementById('userNameInput');
//const  loginSubmit= document.getElementById('loginSubmit');
//const registerSubmit = document.getElementById('registerSubmit');
//const confirmPassword = document.getElementById('confirmPassword');
//
//registerChoice.addEventListener('click', function() {
//    loginSubmit.style.display = 'none';
//    registerSubmit.style.display = 'block';
//    registerChoice.style.display = 'none';
//    signInChoice.style.display = 'block';
//});
//
//signInChoice.addEventListener('click', function() {
//    loginSubmit.style.display = 'block';
//    registerSubmit.style.display = 'none';
//    registerChoice.style.display = 'block';
//    signInChoice.style.display = 'none';
//});
//

//const registerChoice = document.getElementById('registerChoice');
//const signInChoice = document.getElementById('signInChoice');
//const userForm = document.getElementById('userForm');
//const submitBtn = document.getElementById('submitBtn');
//const usernameInput = document.getElementById('userNameInput');
//const emailField = document.getElementById('emailField');
//const confirmPasswordDiv = document.getElementById('confirmPassword');
//
//
//// Lorsqu'on clique sur "Register"
//registerChoice.addEventListener('click', function() {
//    // Affiche les champs supplémentaires pour l'inscription
//    usernameInput.style.display = 'block'; // Affiche le champ "Username"
//    confirmPasswordDiv.style.display = 'block'; // Affiche la confirmation du mot de passe
//
//    // Change l'action du formulaire pour l'inscription
//    userForm.action = '/api/register/';
//
//    // Change le texte du bouton de soumission
//    submitBtn.textContent = 'Register';
//
//    // Basculer les boutons entre "Register" et "Sign In"
//    registerChoice.style.display = 'none';
//    signInChoice.style.display = 'block';
//});
//
//// Lorsqu'on clique sur "Sign In"
//signInChoice.addEventListener('click', function() {
//    // Masque les champs spécifiques à l'inscription
//    usernameInput.style.display = 'none'; // Masque le champ "Username"
//    confirmPasswordDiv.style.display = 'none'; // Masque la confirmation du mot de passe
//
//    // Change l'action du formulaire pour la connexion
//    userForm.action = '/api/login/';
//
//    // Change le texte du bouton de soumission
//    submitBtn.textContent = 'Log In';
//
//    // Basculer les boutons entre "Sign In" et "Register"
//    signInChoice.style.display = 'none';
//    registerChoice.style.display = 'block';
//});



const registerChoice = document.getElementById('registerChoice');
const signInChoice = document.getElementById('signInChoice');
const userForm = document.getElementById('userForm');
const submitBtn = document.getElementById('submitBtn');
const usernameInput = document.getElementById('userNameInput');
const confirmPasswordDiv = document.getElementById('confirmPassword');

let isRegistering = false; // Variable pour déterminer si on est en mode "inscription" ou "connexion"

// Lorsqu'on clique sur "Register"
registerChoice.addEventListener('click', function() {
    // Affiche les champs supplémentaires pour l'inscription
    usernameInput.style.display = 'block'; // Affiche le champ "Username"
    confirmPasswordDiv.style.display = 'block'; // Affiche la confirmation du mot de passe

    // Change le texte du bouton de soumission
    submitBtn.textContent = 'Register';

    // Basculer les boutons entre "Register" et "Sign In"
    registerChoice.style.display = 'none';
    signInChoice.style.display = 'block';

    // Indique que le mode "inscription" est activé
    isRegistering = true;
});

// Lorsqu'on clique sur "Sign In"
signInChoice.addEventListener('click', function() {
    // Masque les champs spécifiques à l'inscription
    usernameInput.style.display = 'none'; // Masque le champ "Username"
    confirmPasswordDiv.style.display = 'none'; // Masque la confirmation du mot de passe

    // Change le texte du bouton de soumission
    submitBtn.textContent = 'Log In';

    // Basculer les boutons entre "Sign In" et "Register"
    signInChoice.style.display = 'none';
    registerChoice.style.display = 'block';

    // Indique que le mode "connexion" est activé
    isRegistering = false;
});
