//document.addEventListener('DOMContentLoaded', function() {
//    const loginSection = document.getElementById('loginSection');
//    const gameSection = document.getElementById('gameSection');
//    const loginForm = document.getElementById('loginForm');
//    const userNameInput = document.getElementById('userNameInput');
//    const usernameField = document.getElementById('username');
//    const registerChoice = document.getElementById('registerChoice');
//    const signInChoice = document.getElementById('signInChoice');
//    const myText = document.getElementById('myText');
//    const loginSubmit = document.getElementById('loginSubmit');
//    const registerSubmit = document.getElementById('registerSubmit');
//    const confirmPassword = document.getElementById('confirmPassword');
//
//    // Ajouter les console.log() ici pour vérifier l'état des boutons
//    console.log('loginSubmit:', loginSubmit);
//    console.log('registerSubmit:', registerSubmit);
//
//    let isRegistering = false;
//
//    console.log('loginSection:', loginSection);
//    console.log('gameSection:', gameSection);
//    console.log('loginForm:', loginForm);
//
//    loginSection.style.display = 'block';
//
//    function toggleRegistrationMode(registering) {
//        isRegistering = registering;
//        userNameInput.classList.toggle('visible', registering);
//        confirmPassword.classList.toggle('visible', registering);
//        myText.textContent = registering ? 'Create an Account' : 'Join the Battle';
//        loginSubmit.style.display = registering ? 'none' : 'block';
//        registerSubmit.style.display = registering ? 'block' : 'none';
//        
//        // Ajuster la validation du champ username
//        if (registering) {
//            usernameField.setAttribute('required', '');
//
//        } else {
//            usernameField.removeAttribute('required');
//        }
//    }
//
//    registerChoice.addEventListener('click', function() {
//        toggleRegistrationMode(true);
//    });
//
//    signInChoice.addEventListener('click', function() {
//        toggleRegistrationMode(false);
//    });
//
//    loginForm.addEventListener('submit', function(event) {
//        event.preventDefault();
//
//        const email = document.getElementById('email').value;
//        const password = document.getElementById('password').value;
//
//        console.log('Email:', email);
//        console.log('Password:', password);
//
//        if (isRegistering) {
//            const username = usernameField.value;
//            console.log('Username:', username);
//            console.log('Inscription en cours...');
//            // Logique d'inscription ici
//        } else {
//            if (email === "user@admin.com" && password === "password") {
//                console.log('Login réussi');
//                loginSection.style.display = 'none';
//            } else {
//                console.log('Login échoué');
//                alert("Nom d'utilisateur ou mot de passe incorrect");
//            }
//        }
//    });
//
//    // Initialisation
//    toggleRegistrationMode(false);
//});

//document.addEventListener('DOMContentLoaded', function() {
//    // Accès aux éléments du DOM
//    const loginSection = document.getElementById('loginSection');
//    const gameSection = document.getElementById('gameSection');
//    const userForm = document.getElementById('userForm');
//    const userNameInput = document.getElementById('userNameInput');
//    const usernameField = document.getElementById('username');
//    const registerChoice = document.getElementById('registerChoice');
//    const signInChoice = document.getElementById('signInChoice');
//    const myText = document.getElementById('myText');
//    const confirmPassword = document.getElementById('confirmPassword');
//    const submitBtn = document.getElementById('submitBtn'); // Bouton de soumission
//
//    let isRegistering = false; // Variable pour suivre le mode (inscription/connexion)
//
//    // Affiche la section de connexion au chargement de la page
//    loginSection.style.display = 'block';
//
//    // Fonction pour basculer entre le mode "inscription" et "connexion"
//    function toggleRegistrationMode(registering) {
//        isRegistering = registering; // Mise à jour de l'état du mode
//
//        // Afficher/masquer le champ "Username" et "Confirmer mot de passe"
//        if (registering) {
//            userNameInput.classList.add('visible');  // Appliquer la classe visible pour montrer le champ username
//            confirmPassword.classList.add('visible'); // Appliquer la classe visible pour montrer le champ de confirmation du mot de passe
//        } else {
//            userNameInput.classList.remove('visible'); // Retirer la classe visible pour masquer le champ username
//            confirmPassword.classList.remove('visible'); // Retirer la classe visible pour masquer le champ de confirmation du mot de passe
//        }
//
//        // Changer le texte de l'en-tête
//        myText.textContent = registering ? 'Create an Account' : 'Join the Battle';
//
//        // Changer le texte du bouton de soumission
//        submitBtn.textContent = registering ? 'Register' : 'Log In';
//
//        // Ajuster la validation du champ username
//        if (registering) {
//            usernameField.setAttribute('required', ''); // Le champ username devient obligatoire en mode inscription
//        } else {
//            usernameField.removeAttribute('required'); // Le champ username n'est plus obligatoire en mode connexion
//        }
//    }
//
//    // Gestionnaire d'événement pour basculer vers le mode inscription
//    registerChoice.addEventListener('click', function() {
//        toggleRegistrationMode(true); // Passer en mode inscription
//        registerChoice.style.display = 'none'; // Masquer le bouton "Register"
//        signInChoice.style.display = 'block'; // Afficher le bouton "Sign In"
//    });
//
//    // Gestionnaire d'événement pour basculer vers le mode connexion
//    signInChoice.addEventListener('click', function() {
//        toggleRegistrationMode(false); // Passer en mode connexion
//        signInChoice.style.display = 'none'; // Masquer le bouton "Sign In"
//        registerChoice.style.display = 'block'; // Afficher le bouton "Register"
//    });
//
//    // Gestionnaire d'événement pour la soumission du formulaire
//    userForm.addEventListener('submit', function(event) {
//        event.preventDefault(); // Empêcher la soumission par défaut du formulaire
//
//        const email = document.getElementById('email').value;
//        const password = document.getElementById('password1').value;
//
//        console.log('Email:', email);
//        console.log('Password:', password);
//
//        if (isRegistering) {
//            // En mode inscription, récupère le nom d'utilisateur et les mots de passe
//            const username = usernameField.value;
//            const password2 = document.getElementById('password2').value;
//
//            console.log('Username:', username);
//            console.log('Password (confirmation):', password2);
//            console.log('Inscription en cours...');
//
//            // Ici, tu pourrais ajouter une logique supplémentaire pour envoyer la requête d'inscription si nécessaire
//        } else {
//            // En mode connexion, vérifier les identifiants (simulation basique)
//            if (email === "user@admin.com" && password === "password") {
//                console.log('Login réussi');
//                loginSection.style.display = 'none'; // Masquer la section login après une connexion réussie
//                // Logique pour rediriger vers le jeu ou une autre section
//            } else {
//                console.log('Login échoué');
//                alert("Nom d'utilisateur ou mot de passe incorrect");
//            }
//        }
//    });
//
//    // Initialiser la page en mode connexion
//    toggleRegistrationMode(false);
//});
//


