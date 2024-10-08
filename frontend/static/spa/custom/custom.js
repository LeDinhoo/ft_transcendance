function activate(element) 
{
    // Trouver le parent settingsAnswer le plus proche
    const settingsAnswer = element.closest('.settingsAnswer, .settingsAnswer3, .settingsAnswer6');

    // Désactiver tous les éléments dans ce settingsAnswer spécifique
    settingsAnswer.querySelectorAll('.answer1, .answer3, .answer6').forEach(el => 
    {
        el.classList.remove('active');
    });
    // Activer l'élément cliqué
    element.classList.add('active');
}

// Ajouter cette partie pour initialiser les sélections par défaut
document.addEventListener('DOMContentLoaded', () => {
document.querySelectorAll('.settingsAnswer, .settingsAnswer3, .settingsAnswer6').forEach(settingsAnswer => {
// Activer le premier élément de chaque groupe par défaut
const firstElement = settingsAnswer.querySelector('.answer1, .answer3, .answer6');
if (firstElement) {
firstElement.classList.add('active');
}
});
});    
