const passwordField = document.getElementById('password');
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');
const togglePassword = document.getElementById('togglePassword');
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

togglePassword.addEventListener('click', function() {
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    
    this.src = type === 'password' ? '/static/assets/icons/vibility.png' : '/static/assets/icons/vibility_off.png';
});

toggleRegisterPassword.addEventListener('click', function() {
    const type = registerPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    registerPassword.setAttribute('type', type);
    
    this.src = type === 'password' ? '/static/assets/icons/vibility.png' : '/static/assets/icons/vibility_off.png';
});

toggleConfirmPassword.addEventListener('click', function() {
    const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPassword.setAttribute('type', type);
    
    this.src = type === 'password' ? '/static/assets/icons/vibility.png' : '/static/assets/icons/vibility_off.png';
});