const optionButtons = document.querySelectorAll(".option-btn");
const shapes = document.querySelectorAll(".shape");
const nav16 = document.querySelector(".nav-16");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

function showShape(shapeId) {
  shapes.forEach((shape) => shape.classList.remove("active"));
  document.getElementById(shapeId).classList.add("active");
}

function handleOptionChange(value) {
  optionButtons.forEach((btn) => btn.classList.remove("active"));
  document.getElementById(value).classList.add("active");

  nav16.style.display = value === "16" ? "flex" : "none";

  switch (value) {
    case "4":
      showShape("4display");
      break;
    case "8":
      showShape("816display");
      break;
    case "16":
      showShape("816display");
      break;
  }
}

optionButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    handleOptionChange(event.target.id);
  });
});

leftBtn.addEventListener("click", () => {
  showShape("816display");
  leftBtn.classList.add("active");
  rightBtn.classList.remove("active");
});

rightBtn.addEventListener("click", () => {
  showShape("162display");
  rightBtn.classList.add("active");
  leftBtn.classList.remove("active");
});

handleOptionChange("4");
