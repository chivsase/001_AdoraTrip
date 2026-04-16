from django.utils.functional import SimpleLazyObject


class OrgContextMiddleware:
    """
    Attaches request.org and request.org_role after authentication.

    Rules:
    - If user belongs to exactly one active org → auto-select it.
    - If user belongs to multiple orgs → read X-Organization-Id header.
    - Non-partner roles (TRAVELER, GUIDE, etc.) → request.org = None.

    Views that need the org context use request.org directly.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.org      = None
        request.org_role = None

        response = self.get_response(request)

        # Attach after auth middleware has populated request.user
        if hasattr(request, 'user') and request.user.is_authenticated:
            self._attach_org_context(request)

        return response

    def _attach_org_context(self, request):
        from organizations.models import OrganizationMembership

        memberships = list(
            OrganizationMembership.objects.filter(
                user=request.user, is_active=True
            ).select_related('organization')
        )

        if not memberships:
            return

        if len(memberships) == 1:
            request.org      = memberships[0].organization
            request.org_role = memberships[0].role
            return

        # Multiple orgs: use header to pick context
        org_id = request.headers.get('X-Organization-Id')
        if org_id:
            for m in memberships:
                if str(m.organization_id) == org_id:
                    request.org      = m.organization
                    request.org_role = m.role
                    return


class AuditLogMiddleware:
    """
    Logs mutating auth and org requests to the AuditLog table via Celery.
    Only fires for POST/PUT/PATCH/DELETE on /api/v1/auth/ and /api/v1/organizations/.
    """
    WATCHED_PATHS   = ('/api/v1/auth/', '/api/v1/organizations/')
    WATCHED_METHODS = ('POST', 'PUT', 'PATCH', 'DELETE')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if (
            request.method in self.WATCHED_METHODS
            and any(request.path.startswith(p) for p in self.WATCHED_PATHS)
            and hasattr(request, 'user')
            and request.user.is_authenticated
            and response.status_code < 400
        ):
            from users.tasks import create_audit_log
            create_audit_log.delay(
                user_id=str(request.user.id),
                action=f'{request.method}:{request.path}',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                metadata={'status_code': response.status_code},
            )

        return response
