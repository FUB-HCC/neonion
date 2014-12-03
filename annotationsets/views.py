from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from annotationsets.models import AnnotationSet


@login_required
def list(request):
    annotation_sets = []
    for annotation_set in AnnotationSet.objects.all():
        annotation_sets.append({
            'uri': annotation_set.uri,
            'label': annotation_set.label,
            'allow_creation': annotation_set.allow_creation
        })

    return JsonResponse(annotation_sets)