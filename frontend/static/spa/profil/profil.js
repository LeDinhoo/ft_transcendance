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
  const saveButton = document.getElementById("saveButton");

  // Couleur pour l'état déverrouillé
  const unlockedColor = "#ff710d"; // orange liquid lava lorsque déverrouillé

  // Déverrouiller les champs pour modification
  modifyButton.addEventListener("click", function () {
    if (userInput.disabled && emailInput.disabled) {
      userInput.disabled = false;
      emailInput.disabled = false;
      modifyButton.style.backgroundColor = unlockedColor;
      console.log("Champs déverrouillés");
    } else {
      userInput.disabled = true;
      emailInput.disabled = true;
      modifyButton.style.backgroundColor = "";
      console.log("Champs verrouillés");
    }
  });

  // Sauvegarder les changements
  saveButton.addEventListener("click", function () {
    if (!userInput.disabled && !emailInput.disabled) {
      const updatedUsername = userInput.value;
      const updatedEmail = emailInput.value;

      // Validation basique des champs
      if (!updatedUsername || !updatedEmail) {
        alert("Le nom d'utilisateur et l'email ne peuvent pas être vides.");
        return;
      }

      fetch("/api/profil/update/", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: updatedUsername,
          email: updatedEmail,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Mettre à jour l'interface utilisateur avec les nouvelles données
          document.getElementById("playerFrame").innerText = data.username;
          document.getElementById("username").value = data.username;
          document.getElementById("registerEmail").value = data.email;

          // Verrouiller à nouveau les champs après mise à jour réussie
          userInput.disabled = true;
          emailInput.disabled = true;
          modifyButton.style.backgroundColor = "";
          console.log("Informations mises à jour et verrouillées");
        })
        .catch((error) => {
          console.error("Erreur lors de la mise à jour des informations :", error);
          alert("Erreur lors de la mise à jour, veuillez réessayer.");
        });
    }
  });

  // Charger les informations du profil lors du chargement de la page
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
          console.error("Erreur lors de la récupération des informations utilisateur");
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du profil :", error);
      });
  } else {
    console.log("Aucun token JWT trouvé.");
  }
}

