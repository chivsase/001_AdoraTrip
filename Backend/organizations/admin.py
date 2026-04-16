from django.contrib import admin

from organizations.models import Organization, OrganizationInvitation, OrganizationMembership


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display  = ('name', 'org_type', 'status', 'subscription_tier', 'created_by', 'created_at')
    list_filter   = ('org_type', 'status', 'subscription_tier')
    search_fields = ('name', 'slug', 'business_email', 'registration_no')
    readonly_fields = ('id', 'slug', 'created_by', 'created_at', 'updated_at')
    ordering      = ('-created_at',)

    fieldsets = (
        (None,         {'fields': ('id', 'name', 'slug', 'org_type', 'status')}),
        ('Contact',    {'fields': ('business_email', 'business_phone', 'address', 'city')}),
        ('Legal/KYC',  {'fields': ('registration_no', 'tax_id')}),
        ('Platform',   {'fields': ('subscription_tier', 'created_by', 'rejection_reason')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    actions = ['approve_organizations', 'suspend_organizations']

    @admin.action(description='Approve selected organizations')
    def approve_organizations(self, request, queryset):
        queryset.update(status='ACTIVE')

    @admin.action(description='Suspend selected organizations')
    def suspend_organizations(self, request, queryset):
        queryset.update(status='SUSPENDED')


@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    list_display  = ('user', 'organization', 'role', 'is_active', 'invited_at', 'accepted_at')
    list_filter   = ('role', 'is_active')
    search_fields = ('user__email', 'organization__name')
    readonly_fields = ('id', 'invited_at', 'accepted_at')


@admin.register(OrganizationInvitation)
class OrganizationInvitationAdmin(admin.ModelAdmin):
    list_display  = ('email', 'organization', 'role', 'is_accepted', 'expires_at', 'created_at')
    list_filter   = ('role', 'is_accepted')
    search_fields = ('email', 'organization__name')
    readonly_fields = ('id', 'token', 'created_at')
