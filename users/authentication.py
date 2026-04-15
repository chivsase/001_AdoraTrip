from django.core.cache import cache
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CustomJWTAuthentication(JWTAuthentication):
    """
    Extends SimpleJWT's JWTAuthentication to support "logout all devices".

    When a user changes their password or an admin suspends their account,
    a Redis key is set:
        user_token_invalidation:{user_uuid} = Unix timestamp

    Any token whose `iat` (issued-at) is before that timestamp is rejected
    immediately — even if the token signature is valid and it hasn't expired.
    This forces re-login on all devices within at most ACCESS_TOKEN_LIFETIME.
    """

    INVALIDATION_KEY_PREFIX = 'user_token_invalidation'

    def get_validated_token(self, raw_token):
        validated_token = super().get_validated_token(raw_token)

        user_id  = str(validated_token.get('sub', ''))
        iat      = validated_token.get('iat', 0)

        if user_id:
            cache_key  = f'{self.INVALIDATION_KEY_PREFIX}:{user_id}'
            invalidated_at = cache.get(cache_key)
            if invalidated_at and iat < invalidated_at:
                raise InvalidToken('Token has been invalidated. Please log in again.')

        return validated_token

    @classmethod
    def invalidate_user_tokens(cls, user_id: str):
        """
        Call this after password reset or account suspension.
        All tokens issued before now() will be rejected.
        TTL = 30 days (matches REFRESH_TOKEN_LIFETIME).
        """
        import time
        cache_key = f'{cls.INVALIDATION_KEY_PREFIX}:{user_id}'
        cache.set(cache_key, time.time(), timeout=60 * 60 * 24 * 30)
