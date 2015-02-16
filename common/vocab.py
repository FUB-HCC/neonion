from django.conf import settings


class neonion:
    ANNOTATION_SET = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + "/model/annotationset"
    CONCEPT = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + "/model/concept"
    LINKED_CONCEPT = settings.NEONION['BASE_NAMESPACE'].rstrip('/') + "/model/linkedconcept"