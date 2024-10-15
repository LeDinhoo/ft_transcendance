# validators.py
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    def validate(self, password, user=None):
        if not re.findall(r'[A-Z]', password):
            raise ValidationError(_("Le mot de passe doit contenir au moins une lettre majuscule."))
        if not re.findall(r'[a-z]', password):
            raise ValidationError(_("Le mot de passe doit contenir au moins une lettre minuscule."))
        if not re.findall(r'[0-9]', password):
            raise ValidationError(_("Le mot de passe doit contenir au moins un chiffre."))
        if not re.findall(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(_("Le mot de passe doit contenir au moins un caractère spécial."))

    def get_help_text(self):
        return _("Votre mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre, un caractère spécial et avoir au minimum 8 caractères.")
