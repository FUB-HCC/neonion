from django.db import models
from common.vocab import neonion


class LinkedConceptManager(models.Manager):
    def create_resource_provider(self, uri, label, linked_type, provider_class):
        return self.create(uri=uri, label=label, linked_type=linked_type, provider_class=provider_class)


class LinkedConcept(models.Model):
    uri = models.URLField('uri', primary_key=True, max_length=300)
    label = models.CharField('label', max_length=100)
    comment = models.CharField('comment', blank=True, max_length=500)
    # URI to the concept in external vocab
    linked_type = models.URLField('linked_type', blank=False, max_length=300)
    # path to the class which implements the knowledge extraction provider
    provider_class = models.CharField('provider_class', max_length=100)

    type = neonion.LINKED_CONCEPT

    # assign manager
    objects = LinkedConceptManager()

    def __unicode__(self):
        return self.uri


class ConceptManager(models.Manager):
    def create_concept(self, uri, label):
        return self.create(uri=uri, label=label)


class Concept(models.Model):
    uri = models.URLField('uri', primary_key=True, max_length=300)
    label = models.CharField('label', max_length=500)
    comment = models.CharField('comment', blank=True, max_length=500)
    # usage of additionalType similar to http://schema.org/Thing
    additional_type = models.URLField('additional_type', blank=True, max_length=300)
    # list of resource provider to external knowledge
    linked_concepts = models.ManyToManyField(LinkedConcept, null=True, blank=True)

    type = neonion.CONCEPT

    # assign manager
    objects = ConceptManager()

    def __unicode__(self):
        return self.uri


class AnnotationSetManager(models.Manager):
    def create_set(self, uri, label, comment='', concepts=[]):
        return self.create(uri=uri, label=label, comment=comment)


class AnnotationSet(models.Model):
    uri = models.URLField('uri', primary_key=True, max_length=300)
    label = models.CharField('label', max_length=500)
    comment = models.CharField('comment', blank=True, max_length=500)
    # list of concepts associated with set
    concepts = models.ManyToManyField(Concept, null=True, blank=True)

    type = neonion.ANNOTATION_SET

    # assign manager
    objects = AnnotationSetManager()

    def __unicode__(self):
        return self.uri