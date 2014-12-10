import requests

from django.http import HttpResponseBadRequest
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.views.decorators.http import require_POST, require_GET


@login_required
@require_GET
def root(request):
    if request.method == 'GET':
        response = requests.get(settings.ANNOTATION_STORE_URL + '/')
        return JsonResponse(response.json(), safe=False)
    else:
        return HttpResponseBadRequest


@login_required
@require_GET
def index(request):
    if request.method == 'GET':
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations')
        return JsonResponse(response.json(), safe=False)
    else:
        return HttpResponseBadRequest


@login_required
@require_GET
def read(request, id):
    if request.method == 'GET':
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations/' + id)
        return JsonResponse(response.json(), safe=False)
    else:
        return HttpResponseBadRequest


@login_required
@require_GET
def filter_annotations(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations')
    annotations = response.json()
    filtered_annotations = [
        element for element in annotations
        if 'creator' in element and
        'email' in element['creator'] and
        element['creator']['email'] == request.user.email
    ]
    return JsonResponse(filtered_annotations, safe=False)


@login_required
def search(request):
    if request.method == 'GET':
        response = requests.get(settings.ANNOTATION_STORE_URL + '/search?')
        return JsonResponse(response.json(), safe=False)
    else:
        pass


def list_my_annotations(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations')
    return JsonResponse(response.json(), safe=False)
