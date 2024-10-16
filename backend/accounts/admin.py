from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'intra_email', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('42 Information', {'fields': ('intra_email', 'image_url')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('42 Information', {'fields': ('intra_email', 'image_url')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)