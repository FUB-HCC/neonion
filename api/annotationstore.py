import requests
import json

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, generics
from authentication import UnsafeSessionAuthentication
from common.exceptions import InvalidResourceTypeError, InvalidAnnotationError
from common.annotation import SemanticAnnotationValidator, pre_process_annotation, post_process_annotation
from django.http import JsonResponse
from api.decorators import require_group_permission


class AnnotationListView(APIView):
    # TODO: find solution for annotator.store plugin an CSRF Tokens othern than ignoring the absence of the token
    authentication_classes = (UnsafeSessionAuthentication,)
    permission_classes = (permissions.AllowAny,)

    @require_group_permission
    def get(self, request, group_pk, document_pk, format=None):
        # return empty list on get
        # retrieve of annotations using search
        return JsonResponse([], safe=False)

    @require_group_permission
    def post(self, request, group_pk, document_pk, format=None):
        """Creates a new annotation"""
        annotation = json.loads(request.body)

        try:
            # validate annotation first
            validate = SemanticAnnotationValidator()
            validate(annotation)

            # add user to annotation
            if 'annotatedBy' not in annotation['oa']:
                annotation['oa']['annotatedBy'] = {
                    'email': request.user.email,
                    'type': "foaf:person"
                }

            # add permissions to annotation
            annotation['permissions'] = {
                'read': [group_pk],
                'update': [group_pk],
                'delete': [request.user.email],
                'admin': [request.user.email]
            }

            pre_process_annotation(annotation)

            # forward request to annotation store
            headers = {'content-type': 'application/json'}
            response = requests.post(settings.ANNOTATION_STORE_URL + '/annotations',
                                     data=json.dumps(annotation), headers=headers)

            post_process_annotation(annotation)
        except InvalidAnnotationError:
            pass
        except InvalidResourceTypeError:
            pass
        except Exception:
            pass

        return JsonResponse(response.json(), status=201, safe=False)


class AnnotationDetailView(APIView):
    # TODO: find solution for annotator.store plugin an CSRF Tokens other than ignoring the absence of the token
    authentication_classes = (UnsafeSessionAuthentication,)
    permission_classes = (permissions.AllowAny,)

    @require_group_permission
    def get(self, request, group_pk, document_pk, annotation_pk, format=None):
        """Returns the specified annotation object"""
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations/' + annotation_pk)
        return JsonResponse(response.json(), safe=False)

    @require_group_permission
    def put(self, request, group_pk, document_pk, annotation_pk, format=None):
        """Updates the specified annotation object"""
        headers = {'content-type': 'application/json'}
        response = requests.put(settings.ANNOTATION_STORE_URL + '/annotations/' + annotation_pk,
                                data=request.body, headers=headers)
        return JsonResponse(response.json(), safe=False)

    @require_group_permission
    def delete(self, request, group_pk, document_pk, annotation_pk, format=None):
        """Deletes the specified annotation object"""
        requests.delete(settings.ANNOTATION_STORE_URL + '/annotations/' + annotation_pk)
        return Response('', status=204)


class SearchView(generics.GenericAPIView):

    @require_group_permission
    def get(self, request, group_pk, document_pk, format=None):
        url = settings.ANNOTATION_STORE_URL + '/search?permissions.read={}&uri={}&'.format(group_pk, document_pk)
        response = requests.get(url + request.GET.urlencode())
        return JsonResponse(response.json(), safe=False)


@api_view(["GET"])
def root(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/')
    return JsonResponse(response.json(), safe=False)


@api_view(["GET"])
def search(request, format=None):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/search?' + request.GET.urlencode())
    return JsonResponse(response.json(), safe=False)
