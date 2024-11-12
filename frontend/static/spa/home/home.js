// function startMatch() {
//   const modal = document.createElement("div");
//   modal.id = "gameModal";
//   modal.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100vw;
//         height: 100vh;
//         background: rgba(0, 0, 0, 0.9);
//         z-index: 1000;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//     `;

//   // Créer un iframe pour le jeu
//   const iframe = document.createElement("iframe");
//   iframe.src = "/static/spa/home/game/three.html"; // Chemin vers `three.html`
//   iframe.style.cssText = `
//         width: 80%;
//         height: 80%;
//         border: none;
//     `;

//   // Ajouter les instructions
//   const instructions = document.createElement("div");
//   instructions.style.cssText = `
//         color: white;
//         margin-top: 20px;
//         text-align: center;
//         font-family: Arial, sans-serif;
//     `;
//   instructions.innerHTML = `
//         Joueur 1: W/S | Joueur 2: Flèches Haut/Bas<br>
//         Espace pour lancer la balle
//     `;

//   modal.appendChild(iframe);
//   modal.appendChild(instructions);
//   document.body.appendChild(modal);

//   // Écouter les messages du jeu
//   const messageHandler = function (event) {
//     if (event.data.type === "gameComplete") {
//       // Gérer la fin du match
//       console.log(`Le gagnant est: ${event.data.winner}`);
//       window.removeEventListener("message", messageHandler);
//       setTimeout(() => {
//         document.body.removeChild(modal);
//       }, 2000);
//     }
//   };

//   window.addEventListener("message", messageHandler);
// }

// document.addEventListener("DOMContentLoaded", () => {
//     const launchButton = document.getElementById("launchGame");
//     if (launchButton) {
//       launchButton.addEventListener("click", startMatch);
//     }
//   });

// export function closeOnEscape(event) {
//   if (event.code === "Escape") {
//       console.log("Touche Escape détectée, fermeture de la modal.");
//       document.body.removeChild(document.getElementById("gameModal"));
//       window.removeEventListener("keydown", closeOnEscape);
//       isGameInitialized = false; // Permettre de rejouer
//       console.log("Le jeu est terminé, la modal est fermée.");
//   }
// }

function initializeHome() {
  console.log("Initialisation de la page Home...");

  const launchButton = document.getElementById("launchGame");
  if (launchButton) {
    console.log("Bouton PLAY trouvé, ajout de l'événement de clic...");
    launchButton.addEventListener("click", () => {
      console.log("Bouton PLAY cliqué !");
      startMatch();
    });
  } else {
    console.log("Bouton PLAY introuvable.");
  }
  // Écouter le message indiquant la fin du jeu
  window.addEventListener("message", (event) => {
    if (event.data.type === "gameComplete") {
      console.log(`Le gagnant est: ${event.data.winner}`);

      // Fermer automatiquement la modal après un délai
      setTimeout(() => {
        const modal = document.getElementById("gameModal");
        if (modal) {
          document.body.removeChild(modal);
          console.log("Modal fermée automatiquement après la fin du jeu.");
        }
        isGameInitialized = false; // Réinitialiser l'état pour permettre de rejouer
      }, 700); // Attente de 3 secondes avant de fermer
    }
  });
}

// function startMatch() {
//   console.log("startMatch() appelée.");

//   const modal = document.createElement("div");
//   modal.id = "gameModal";
//   modal.style.cssText = `
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100vw;
//     height: 100vh;
//     background: rgba(0, 0, 0, 0.9);
//     z-index: 1000;
//     display: flex;
//     flex-direction: column;
//     justify-content: center;
//     align-items: center;
//   `;

//   const iframe = document.createElement("iframe");
//   iframe.src = "/static/spa/home/game/three.html";
//   iframe.style.cssText = `
//     width: 100%;
//     height: 100%;
//     border: none;
//   `;

//   const instructions = document.createElement("div");
//   instructions.style.cssText = `
//     color: white;
//     margin-top: 20px;
//     text-align: center;
//     font-family: Arial, sans-serif;
//   `;
//   instructions.innerHTML = `
//     Joueur 1: W/S | Joueur 2: Flèches Haut/Bas<br>
//     Espace pour lancer la balle
//   `;

//   modal.appendChild(iframe);
//   modal.appendChild(instructions);
//   document.body.appendChild(modal);

//   window.addEventListener("message", (event) => {
//     if (event.data.type === "gameComplete") {
//       console.log(`Le gagnant est: ${event.data.winner}`);
//       setTimeout(() => {
//         document.body.removeChild(modal);
//       }, 2000);
//     }
//   });
// }

// let isGameinitialized = false;

// function startMatch() {
//   if (!isGameinitialized)
//   {

//     console.log("startMatch() appelée.");

//     // Ajouter une animation de chargement pendant le démarrage du jeu
//     const loadingIndicator = document.createElement("div");
//     loadingIndicator.innerText = "Chargement du jeu...";
//     loadingIndicator.style.cssText = `
//         color: white;
//         font-size: 20px;
//         text-align: center;
//         margin-top: 20px;
//       `;
//       document.body.appendChild(loadingIndicator);

//       // Créer une modal pour le jeu
//     const modal = document.createElement("div");
//     modal.id = "gameModal";
//     modal.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100vw;
//         height: 100vh;
//         background: rgba(0, 0, 0, 0.9);
//         z-index: 1000;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//         `;

//         // Créer l'iframe et ajouter le fichier `three.html` comme source
//     const iframe = document.createElement("iframe");
//     iframe.src = "/static/spa/home/game/three.html";
//     iframe.style.cssText = `
//         width: 100%;
//         height: 100%;
//         border: none;
//         `;