document.addEventListener('DOMContentLoaded', function() {
    // Accès aux éléments du DOM
    const loginSection = document.getElementById('loginSection');
    const userForm = document.getElementById('userForm');
    const userNameInput = document.getElementById('userNameInput');
    const usernameField = document.getElementById('username');
    const registerChoice = document.getElementById('registerChoice');
    const signInChoice = document.getElementById('signInChoice');
    const myText = document.getElementById('myText');
    const confirmPassword = document.getElementById('confirmPassword');
    const password2 = document.getElementById('password2');
    const submitBtn = document.getElementById('submitBtn'); // Bouton de soumission

    let isRegistering = false; // Variable pour suivre le mode (inscription/connexion)

    // Affiche la section de connexion au chargement de la page
    loginSection.style.display = 'block';

    // Fonction pour basculer entre le mode "inscription" et "connexion"
    function toggleRegistrationMode(registering) {
        isRegistering = registering; // Mise à jour de l'état du mode

        // Afficher/masquer le champ "Username" et "Confirmer mot de passe"
        if (registering) {
            userNameInput.classList.add('visible');  // Appliquer la classe visible pour montrer le champ username
            confirmPassword.classList.add('visible'); // Appliquer la classe visible pour montrer le champ de confirmation du mot de passe

            // Ajouter les attributs required pour l'inscription
            usernameField.setAttribute('required', ''); // Le champ username devient obligatoire
            password2.setAttribute('required', ''); // Le champ de confirmation devient obligatoire

        } else {
            userNameInput.classList.remove('visible'); // Retirer la classe visible pour masquer le champ username
            confirmPassword.classList.remove('visible'); // Retirer la classe visible pour masquer le champ de confirmation du mot de passe

            // Retirer les attributs required pour la connexion
            usernameField.removeAttribute('required'); // Le champ username n'est plus obligatoire
            password2.removeAttribute('required'); // Le champ de confirmation n'est plus obligatoire
        }

        // Changer le texte de l'en-tête
        myText.textContent = registering ? 'Create an Account' : 'Join the Battle';

        // Changer le texte du bouton de soumission
        submitBtn.textContent = registering ? 'Register' : 'Log In';
    }

    // Gestionnaire d'événement pour basculer vers le mode inscription
    registerChoice.addEventListener('click', function() {
        toggleRegistrationMode(true); // Passer en mode inscription
        registerChoice.style.display = 'none'; // Masquer le bouton "Register"
        signInChoice.style.display = 'block'; // Afficher le bouton "Sign In"
    });

    // Gestionnaire d'événement pour basculer vers le mode connexion
    signInChoice.addEventListener('click', function() {
        toggleRegistrationMode(false); // Passer en mode connexion
        signInChoice.style.display = 'none'; // Masquer le bouton "Sign In"
        registerChoice.style.display = 'block'; // Afficher le bouton "Register"
    });

    // Initialiser la page en mode connexion
    toggleRegistrationMode(false);
});
