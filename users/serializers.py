from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# ----------------------------------------------------------
# JWT — Custom Claims
# ----------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Embeds platform_role, org_memberships, and is_email_verified directly
    into the JWT payload to avoid a DB round-trip on every API request.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Custom claims
        token['email']             = user.email
        token['full_name']         = user.full_name
        token['platform_role']     = user.platform_role
        token['is_email_verified'] = user.is_email_verified

        # Embed org memberships (keeps permission checks in-memory)
        token['org_memberships'] = [
            {
                'org_id':   str(m.organization_id),
                'org_slug': m.organization.slug,
                'org_name': m.organization.name,
                'role':     m.role,
            }
            for m in user.org_memberships.filter(is_active=True).select_related('organization')
        ]
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Append user profile to login response
        data['user'] = UserProfileSerializer(self.user).data
        return data


def get_tokens_for_user(user):
    """Utility: generate access + refresh token pair for a user."""
    refresh = RefreshToken.for_user(user)
    # Inject custom claims
    refresh['email']             = user.email
    refresh['full_name']         = user.full_name
    refresh['platform_role']     = user.platform_role
    refresh['is_email_verified'] = user.is_email_verified
    refresh['org_memberships'] = [
        {
            'org_id':   str(m.organization_id),
            'org_slug': m.organization.slug,
            'org_name': m.organization.name,
            'role':     m.role,
        }
        for m in user.org_memberships.filter(is_active=True).select_related('organization')
    ]
    return {
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
    }


# ----------------------------------------------------------
# User Profile
# ----------------------------------------------------------

class OrgMembershipSerializer(serializers.Serializer):
    """Read-only org membership summary embedded in user profile."""
    org_id   = serializers.UUIDField(source='organization.id')
    org_slug = serializers.CharField(source='organization.slug')
    org_name = serializers.CharField(source='organization.name')
    org_type = serializers.CharField(source='organization.org_type')
    role     = serializers.CharField()


class UserProfileSerializer(serializers.ModelSerializer):
    org_memberships = OrgMembershipSerializer(
        source='org_memberships',
        many=True,
        read_only=True,
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'avatar',
            'platform_role', 'is_email_verified', 'is_phone_verified',
            'google_linked', 'facebook_linked',
            'date_joined', 'org_memberships',
        ]
        read_only_fields = [
            'id', 'email', 'platform_role', 'is_email_verified',
            'is_phone_verified', 'google_linked', 'facebook_linked',
            'date_joined', 'org_memberships',
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'phone', 'avatar']


# ----------------------------------------------------------
# Registration
# ----------------------------------------------------------

class RegisterSerializer(serializers.Serializer):
    email      = serializers.EmailField()
    password   = serializers.CharField(write_only=True, min_length=8)
    full_name  = serializers.CharField(max_length=150)
    phone      = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
        )
        return user


# ----------------------------------------------------------
# Password Flows
# ----------------------------------------------------------

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token        = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password     = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value


# ----------------------------------------------------------
# Email Verification
# ----------------------------------------------------------

class EmailVerifySerializer(serializers.Serializer):
    token = serializers.CharField()


# ----------------------------------------------------------
# Admin — User Management
# ----------------------------------------------------------

class AdminUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone',
            'platform_role', 'is_active', 'is_email_verified',
            'date_joined', 'last_login',
        ]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['platform_role', 'is_active']
