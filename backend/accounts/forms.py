import re
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError


class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        help_text="Please enter a valid email address. It will be used to confirm your account."
    )

    username = forms.CharField(
        max_length=15,
        help_text="The username can only contain letters, numbers, and the characters @/./+/-/_."
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
            raise ValidationError("mailUsed")
        
        return email

    def clean_username(self):
        """
        Vérifie si le nom d'utilisateur existe déjà dans la base de données.
        """
        username = self.cleaned_data.get('username')
        User = get_user_model()

        if User.objects.filter(username=username).exists():
            raise ValidationError("usernameTaken")
        
        return username


    def clean_password1(self):
        password1 = self.cleaned_data.get('password1')

        if len(password1) > 20:
            raise ValidationError("maxChar")
        if len(password1) < 8:
            raise ValidationError("minChar")
        if not re.search(r'[A-Z]', password1):
            raise ValidationError("minOneChar")
        if not re.search(r'[a-z]', password1):
            raise ValidationError("maxOneCharBis")
        if not re.search(r'[0-9]', password1):
            raise ValidationError("minNUM")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password1):
            raise ValidationError("minSpec")

        return password1


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
