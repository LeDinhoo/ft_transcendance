//let accessToken = localStorage.getItem("access_token");
//console.log("Token récupéré:", accessToken);
//
//
//const userInput = document.getElementById("username");
//const emailInput = document.getElementById("registerEmail");
//const modifyButton = document.getElementById("modifyButton");
//
//modifyButton.addEventListener("click", function () {
//  if (userInput.disabled && emailInput.disabled) {
//    userInput.disabled = false;
//    emailInput.disabled = false;
//    userInput.classList.remove("locked");
//    emailInput.classList.remove("locked");
//    console.log("Jai deverouiller");
//  } else {
//    userInput.disabled = true;
//    emailInput.disabled = true;
//    userInput.classList.add("locked");
//    emailInput.classList.add("locked");
//    console.log("Jai verouiller");
//  }
//});
//
//if (accessToken) {
//  fetch("/api/profil/", {
//    method: "GET",
//    headers: {
//      Authorization: `Bearer ${accessToken}`,
//      "Content-Type": "application/json",
//    },
//  })
//    .then((response) => {
//      if (!response.ok) {
//        throw new Error(`Erreur HTTP: ${response.status}`);
//      }
//      return response.json();
//    })
//    .then((data) => {
//      if (data.username && data.email) {
//        // Met à jour les champs du formulaire avec les valeurs récupérées
//        document.getElementById("playerFrame").innerText = data.username;
//        document.getElementById("username").value = data.username;
//        document.getElementById("registerEmail").value = data.email;
//
//      } else {
//        console.error(
//          "Erreur lors de la récupération des informations utilisateur"
//        );
//      }
//    })
//    .catch((error) => {
//      console.error("Erreur lors de la récupération du profil :", error);
//    });
//} else {
//  console.log("Aucun token JWT trouvé.");
//}


function initializeProfilePage() {

  let accessToken = localStorage.getItem("access_token");
  console.log("Token récupéré:", accessToken);

  const userInput = document.getElementById("username");
  const emailInput = document.getElementById("registerEmail");
  const modifyButton = document.getElementById("modifyButton");

  modifyButton.addEventListener("click", function () {
    if (userInput.disabled && emailInput.disabled) {
      userInput.disabled = false;
      emailInput.disabled = false;
      userInput.classList.remove("locked");
      emailInput.classList.remove("locked");
      console.log("J'ai déverrouillé");
    } else {
      userInput.disabled = true;
      emailInput.disabled = true;
      userInput.classList.add("locked");
      emailInput.classList.add("locked");
      console.log("J'ai verrouillé");
    }
  });

  if (accessToken) {
    fetch("/api/profil/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.username && data.email) {
          // Met à jour les champs du formulaire avec les valeurs récupérées
          document.getElementById("playerFrame").innerText = data.username;
          document.getElementById("username").value = data.username;
          document.getElementById("registerEmail").value = data.email;
        } else {
          console.error(
            "Erreur lors de la récupération des informations utilisateur"
          );
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du profil :", error);
      });
  } else {
    console.log("Aucun token JWT trouvé.");
  }
}

// Appeler initializeProfilePage dans le gestionnaire de routage SPA
