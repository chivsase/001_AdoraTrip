from django.utils.functional import SimpleLazyObject


class OrgContextMiddleware:
    """
    Attaches request.org and request.org_role to every request.

    Uses SimpleLazyObject so the database lookup is deferred until the first
    time a view (or permission class) accesses request.org. This is critical
    for DRF + JWT: at middleware setup time request.user is still AnonymousUser
    because DRF authenticates during view dispatch. By the time the lazy getter
    fires, DRF will have set request._request.user to the authenticated user.

    Rules:
    - One active membership  → auto-select that org.
    - Multiple memberships   → read X-Organization-Id request header.
    - No memberships / anon  → request.org is None.

    org_role is set as a side-effect when the lazy org is first resolved.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.org_role = None
        request.org = SimpleLazyObject(lambda: self._resolve_org(request))
        return self.get_response(request)

    def _resolve_org(self, request):
        """Resolve and return the active Organization for this request, or None."""
        from organizations.models import OrganizationMembership

        user = request.user  # DRF sets this on the underlying HttpRequest during dispatch
        if not user or not user.is_authenticated:
            return None

        memberships = list(
            OrganizationMembership.objects.filter(
                user=user, is_active=True
            ).select_related('organization')
        )

        if not memberships:
            return None

        if len(memberships) == 1:
            request.org_role = memberships[0].role
            return memberships[0].organization

        # Multiple orgs: client must supply X-Organization-Id header
        org_id = request.headers.get('X-Organization-Id')
        if org_id:
            for m in memberships:
                if str(m.organization_id) == org_id:
                    request.org_role = m.role
                    return m.organization

        return None


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