//         iframe.onload = () => {
//       // Retirer l'indicateur de chargement une fois le jeu chargé
//       document.body.removeChild(loadingIndicator);
//       console.log("Jeu chargé.");  };  // Ajouter l'iframe et les instructions à la modal

//     modal.appendChild(iframe);  document.body.appendChild(modal);  // Gérer la fin du match en écoutant les messages de l'iframe

//     window.addEventListener("message", (event) => {
//       if (event.data.type === "gameComplete") {
//         console.log(`Le gagnant est: ${event.data.winner}`);
//         setTimeout(() => {
//           document.body.removeChild(modal);
//         }, 2000);
//       }
//     });
//   }
//   else
//   {
//     console.log("le jeu est deja initialisee");
//   }
// }

// let isGameInitialized = false;

// function startMatch() {
//   if (!isGameInitialized) {
//     console.log("startMatch() appelée.");

//     // Ajouter une animation de chargement pendant le démarrage du jeu
//     const loadingIndicator = document.createElement("div");
//     loadingIndicator.innerText = "Chargement du jeu...";
//     loadingIndicator.style.cssText = `
//       color: white;
//       font-size: 20px;
//       text-align: center;
//       margin-top: 20px;
//     `;
//     document.body.appendChild(loadingIndicator);

//     // Créer une modal pour le jeu
//     const modal = document.createElement("div");
//     modal.id = "gameModal";
//     modal.style.cssText = `
//       position: fixed;
//       top: 0;
//       left: 0;
//       width: 100vw;
//       height: 100vh;
//       background: rgba(0, 0, 0, 0.9);
//       z-index: 1000;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       align-items: center;
//     `;

//     // Créer l'iframe et ajouter le fichier `three.html` comme source
//     const iframe = document.createElement("iframe");
//     iframe.src = "/static/spa/home/game/three.html";
//     iframe.style.cssText = `
//       width: 100%;
//       height: 100%;
//       border: none;
//     `;

//     // Lors du chargement de l'iframe, retirer l'indicateur de chargement et transférer le focus à l'iframe
//     iframe.onload = () => {
//       document.body.removeChild(loadingIndicator);
//       console.log("Jeu chargé.");

//       // Donner le focus à l'iframe pour initier le jeu sans clic
//       iframe.contentWindow.focus();

//       // Envoyer un message à l'iframe pour lancer le jeu
//       iframe.contentWindow.postMessage({ type: "startGame" }, "*");
//     };

//     // Ajouter l'iframe et les instructions à la modal
//     modal.appendChild(iframe);
//     document.body.appendChild(modal);

//     // Gérer la fin du match en écoutant les messages de l'iframe
//     window.addEventListener("message", (event) => {
//       if (event.data.type === "gameComplete") {
//         console.log(`Le gagnant est: ${event.data.winner}`);
//         setTimeout(() => {
//           document.body.removeChild(modal);
//         }, 2000);
//       }
//     });

//     function closeOnSpace(event) {
//       if (event.code === "Space") {
//         document.body.removeChild(modal);
//         window.removeEventListener("keydown", closeOnSpace);
//         isGameInitialized = false; // Permettre de rejouer
//         console.log("Le jeu est terminé, la modal est fermée.");
//       }
//     }

//     window.addEventListener("keydown", closeOnSpace);

//     isGameInitialized = true; // Marquer le jeu comme initialisé
//   } else {
//     console.log("Le jeu est déjà initialisé");
//   }
// }

let isGameInitialized = false;

function startMatch() {
  if (!isGameInitialized) {
    console.log("startMatch() appelée.");
    isGameInitialized = true;

    // Ajouter une animation de chargement pendant le démarrage du jeu
    const loadingIndicator = document.createElement("div");
    loadingIndicator.innerText = "Chargement du jeu...";
    loadingIndicator.style.cssText = `
            color: white;
            font-size: 20px;
            text-align: center;
            margin-top: 20px;
        `;
    document.body.appendChild(loadingIndicator);

    // Créer une modal pour le jeu
    const modal = document.createElement("div");
    modal.id = "gameModal";
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;

    // Créer l'iframe pour le jeu
    const iframe = document.createElement("iframe");
    iframe.src = "/static/spa/home/game/three.html";
    iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
        `;

    // Retirer l'indicateur de chargement une fois le jeu chargé
    iframe.onload = () => {
      document.body.removeChild(loadingIndicator);
      console.log("Jeu chargé.");

      // Délai de 100ms avant de définir le focus sur l'iframe
      setTimeout(() => {
        iframe.contentWindow.focus();
        console.log("Focus défini sur l'iframe.");
      }, 100);
    };

    modal.appendChild(iframe);
    document.body.appendChild(modal);

    // Gérer la fin du match en écoutant les messages de l'iframe
    window.addEventListener("message", (event) => {
      if (event.data.type === "gameComplete") {
        console.log(`Le gagnant est: ${event.data.winner}`);
      }
    });

    // Fonction de fermeture de la modal avec la touche "Escape"
    // function closeOnEscape(event) {
    //     if (event.code === "Escape") {
    //         console.log("Touche Escape détectée, fermeture de la modal.");
    //         document.body.removeChild(modal);
    //         window.removeEventListener("keydown", closeOnEscape);
    //         isGameInitialized = false; // Permettre de rejouer
    //         console.log("Le jeu est terminé, la modal est fermée.");
    //     }
    // }

    // // Appliquer closeOnEscape dès l'ouverture de la modal
    // window.addEventListener("keydown", closeOnEscape);
  } else {
    console.log("Le jeu est déjà initialisé.");
  }
}
