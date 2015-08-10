from django.db import models
from django.conf import settings


class ResourceMixin(models.Model):
    id = models.CharField('id', primary_key=True, max_length=50)
    label = models.CharField('label', max_length=100)
    comment = models.CharField('comment', blank=True, max_length=500)

    class Meta:
        abstract = True

    def uri(self):
        class_name = self.__class__.__name__.lower()
        return settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/' + class_name + '/' + self.id

    def __str__(self):
        return self.label
