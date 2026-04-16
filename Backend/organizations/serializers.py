from django.utils.text import slugify
from rest_framework import serializers

from organizations.models import (
    OrgRole,
    Organization,
    OrganizationInvitation,
    OrganizationMembership,
)


class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model  = Organization
        fields = [
            'id', 'name', 'slug', 'org_type', 'status',
            'business_email', 'business_phone', 'address', 'city',
            'subscription_tier', 'member_count', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'status', 'member_count', 'created_at']

    def get_member_count(self, obj):
        return obj.memberships.filter(is_active=True).count()


class OrganizationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Organization
        fields = [
            'name', 'org_type',
            'business_email', 'business_phone', 'address', 'city',
            'registration_no', 'tax_id',
        ]

    def validate_name(self, value):
        slug = slugify(value)
        if Organization.objects.filter(slug=slug).exists():
            raise serializers.ValidationError('An organization with this name already exists.')
        return value

    def create(self, validated_data):
        validated_data['slug']       = slugify(validated_data['name'])
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class OrganizationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Organization
        fields = ['name', 'business_email', 'business_phone', 'address', 'city']


class MembershipSerializer(serializers.ModelSerializer):
    user_email    = serializers.EmailField(source='user.email', read_only=True)
    user_name     = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar   = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model  = OrganizationMembership
        fields = [
            'id', 'user_id', 'user_email', 'user_name', 'user_avatar',
            'role', 'is_active', 'invited_at', 'accepted_at',
        ]
        read_only_fields = ['id', 'user_id', 'user_email', 'user_name', 'user_avatar', 'invited_at', 'accepted_at']


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role  = serializers.ChoiceField(choices=OrgRole.choices)

    def validate_role(self, value):
        # Only OWNER can invite another OWNER
        request = self.context.get('request')
        if value == OrgRole.OWNER and request:
            from users.models import PlatformRole
            if request.user.platform_role != PlatformRole.SUPER_ADMIN:
                raise serializers.ValidationError('Only platform admins can grant the Owner role.')
        return value


class ChangeMemberRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=OrgRole.choices)


class InvitationAcceptSerializer(serializers.Serializer):
    """
    Used when the invitee doesn't have an account yet.
    If they already have one, only the token is needed.
    """
    token    = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    full_name = serializers.CharField(required=False, max_length=150)


# Admin serializers
class AdminOrgSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model  = Organization
        fields = [
            'id', 'name', 'slug', 'org_type', 'status',
            'business_email', 'registration_no', 'tax_id',
            'subscription_tier', 'created_by_email',
            'rejection_reason', 'created_at',
        ]


class AdminOrgApproveSerializer(serializers.Serializer):
    pass  # no body needed


class AdminOrgRejectSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField()
