from django.db import models


class AnnotationSetManager(models.Manager):
    def create_document(self, uri, label, allow_creation):
        return self.create(uri=uri, label=label, allow_creation=allow_creation)


class AnnotationSet(models.Model):
    uri = models.CharField('uri', primary_key=True, max_length=200)
    label = models.CharField('label', max_length=500)
    allow_creation = models.BooleanField('allowCreation', default=False)
    # assign manager
    objects = AnnotationSetManager()

    def __unicode__(self):
        return self.uri

    class Meta:
        ordering = ('uri',)