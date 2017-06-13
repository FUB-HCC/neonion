import os, sys
import logging
from documents.models import Document
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.conf import settings


log = logging.getLogger(__name__)


# Signal which ensures that metadata gets saved automatically after newly created document
@receiver(post_save, sender=Document)
def document_created(sender, instance, created, **kwargs):
    if settings.USER_LOGGING_ENABLED:
        if created:
            try:
                title = instance.title
                creator = instance.description
                log.error('document_created=_%s'%(title))
            except Exception as e:
                print(e.message)

def log_document_metadata_request_error(error):
    #if settings.USER_LOGGING_ENABLED:
        log.error(error)
