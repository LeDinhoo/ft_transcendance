const labels = document.querySelectorAll(".navLabel");

labels.forEach((label, index) => {
  console.log(label.textContent);
    if (index !== 0) {
        label.style.display = "none";
    }
});
