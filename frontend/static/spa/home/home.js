// function initializeHome() {
//   console.log("Initialisation de la page Home...");

//   const launchButton = document.getElementById("launchGame");
//   if (launchButton) {
//     console.log("Bouton PLAY trouvé, ajout de l'événement de clic...");
//     launchButton.addEventListener("click", () => {
//       console.log("Bouton PLAY cliqué !");
//       startMatch();
//     });
//   } else {
//     console.log("Bouton PLAY introuvable.");
//   }
//   // Écouter le message indiquant la fin du jeu
//   window.addEventListener("message", (event) => {
//     if (event.data.type === "gameComplete") {
//       console.log(`Le gagnant est: ${event.data.winner}`);

//       // Fermer automatiquement la modal après un délai
//       setTimeout(() => {
//         const modal = document.getElementById("gameModal");
//         if (modal) {
//           document.body.removeChild(modal);
//           console.log("Modal fermée automatiquement après la fin du jeu.");
//         }
//         isGameInitialized = false; // Réinitialiser l'état pour permettre de rejouer
//       }, 700); // Attente de 3 secondes avant de fermer
//     }
//   });
// }

// let isGameInitialized = false;

// function startMatch() {
//   if (!isGameInitialized) {
//     console.log("startMatch() appelée.");
//     isGameInitialized = true;

//     // Ajouter une animation de chargement pendant le démarrage du jeu
//     const loadingIndicator = document.createElement("div");
//     loadingIndicator.innerText = "Chargement du jeu...";
//     loadingIndicator.style.cssText = `
//             color: white;
//             font-size: 20px;
//             text-align: center;
//             margin-top: 20px;
//         `;
//     document.body.appendChild(loadingIndicator);

//     // Créer une modal pour le jeu
//     const modal = document.createElement("div");
//     modal.id = "gameModal";
//     modal.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100vw;
//             height: 100vh;
//             background: rgba(0, 0, 0, 0.9);
//             z-index: 1000;
//             display: flex;
//             flex-direction: column;
//             justify-content: center;
//             align-items: center;
//         `;

//     // Créer l'iframe pour le jeu
//     const iframe = document.createElement("iframe");
//     iframe.src = "/static/spa/home/game/three.html";
//     iframe.style.cssText = `
//             width: 100%;
//             height: 100%;
//             border: none;
//         `;

//     // Retirer l'indicateur de chargement une fois le jeu chargé
//     iframe.onload = () => {
//       document.body.removeChild(loadingIndicator);
//       console.log("Jeu chargé.");

//       // Délai de 100ms avant de définir le focus sur l'iframe
//       setTimeout(() => {
//         iframe.contentWindow.focus();
//         console.log("Focus défini sur l'iframe.");
//       }, 100);
//     };

//     modal.appendChild(iframe);
//     document.body.appendChild(modal);

//     // Gérer la fin du match en écoutant les messages de l'iframe
//     window.addEventListener("message", (event) => {
//       if (event.data.type === "gameComplete") {
//         console.log(`Le gagnant est: ${event.data.winner}`);
//       }
//     });

//   } else {
//     console.log("Le jeu est déjà initialisé.");
//   }
// }
