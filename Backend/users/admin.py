from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from users.models import AuditLog, CustomUser, EmailVerificationToken, PasswordResetToken


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display  = ('email', 'full_name', 'platform_role', 'is_active', 'is_email_verified', 'date_joined')
    list_filter   = ('platform_role', 'is_active', 'is_email_verified', 'is_staff')
    search_fields = ('email', 'full_name', 'phone')
    ordering      = ('-date_joined',)
    readonly_fields = ('id', 'date_joined', 'last_login', 'last_login_ip', 'updated_at')

    fieldsets = (
        (None,          {'fields': ('id', 'email', 'password')}),
        ('Profile',     {'fields': ('full_name', 'phone', 'avatar')}),
        ('Roles',       {'fields': ('platform_role',)}),
        ('Status',      {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'is_phone_verified')}),
        ('Social',      {'fields': ('google_linked', 'facebook_linked')}),
        ('Metadata',    {'fields': ('last_login_ip', 'date_joined', 'updated_at')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'full_name', 'password1', 'password2', 'platform_role'),
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ('action', 'user', 'ip_address', 'created_at')
    list_filter   = ('action',)
    search_fields = ('user__email', 'action', 'ip_address')
    readonly_fields = ('user', 'action', 'target_model', 'target_id', 'ip_address', 'user_agent', 'metadata', 'created_at')
    ordering      = ('-created_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display  = ('user', 'expires_at', 'created_at')
    readonly_fields = ('token', 'expires_at', 'created_at')

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display  = ('user', 'is_used', 'expires_at', 'created_at')
    list_filter   = ('is_used',)
    readonly_fields = ('token', 'is_used', 'expires_at', 'created_at')
