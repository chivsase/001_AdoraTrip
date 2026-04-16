# This makes Celery's app available as soon as Django starts,
# which is required for CELERY_TASK_ALWAYS_EAGER to take effect.
from config.celery import app as celery_app  # noqa: F401

__all__ = ('celery_app',)
