import logging
from accounts.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.conf import settings

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def user_created(sender, instance, created, **kwargs):
    if settings.USER_LOGGING_ENABLED:
        if created:
            email = instance.email
            logger.info('user_created=' + email)
        else:
            email = instance.email
            logger.info('user_signedin=' + email)
