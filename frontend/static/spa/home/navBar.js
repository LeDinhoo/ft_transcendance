const labels = document.querySelectorAll(".navLabel");
const icons = document.querySelectorAll(".iconMenu");

labels.forEach((label, index) => {
  if (index === 0) {
    label.classList.add('active');
  } else {
    label.classList.remove('active');
  }
});

icons.forEach((icon, index) => {
  icon.addEventListener("click", () => {
    console.log("clicked");
    labels.forEach((label, i) => {
      if (index === i) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  });
});