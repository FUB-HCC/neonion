import requests

from django.http import HttpResponseBadRequest
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt


@login_required
@require_http_methods(["GET"])
def root(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/')
    return JsonResponse(response.json(), safe=False)


@login_required
@csrf_exempt
@require_http_methods(["GET", "POST"])
def annotations(request):
    print(request.method)
    if request.method == 'GET':
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations')
        return JsonResponse(response.json(), safe=False)
    elif request.method == 'POST':
        headers = {'content-type': 'application/json'}
        response = requests.post(settings.ANNOTATION_STORE_URL + '/annotations', data=request.body, headers=headers)
        return JsonResponse(response.json(), status=201, safe=False)
    else:
        return HttpResponseBadRequest


@login_required
@csrf_exempt
#@require_http_methods(["GET", "PUT", "DELETE"])
def annotation(request, id):
    print('alternative')
    if request.method == 'GET':
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations/' + id)
        return JsonResponse(response.json(), safe=False)
    elif request.method == 'PUT':
        # TODO data parameter
        response = requests.put(settings.ANNOTATION_STORE_URL + '/annotations/' + id)
        return JsonResponse(response.json(), safe=False)
    elif request.method == 'DELETE':
        response = requests.delete(settings.ANNOTATION_STORE_URL + '/annotations/' + id)
        return JsonResponse(response.json(), safe=False, status=204)
    else:
        return HttpResponseBadRequest


@login_required
@require_http_methods(["GET"])
def filter_annotations(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/search?creator.email=' + request.user.email)
    return JsonResponse(response.json(), safe=False)


@login_required
@require_http_methods(["GET"])
def search(request):
    ##print(request.GET.urlencode())
    response = requests.get(settings.ANNOTATION_STORE_URL + '/search?' + request.GET.urlencode())
    return JsonResponse(response.json(), safe=False)

