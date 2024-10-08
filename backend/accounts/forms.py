#from django import forms
#from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
#from django.contrib.auth import get_user_model
#
## Formulaire d'inscription
#class RegisterForm(UserCreationForm):
#    email = forms.EmailField(required=True)
#
#    class Meta:
#        model = get_user_model()  # Utilise le modèle utilisateur personnalisé
#        fields = ['username', 'email', 'password1', 'password2']  # Champs pour l'inscription
#
#    def save(self, commit=True):
#        user = super().save(commit=False)
#        user.email = self.cleaned_data['email']
#        if commit:
#            user.save()
#        return user
#
## Formulaire de connexion
#class LoginForm(AuthenticationForm):
#    username = forms.CharField()
#    password = forms.CharField(widget=forms.PasswordInput)


from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

# Formulaire d'inscription
class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = get_user_model()  # Utilise le modèle utilisateur personnalisé
        fields = ['username', 'email', 'password1', 'password2']  # Champs pour l'inscription

    # Vérifier l'unicité de l'email
    def clean_email(self):
        email = self.cleaned_data.get('email')
        User = get_user_model()

        if User.objects.filter(email=email).exists():
            raise ValidationError("Cet email est déjà utilisé.")
        
        return email

    # Sauvegarder l'utilisateur
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user

# Formulaire de connexion
class LoginForm(AuthenticationForm):
    email = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)
