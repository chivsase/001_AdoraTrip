from django.urls import path

from organizations.views import (
    AdminOrgApproveView,
    AdminOrgListView,
    AdminOrgRejectView,
    AdminOrgSuspendView,
    ChangeMemberRoleView,
    InvitationAcceptView,
    InviteMemberView,
    MemberListView,
    MyOrganizationsView,
    OrganizationCreateView,
    OrganizationDetailView,
    RemoveMemberView,
)

app_name = 'organizations'

urlpatterns = [
    # Organization CRUD
    path('',                            OrganizationCreateView.as_view(),  name='org-create'),
    path('mine/',                       MyOrganizationsView.as_view(),     name='org-mine'),
    path('<uuid:org_id>/',              OrganizationDetailView.as_view(),  name='org-detail'),

    # Member management
    path('<uuid:org_id>/members/',                              MemberListView.as_view(),       name='member-list'),
    path('<uuid:org_id>/members/invite/',                       InviteMemberView.as_view(),     name='member-invite'),
    path('<uuid:org_id>/members/<uuid:user_id>/',               RemoveMemberView.as_view(),     name='member-remove'),
    path('<uuid:org_id>/members/<uuid:user_id>/role/',          ChangeMemberRoleView.as_view(), name='member-role'),

    # Invitation accept (magic link)
    path('invitations/<str:token>/accept/',                     InvitationAcceptView.as_view(), name='invitation-accept'),

    # Admin
    path('admin/',                                              AdminOrgListView.as_view(),     name='admin-org-list'),
    path('admin/<uuid:org_id>/approve/',                        AdminOrgApproveView.as_view(),  name='admin-org-approve'),
    path('admin/<uuid:org_id>/suspend/',                        AdminOrgSuspendView.as_view(),  name='admin-org-suspend'),
    path('admin/<uuid:org_id>/reject/',                         AdminOrgRejectView.as_view(),   name='admin-org-reject'),
]
