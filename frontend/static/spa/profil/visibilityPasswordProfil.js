const oldPassword = document.getElementById("oldPassword");
const newPassword = document.getElementById("newPassword");
const confirmNewPassword = document.getElementById("confirmNewPassword");

const toggleOldPassword = document.getElementById("toggleOldPassword");
const toggleNewPassword = document.getElementById("toggleNewPassword");
const toggleConfirmNewPassword = document.getElementById(
  "toggleConfirmNewPassword"
);

toggleOldPassword.addEventListener("click", function () {
  const type =
    oldPassword.getAttribute("type") === "password" ? "text" : "password";
  oldPassword.setAttribute("type", type);

  this.src =
    type === "password"
      ? "/static/assets/icons/vibility.png"
      : "/static/assets/icons/vibility_off.png";
});

toggleNewPassword.addEventListener("click", function () {
  const type =
    newPassword.getAttribute("type") === "password" ? "text" : "password";
  newPassword.setAttribute("type", type);

  this.src =
    type === "password"
      ? "/static/assets/icons/vibility.png"
      : "/static/assets/icons/vibility_off.png";
});

toggleConfirmNewPassword.addEventListener("click", function () {
  const type =
    confirmNewPassword.getAttribute("type") === "password"
      ? "text"
      : "password";
  confirmNewPassword.setAttribute("type", type);

  this.src =
    type === "password"
      ? "/static/assets/icons/vibility.png"
      : "/static/assets/icons/vibility_off.png";
});

const newFrame = document.getElementById("newFrame");
const newPlusFrame = document.getElementById("newPlusFrame");

newFrame.style.display = "none";
newPlusFrame.style.display = "none";

const toggleChangePassword = document.getElementById("toggleChangePassword");

toggleChangePassword.addEventListener("click", function () {
  const type = newFrame.style.display === "none" ? "block" : "none";
  toggleChangePassword.innerText = type === "none" ? "Modify" : "Cancel";
  newFrame.style.display = type;
  newPlusFrame.style.display = type;
});
