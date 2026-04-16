from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from organizations.models import (
    OrgRole,
    Organization,
    OrganizationInvitation,
    OrganizationMembership,
    OrganizationStatus,
)
from organizations.permissions import IsOrgManager, IsOrgMember, IsOrgOwner, IsOrgOwnerOrSuperAdmin
from organizations.serializers import (
    AdminOrgApproveSerializer,
    AdminOrgRejectSerializer,
    AdminOrgSerializer,
    ChangeMemberRoleSerializer,
    InvitationAcceptSerializer,
    InviteMemberSerializer,
    MembershipSerializer,
    OrganizationCreateSerializer,
    OrganizationSerializer,
    OrganizationUpdateSerializer,
)
from users.permissions import IsAuthenticatedAndVerified, IsPlatformStaff, IsSuperAdmin


def _fire(task_func, *args, **kwargs):
    """Call a Celery task's .delay() and swallow broker errors gracefully."""
    try:
        task_func.delay(*args, **kwargs)
    except Exception:
        try:
            task_func(*args, **kwargs)
        except Exception:
            pass  # Never crash the request because of a background task


def _log(request, action, **meta):
    from users.tasks import create_audit_log
    _fire(
        create_audit_log,
        user_id=str(request.user.id) if request.user.is_authenticated else None,
        action=action,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        metadata=meta,
    )


# ─── Organization CRUD ────────────────────────────────────────────────────────

class OrganizationCreateView(GenericAPIView):
    """POST /api/v1/organizations/ — register a new organization (status=PENDING)."""
    permission_classes = [IsAuthenticatedAndVerified]
    serializer_class   = OrganizationCreateSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        org = serializer.save()

        # Auto-create OWNER membership for the creator
        from users.models import PlatformRole
        OrganizationMembership.objects.create(
            user=request.user,
            organization=org,
            role=OrgRole.OWNER,
            accepted_at=timezone.now(),
        )
        # Update user's platform role
        request.user.platform_role = PlatformRole.PARTNER_OWNER
        request.user.save(update_fields=['platform_role'])

        _log(request, 'ORG_CREATED', org_id=str(org.id))
        return Response(OrganizationSerializer(org).data, status=status.HTTP_201_CREATED)


class MyOrganizationsView(ListAPIView):
    """GET /api/v1/organizations/mine/ — orgs where current user is a member."""
    permission_classes = [IsAuthenticatedAndVerified]
    serializer_class   = OrganizationSerializer

    def get_queryset(self):
        org_ids = self.request.user.org_memberships.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        return Organization.objects.filter(id__in=org_ids)


