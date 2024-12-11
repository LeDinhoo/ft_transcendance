function initializePasswordVisibility() {
  
  function toggleVisibility(passwordField, toggleButton) {
    if (!passwordField || !toggleButton) return; 

    toggleButton.addEventListener("click", function () {
      const type =
        passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);

      
      if (type === "password") {
        toggleButton.src = "/static/assets/icons/vibility.png"; 
      } else {
        toggleButton.src = "/static/assets/icons/vibility_off.png"; 
      }
    });
  }

  
  const oldPassword = document.getElementById("oldPassword");
  const newPassword = document.getElementById("newPassword");
  const confirmNewPassword = document.getElementById("confirmNewPassword");

  const toggleOldPassword = document.getElementById("toggleOldPassword");
  const toggleNewPassword = document.getElementById("toggleNewPassword");
  const toggleConfirmNewPassword = document.getElementById(
    "toggleConfirmNewPassword"
  );

  toggleVisibility(oldPassword, toggleOldPassword);
  toggleVisibility(newPassword, toggleNewPassword);
  toggleVisibility(confirmNewPassword, toggleConfirmNewPassword);
}

function initializePasswordFieldToggle() {
  const newFrame = document.getElementById("newFrame");
  const newPlusFrame = document.getElementById("newPlusFrame");
  const toggleChangePassword = document.getElementById("toggleChangePassword");

 
  if (newFrame && newPlusFrame) {
    newFrame.style.display = "none";
    newPlusFrame.style.display = "none";
  }


  if (toggleChangePassword) {
    toggleChangePassword.addEventListener("click", function () {
      const isHidden = newFrame.style.display === "none"; 
      newFrame.style.display = isHidden ? "block" : "none"; 
      newPlusFrame.style.display = isHidden ? "block" : "none"; 
      toggleChangePassword.innerText = isHidden ? "Cancel" : "Modify"; 
    });
  }
}


document.addEventListener("DOMContentLoaded", function () {
  initializePasswordVisibility();
  initializePasswordFieldToggle(); 
});
