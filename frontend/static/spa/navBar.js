
function initializeNavBar() {
  const labels = document.querySelectorAll(".navLabel");
  const icons = document.querySelectorAll(".iconMenu");

  
  const routes = [
    "/home",
    "/tournament",
    "/profil",
    "/settings",
  ];

  
  icons.forEach((icon, index) => {
    icon.addEventListener("click", () => {
     
      labels.forEach((label, i) => {
        if (index === i) {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      });

     
      if (routes[index]) {
        navigateTo(routes[index]); 
      }
    });
  });

 
  const currentPath = window.location.pathname;
  const activeIndex = routes.indexOf(currentPath);

  labels.forEach((label, index) => {
    if (index === activeIndex) {
      label.classList.add("active");
    } else {
      label.classList.remove("active");
    }
  });

  
  window.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById("logout-icon");
    if (logoutButton) {
      logoutButton.addEventListener("click", logout); 
      console.log("Logout button event listener attached"); 
    } else {
      console.error("Logout icon not found in the DOM.");
    }
  });
}


initializeNavBar();

