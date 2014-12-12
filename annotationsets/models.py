from django.db import models


class ConceptSourceManager(models.Manager):
    def create_source(self, provider, class_name, concept_uri):
        return self.create(provider=provider, class_name=class_name, concept_uri=concept_uri)


class ConceptSource(models.Model):
    linked_concept_uri = models.CharField('linked_concept_uri', primary_key=True, max_length=500)
    provider = models.CharField('provider', max_length=100)
    # name of the class which implements the source
    class_name = models.CharField('class_name', max_length=100)
    # assign manager
    objects = ConceptSourceManager()


class AnnotationSetManager(models.Manager):
    def create_set(self, uri, label, allow_creation):
        return self.create(uri=uri, label=label, allow_creation=allow_creation)


class AnnotationSet(models.Model):
    uri = models.CharField('uri', primary_key=True, max_length=200)
    label = models.CharField('label', max_length=500)
    allow_creation = models.BooleanField('allowCreation', default=False)
    sources = models.ManyToManyField(ConceptSource, blank=True, null=True)
    # assign manager
    objects = AnnotationSetManager()

    def __unicode__(self):
        return self.uri

    class Meta:
        ordering = ('uri',)
