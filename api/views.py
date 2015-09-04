import requests
import json

from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.http import require_GET, require_POST
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions
from django.contrib.auth.decorators import login_required
from authentication import UnsafeSessionAuthentication
from common.exceptions import InvalidResourceTypeError, InvalidAnnotationError
from common.annotation import SemanticAnnotationValidator, pre_process_annotation, post_process_annotation
from common.knowledge.provider import Provider
from pyelasticsearch import ElasticSearch, bulk_chunks
from django.http import JsonResponse
from pyelasticsearch.exceptions import IndexAlreadyExistsError, BulkError, ElasticHttpError, ElasticHttpNotFoundError


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

        try:
            # validate annotation first
            validate = SemanticAnnotationValidator()
            validate(annotation)

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


@login_required
@require_POST
def es_bulk_import(request, index, type):
    json_data = ''
    # read chunks
    f = request.FILES.getlist('file')[0]
    for chunk in f.chunks():
        json_data += chunk

    data = json.loads(json_data)

    es = ElasticSearch(settings.ELASTICSEARCH_URL)
    try:
        es.create_index(index)
    except IndexAlreadyExistsError:
        pass
    except ElasticHttpError:
        pass

    # clear item of type in document
    try:
        es.delete_all(index, type)
    except ElasticHttpNotFoundError:
        pass

    # create generator
    def items():
        for item in data:
            yield es.index_op(item)

    for chunk in bulk_chunks(items(), docs_per_chunk=500, bytes_per_chunk=10000):
        try:
            es.bulk(chunk, doc_type=type, index=index)
        except BulkError:
            pass

    # refresh the index
    es.refresh(index)

    return HttpResponse(status=201)


@login_required
@require_GET
def es_search(request, index, type, term):
    # call search method from provider
    provider = Provider(settings.ELASTICSEARCH_URL)
    result_set = provider.search(term, type, index)['hits']['hits']
    result_set = map(lambda item: item['_source'], result_set)
    return JsonResponse(result_set, safe=False)