class OrganizationDetailView(GenericAPIView):
    """
    GET   /api/v1/organizations/{org_id}/  — any member
    PATCH /api/v1/organizations/{org_id}/  — owner only
    """

    def get_object(self, org_id):
        try:
            return Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return None

    def get(self, request, org_id):
        org = self.get_object(org_id)
        if not org:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        perm = IsOrgMember()
        if not perm.has_object_permission(request, self, org):
            return Response({'detail': perm.message}, status=status.HTTP_403_FORBIDDEN)
        return Response(OrganizationSerializer(org).data)

    def patch(self, request, org_id):
        org = self.get_object(org_id)
        if not org:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        perm = IsOrgOwnerOrSuperAdmin()
        if not perm.has_object_permission(request, self, org):
            return Response({'detail': perm.message}, status=status.HTTP_403_FORBIDDEN)

        serializer = OrganizationUpdateSerializer(org, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        _log(request, 'ORG_UPDATED', org_id=str(org.id))
        return Response(OrganizationSerializer(org).data)


# ─── Member Management ────────────────────────────────────────────────────────

class MemberListView(GenericAPIView):
    """GET /api/v1/organizations/{org_id}/members/ — OWNER or MANAGER."""

    def get(self, request, org_id):
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        perm = IsOrgManager()
        if not perm.has_object_permission(request, self, org):
            return Response({'detail': perm.message}, status=status.HTTP_403_FORBIDDEN)

        memberships = org.memberships.filter(is_active=True).select_related('user')
        return Response(MembershipSerializer(memberships, many=True).data)


class InviteMemberView(GenericAPIView):
    """POST /api/v1/organizations/{org_id}/members/invite/ — OWNER only."""
    serializer_class = InviteMemberSerializer

    def post(self, request, org_id):
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        perm = IsOrgOwner()
        if not perm.has_object_permission(request, self, org):
            return Response({'detail': perm.message}, status=status.HTTP_403_FORBIDDEN)

        serializer = InviteMemberSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].lower()
        role  = serializer.validated_data['role']

        # Check: already a member?
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            invitee = User.objects.get(email=email)
            if org.memberships.filter(user=invitee, is_active=True).exists():
                return Response(
                    {'detail': 'This user is already a member of this organization.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except User.DoesNotExist:
            pass

        # Delete any existing pending invite for same email+org
        OrganizationInvitation.objects.filter(
            organization=org, email=email, is_accepted=False
        ).delete()

        invitation = OrganizationInvitation.create_for(
            organization=org,
            email=email,
            role=role,
            invited_by=request.user,
        )

        from organizations.tasks import send_invitation_email
        _fire(send_invitation_email, str(invitation.id))

        _log(request, 'MEMBER_INVITED', org_id=str(org.id), invitee_email=email, role=role)
        return Response({'detail': f'Invitation sent to {email}.'}, status=status.HTTP_201_CREATED)


class RemoveMemberView(APIView):
    """DELETE /api/v1/organizations/{org_id}/members/{user_id}/ — OWNER only."""

    def delete(self, request, org_id, user_id):
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        perm = IsOrgOwner()
        if not perm.has_object_permission(request, self, org):
            return Response({'detail': perm.message}, status=status.HTTP_403_FORBIDDEN)

        if str(request.user.id) == str(user_id):
            return Response(
                {'detail': 'You cannot remove yourself. Transfer ownership first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership = OrganizationMembership.objects.filter(
            organization=org, user_id=user_id, is_active=True
        ).first()
        if not membership:
            return Response({'detail': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)

        membership.is_active = False
        membership.save(update_fields=['is_active'])

        # Recalculate removed user's platform_role
        from organizations.signals import _recalculate_platform_role
        from django.contrib.auth import get_user_model
        _recalculate_platform_role(get_user_model().objects.get(id=user_id))

        _log(request, 'MEMBER_REMOVED', org_id=str(org.id), removed_user=str(user_id))
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangeMemberRoleView(GenericAPIView):
    """PATCH /api/v1/organizations/{org_id}/members/{user_id}/role/ — OWNER only."""
    serializer_class = ChangeMemberRoleSerializer

    def patch(self, request, org_id, user_id):
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        perm = IsOrgOwner()
        if not perm.has_object_permission(request, self, org):
            return Response({'detail': perm.message}, status=status.HTTP_403_FORBIDDEN)

        serializer = ChangeMemberRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        membership = OrganizationMembership.objects.filter(
            organization=org, user_id=user_id, is_active=True
        ).first()
        if not membership:
            return Response({'detail': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)

        old_role = membership.role
        membership.role = serializer.validated_data['role']
        membership.save(update_fields=['role'])

        # Sync platform_role
        from organizations.signals import _recalculate_platform_role
        _recalculate_platform_role(membership.user)

        _log(request, 'MEMBER_ROLE_CHANGED',
             org_id=str(org.id), user=str(user_id),
             old_role=old_role, new_role=membership.role)
        return Response(MembershipSerializer(membership).data)


# ─── Invitation Accept ────────────────────────────────────────────────────────

class InvitationAcceptView(GenericAPIView):
    """
    POST /api/v1/organizations/invitations/{token}/accept/
    AllowAny — the magic-link email brings the invitee here.
    If they don't have an account yet, supply full_name + password.
    """
    permission_classes = [AllowAny]
    serializer_class   = InvitationAcceptSerializer

    def post(self, request, token):
        try:
            invitation = OrganizationInvitation.objects.select_related(
                'organization', 'invited_by'
            ).get(token=token)
        except OrganizationInvitation.DoesNotExist:
            return Response({'detail': 'Invalid invitation token.'}, status=status.HTTP_404_NOT_FOUND)

        if not invitation.is_valid():
            return Response(
                {'detail': 'This invitation has expired or already been accepted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.contrib.auth import get_user_model
        from users.serializers import get_tokens_for_user
        User = get_user_model()

        # Find or create the invitee
        try:
            user = User.objects.get(email__iexact=invitation.email)
        except User.DoesNotExist:
            # New user — need password
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            password  = serializer.validated_data.get('password')
            full_name = serializer.validated_data.get('full_name', '')
            if not password:
                return Response(
                    {'detail': 'Password is required to create a new account.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = User.objects.create_user(
                email=invitation.email,
                password=password,
                full_name=full_name,
                is_email_verified=True,  # invitation link confirms ownership
            )

        # Create or reactivate membership
        org = invitation.organization
        membership, created = OrganizationMembership.objects.get_or_create(
            user=user,
            organization=org,
            defaults={'role': invitation.role, 'invited_by': invitation.invited_by},
        )
        if not created:
            membership.role      = invitation.role
            membership.is_active = True
            membership.save(update_fields=['role', 'is_active'])

        membership.accepted_at = timezone.now()
        membership.save(update_fields=['accepted_at'])

        # Mark invitation used
        invitation.is_accepted = True
        invitation.save(update_fields=['is_accepted'])

        # Sync user's platform_role
        from organizations.signals import _recalculate_platform_role
        _recalculate_platform_role(user)

        _log(request, 'INVITATION_ACCEPTED',
             org_id=str(org.id), user_email=user.email, role=invitation.role)

        tokens = get_tokens_for_user(user)
        return Response({
            'detail': f'You have joined {org.name} as {invitation.role}.',
            'org': {'id': str(org.id), 'name': org.name, 'slug': org.slug},
            **tokens,
        })


# ─── Admin — Organization Management ─────────────────────────────────────────

class AdminOrgListView(ListAPIView):
    """GET /api/v1/organizations/admin/ — PLATFORM_STAFF+."""
    permission_classes = [IsPlatformStaff]
    serializer_class   = AdminOrgSerializer

    def get_queryset(self):
        qs = Organization.objects.all().order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminOrgApproveView(APIView):
    """POST /api/v1/organizations/admin/{org_id}/approve/ — SUPER_ADMIN."""
    permission_classes = [IsSuperAdmin]

    def post(self, request, org_id):
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        org.status = OrganizationStatus.ACTIVE
        org.rejection_reason = ''
        org.save(update_fields=['status', 'rejection_reason'])

        _log(request, 'ORG_APPROVED', org_id=str(org.id))
        return Response({'detail': f'{org.name} approved and is now active.'})


class AdminOrgSuspendView(APIView):
    """POST /api/v1/organizations/admin/{org_id}/suspend/ — SUPER_ADMIN."""
    permission_classes = [IsSuperAdmin]

    def post(self, request, org_id):
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        org.status = OrganizationStatus.SUSPENDED
        org.save(update_fields=['status'])
        _log(request, 'ORG_SUSPENDED', org_id=str(org.id))
        return Response({'detail': f'{org.name} has been suspended.'})


class AdminOrgRejectView(GenericAPIView):
    """POST /api/v1/organizations/admin/{org_id}/reject/ — SUPER_ADMIN."""
    permission_classes = [IsSuperAdmin]
    serializer_class   = AdminOrgRejectSerializer

    def post(self, request, org_id):
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        org.status           = OrganizationStatus.REJECTED
        org.rejection_reason = serializer.validated_data['rejection_reason']
        org.save(update_fields=['status', 'rejection_reason'])

        _log(request, 'ORG_REJECTED', org_id=str(org.id))
        return Response({'detail': f'{org.name} has been rejected.'})
