from django.db import models
from common.vocab import neonion
from common.mixins import ResourceMixin


class LinkedProperty(ResourceMixin, models.Model):
    # URI to the property in then external ontology
    linked_property = models.URLField('linked_property', blank=False, max_length=300)

    class_uri = neonion.LINKED_PROPERTY


class Property(ResourceMixin, models.Model):
    range = models.ManyToManyField("Concept", null=True, blank=True)
    # inverse property is the property to the inverse direction
    inverse_property = models.ForeignKey('self', blank=True, null=True, on_delete=models.SET_NULL)
    # list of linked properties
    linked_properties = models.ManyToManyField("LinkedProperty", null=True, blank=True)

    class_uri = neonion.PROPERTY


class LinkedConcept(ResourceMixin, models.Model):
    endpoint = models.URLField('endpoint', blank=True, max_length=300)
    # URI to the concept in then external ontology
    linked_type = models.URLField('linked_type', blank=False, max_length=300)
    # path to the class which implements the knowledge extraction provider
    provider_class = models.CharField('provider_class', max_length=100)

    class_uri = neonion.LINKED_CONCEPT


class Concept(ResourceMixin, models.Model):
    # list of resource provider to external knowledge
    linked_concepts = models.ManyToManyField("LinkedConcept", null=True, blank=True)
    properties = models.ManyToManyField("Property", null=True, blank=True)

    class_uri = neonion.CONCEPT


class AnnotationSet(ResourceMixin, models.Model):
    # list of concepts associated with set
    concepts = models.ManyToManyField("Concept", null=True, blank=True)

    class_uri = neonion.ANNOTATION_SET