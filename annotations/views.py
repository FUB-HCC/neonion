import requests

from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required


@login_required
def list(request):
    response = requests.get(settings.ELASTICSEARCH_URL + '/annotator/annotation/_query?q=_type:%20%22annotation%22')
    return JsonResponse(response.json())


@login_required
def delete_all(request):
    response = requests.delete(settings.ELASTICSEARCH_URL + '/annotator/annotation/_query?q=_type:%20%22annotation%22')
    return JsonResponse(response.json())