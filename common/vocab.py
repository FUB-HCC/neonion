from django.conf import settings
from enum import Enum


class neonion:
    CONCEPT_SET = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/ontology/conceptset'
    CONCEPT = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/ontology/concept'
    LINKED_CONCEPT = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/ontology/linkedconcept'
    PROPERTY = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/ontology/property'
    LINKED_PROPERTY = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/ontology/linkedproperty'
    DOCUMENT = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/ontology/document'

    ANNOTATION_STORE_GRAPH = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/annotationStore'


class OpenAnnotation:
    PREFIX = 'oa:<http://www.w3.org/ns/oa#>'

    class DocumentTypes(Enum):
        text = 'dctypes:Text'

    class TagTypes(Enum):
        tag = 'oa:Tag'
        semanticTag = 'oa:SemanticTag'

    class Motivations(Enum):
        commenting = 'oa:commenting'
        highlighting = 'oa:highlighting'
        tagging = 'oa:tagging'
        classifying = 'oa:classifying'
        identifying = 'oa:identifying'
        linking = 'oa:linking'
