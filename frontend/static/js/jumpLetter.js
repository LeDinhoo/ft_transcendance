// Fonction pour faire sauter les lettres
function jumpLetters(elementId) {
    const element = document.getElementById(elementId);
    const text = element.innerText;
    element.innerHTML = '';
  
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement('span');
      span.textContent = text[i];
      span.style.display = 'inline-block';
      
      if (text[i] !== ' ') {
        span.style.position = 'relative';
        span.className = 'jumpable';
      } else {
        span.style.width = '0.25em';
      }
      
      element.appendChild(span);
    }
  }
  
  // Fonction pour animer les lettres
  function animateLetters(elementId) {
    const element = document.getElementById(elementId);
    const jumpableLetters = element.getElementsByClassName('jumpable');
  
    for (let i = 0; i < jumpableLetters.length; i++) {
      setTimeout(() => {
        jumpableLetters[i].style.animation = 'none';
        jumpableLetters[i].offsetHeight; // Déclenche un reflow
        jumpableLetters[i].style.animation = 'jump 0.2s ease';
      }, i * 100);
    }
  }
  
  // Fonction pour répéter l'animation
  function repeatAnimation(elementId, interval) {
    animateLetters(elementId);
    setInterval(() => animateLetters(elementId), interval);
  }
  
  // Définition de l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes jump {
      0%, 100% { top: 0; }
      50% { top: -5px; }
    }
  `;
  document.head.appendChild(style);
  
  // Utilisation des fonctions
  document.addEventListener('DOMContentLoaded', () => {
    jumpLetters('myText');
    repeatAnimation('myText', 10000); // Répète l'animation toutes les 5 secondes
  });