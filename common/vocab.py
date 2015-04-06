from django.conf import settings
from enum import Enum


class neonion:
    ANNOTATION_SET = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/model/annotationset'
    CONCEPT = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/model/concept'
    LINKED_CONCEPT = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/model/linkedconcept'
    ANNOTATION_STORE_GRAPH = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + '/annotationStore'


class OpenAnnotation:
    PREFIX = 'oa:<http://www.w3.org/ns/oa#>'

    class TagTypes(Enum):
        tag = 'oa:Tag'
        semanticTag = 'oa:SemanticTag'