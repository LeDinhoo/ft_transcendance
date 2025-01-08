# validators.py
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    def validate(self, password, user=None):
        if len(password) > 20:
            raise ValidationError("maxChar")
        if len(password) < 8:
            raise ValidationError("minChar")
        if not re.findall(r'[A-Z]', password):
            raise ValidationError(_("missingUpperCase"))
        if not re.findall(r'[a-z]', password):
            raise ValidationError(_("missingLowerCase"))
        if not re.findall(r'[0-9]', password):
            raise ValidationError(_("missingDigit"))
        if not re.findall(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(_("missingSpecial"))

    def get_help_text(self):
        return _("helpText")
