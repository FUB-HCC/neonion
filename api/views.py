import requests
import json

from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from authentication import UnsafeSessionAuthentication
from common.annotation import pre_process_annotation, post_process_annotation


class AnnotationListView(APIView):
    # TODO: find solution for annotator.store plugin an CSRF Tokens othern than ignoring the absence of the token
    authentication_classes = (UnsafeSessionAuthentication,)
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        if 'private' in request.query_params:
            """Returns a list of all annotations filtered by current user"""
            response = requests.get(settings.ANNOTATION_STORE_URL + '/search?oa.annotatedBy.email=' + request.user.email)
            return JsonResponse(response.json()['rows'], safe=False)
        else:
            """Returns a list of all annotations"""
            response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations')
            return JsonResponse(response.json(), safe=False)

    def post(self, request, format=None):
        """Creates a new annotation"""
        annotation = json.loads(request.body)

        pre_process_annotation(annotation)

        # forward request to annotation store
        headers = {'content-type': 'application/json'}
        response = requests.post(settings.ANNOTATION_STORE_URL + '/annotations',
                                 data=json.dumps(annotation), headers=headers)

        post_process_annotation(annotation)

        return JsonResponse(response.json(), status=201, safe=False)


class AnnotationDetailView(APIView):
    # TODO: find solution for annotator.store plugin an CSRF Tokens other than ignoring the absence of the token
    authentication_classes = (UnsafeSessionAuthentication,)
    permission_classes = (permissions.AllowAny,)

    def get(self, request, pk, format=None):
        """Returns the specified annotation object"""
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations/' + pk)
        return JsonResponse(response.json(), safe=False)

    def put(self, request, pk, format=None):
        """Updates the specified annotation object"""
        headers = {'content-type': 'application/json'}
        response = requests.put(settings.ANNOTATION_STORE_URL + '/annotations/' + pk,
                                data=request.body, headers=headers)
        return JsonResponse(response.json(), safe=False)

    def delete(self, request, pk, format=None):
        """Deletes the specified annotation object"""
        requests.delete(settings.ANNOTATION_STORE_URL + '/annotations/' + pk)
        return Response('', status=204)


@api_view(["GET"])
def store_root(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/')
    return JsonResponse(response.json(), safe=False)


@api_view(["GET"])
def store_search(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/search?' + request.GET.urlencode())
    return JsonResponse(response.json(), safe=False)