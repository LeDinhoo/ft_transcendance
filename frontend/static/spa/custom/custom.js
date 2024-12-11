function activate(element) 
{
    
    const settingsAnswer = element.closest('.settingsAnswer, .settingsAnswer3, .settingsAnswer6');

    
    settingsAnswer.querySelectorAll('.answer1, .answer3, .answer6').forEach(el => 
    {
        el.classList.remove('active');
    });
    
    element.classList.add('active');
}


document.addEventListener('DOMContentLoaded', () => {
document.querySelectorAll('.settingsAnswer, .settingsAnswer3, .settingsAnswer6').forEach(settingsAnswer => {

const firstElement = settingsAnswer.querySelector('.answer1, .answer3, .answer6');
if (firstElement) {
firstElement.classList.add('active');
}
});
});    
