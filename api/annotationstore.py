import requests
import json
import common.annotation as ann

from common.uri import generate_uri, generate_urn
from common.vocab import neonion, OpenAnnotation
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, generics
from authentication import UnsafeSessionAuthentication
from common.exceptions import InvalidResourceTypeError, InvalidAnnotationError
from django.http import JsonResponse
from api.decorators import require_group_permission
from documents.models import Document


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
            validate = ann.SemanticAnnotationValidator()
            validate(annotation)

            ann.add_creator(annotation, request.user.email)

            # OA specific enrichment
            if 'oa' in annotation:
                # add context JSON-LD embedding
                annotation['oa']['@context'] = settings.NEONION_BASE_NAMESPACE.rstrip('/') + "/ns/neonion-context.jsonld",
                # generate URI for annotation
                annotation['oa']['@id'] = generate_uri(neonion.ANNOTATION)

                # enricht body
                if 'hasBody' in annotation['oa']:
                    # generate URN for body
                    annotation['oa']['hasBody']['@id'] = generate_urn()

                    # generate URI for classifyied or identified instance
                    if (ann.motivation_equals(annotation, OpenAnnotation.Motivations.identifying) or
                        ann.motivation_equals(annotation, OpenAnnotation.Motivations.classifying)):
                        ann.add_resource_uri(annotation)

                # enrich target
                if 'hasTarget' in annotation['oa']:
                    # generate URN for target
                    annotation['oa']['hasTarget']['@id'] = generate_urn()

                    if 'hasSource' in annotation['oa']['hasTarget']:
                        document = Document.objects.get(pk=document_pk)
                        annotation['oa']['hasTarget']['hasSource']['@id'] = document.uri()

                    if 'hasSelector' in annotation['oa']['hasTarget']:
                        # generate URN for selector
                        annotation['oa']['hasTarget']['hasSelector']['@id'] = generate_urn()

            # Annotator specific enrichment
            # add permissions
            annotation['permissions'] = {
                'read': [group_pk],
                'update': [group_pk],
                'delete': [request.user.email],
                'admin': [request.user.email]
            }

            # forward request to annotation store
            headers = {'content-type': 'application/json'}
            response = requests.post(settings.ANNOTATION_STORE_URL + '/annotations',
                                     data=json.dumps(annotation), headers=headers)
            annotation = response.json()
            
            # serialize annotation to triple store
            if hasattr(settings, 'ENDPOINT_ENABLED') and settings.ENDPOINT_ENABLED:
                try:
                    ann.endpoint_create_annotation(annotation)
                except Exception:
                    pass

        except InvalidAnnotationError:
            pass
        except InvalidResourceTypeError:
            pass

        return JsonResponse(annotation, status=201, safe=False)


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
        annotation = json.loads(request.body)

        try:
            # validate annotation first
            validate = ann.SemanticAnnotationValidator()
            validate(annotation)

            ann.add_creator(annotation, request.user.email)

            headers = {'content-type': 'application/json'}
            response = requests.put(settings.ANNOTATION_STORE_URL + '/annotations/' + annotation_pk,
                                    data=request.body, headers=headers)
            annotation = response.json()
        
        except InvalidAnnotationError:
            pass
        except InvalidResourceTypeError:
            pass

        return JsonResponse(annotation, safe=False)

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
