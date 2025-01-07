from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError


class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        help_text="Veuillez entrer une adresse email valide. Elle sera utilisée pour la confirmation de votre compte."
    )

    username = forms.CharField(
        max_length=15,
        help_text="Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et les caractères @/./+/-/_."
    )

    class Meta:
        model = get_user_model()  
        fields = ['username', 'email', 'password1', 'password2']  

    def clean_email(self):
        """
        Vérifie si l'email existe déjà dans la base de données.
        """
        email = self.cleaned_data.get('email')
        User = get_user_model()

        if User.objects.filter(email=email).exists():
            raise ValidationError("Cet email est déjà utilisé.")
        
        return email

    def clean_username(self):
        """
        Vérifie si le nom d'utilisateur existe déjà dans la base de données.
        """
        username = self.cleaned_data.get('username')
        User = get_user_model()

        if User.objects.filter(username=username).exists():
            raise ValidationError("Ce nom d'utilisateur est déjà pris.")
        
        return username

    def save(self, commit=True):
        """
        Sauvegarde le nouvel utilisateur avec l'email fourni.
        """
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user



class LoginForm(AuthenticationForm):
    email = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)
