from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import re
from django.core.validators import MinLengthValidator, RegexValidator

class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                message="Entrez une adresse email valide"
            )
        ]
    )
    
    username = forms.CharField(
        min_length=3,
        max_length=16,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_-]*$',
                message="Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
            )
        ]
    )

    password1 = forms.CharField(
        widget=forms.PasswordInput,
        validators=[
            MinLengthValidator(8),
            RegexValidator(
                regex=r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
                message="Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial"
            )
        ]
    )

    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'password1', 'password2']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        User = get_user_model()

        # Vérifie la longueur de l'email
        if len(email) > 50:
            raise ValidationError("L'email ne doit pas dépasser 50 caractères.")

        # Vérifie si l'email existe déjà
        if User.objects.filter(email=email).exists():
            raise ValidationError("Cet email est déjà utilisé.")
        
        # Vérifie le format de l'email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValidationError("Format d'email invalide.")

        return email.lower()  # Normalise l'email en minuscules

    def clean_username(self):
        username = self.cleaned_data.get('username')
        
        # Vérifie les caractères spéciaux dangereux
        if re.search(r'[<>"\'/]', username):
            raise ValidationError("Le nom d'utilisateur contient des caractères non autorisés.")

        return username

    def clean_password1(self):
        password = self.cleaned_data.get('password1')
        
        # Vérifie que le mot de passe n'est pas trop commun
        common_passwords = ['Password123!', '12345678', 'Admin123!']
        if password in common_passwords:
            raise ValidationError("Ce mot de passe est trop commun.")

        return password

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        username = cleaned_data.get('username')

        # Vérifie que le mot de passe ne contient pas le nom d'utilisateur
        if username and password1 and username.lower() in password1.lower():
            raise ValidationError("Le mot de passe ne peut pas contenir votre nom d'utilisateur.")

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email'].lower()
        if commit:
            user.save()
        return user


class LoginForm(AuthenticationForm):
    email = forms.CharField(
        max_length=50,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                message="Format d'email invalide"
            )
        ]
    )
    password = forms.CharField(
        widget=forms.PasswordInput,
        validators=[MinLengthValidator(8)]
    )

    def clean(self):
        cleaned_data = super().clean()
        # Limite le nombre de tentatives de connexion (à implémenter avec Redis ou cache)
        return cleaned_data