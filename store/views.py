import datetime
import json
import uuid

from django.conf import settings
from django.http import JsonResponse, HttpResponse
from pyelasticsearch import ElasticSearch, exceptions
from rest_framework import permissions, generics
from rest_framework.decorators import api_view
from rest_framework.views import APIView

import common.annotation as ann
from api.authentication import UnsafeSessionAuthentication
from common.exceptions import InvalidResourceTypeError, InvalidAnnotationError
from common.uri import generate_uri, generate_urn
from common.vocab import neonion, OpenAnnotation
from store.decorators import require_group_permission
from documents.models import Document
from logging.annotatorLogger import *


es = ElasticSearch(settings.ELASTICSEARCH_URL)
ANNOTATION_TYPE = 'annotation'
PAGE_SIZE = 1000


def convert_es_to_list(result_set):
    result_set = map(lambda item: item['_source'], result_set['hits']['hits'])
    return {
        'total': len(result_set),
        'rows': result_set
    }


def empty_result():
    return {'total': 0, 'rows': []}


def get_filter_query(parameters):
    query_params = []
    for key, value in parameters.iteritems():
        query_params.append({
            'term': {key: value}
        })

    return {
        "query": {
          "bool": {
            "must": {"match_all": {}},
            "filter": query_params
            }
          }
        }


class AnnotationListView(APIView):
    # TODO: find solution for annotator.store plugin an CSRF Tokens othern than ignoring the absence of the token
    authentication_classes = (UnsafeSessionAuthentication,)
    permission_classes = (permissions.AllowAny,)

    @require_group_permission
    def get(self, request, group_pk, document_pk, format=None):
        # return empty list on get
        return JsonResponse(empty_result())

    @require_group_permission
    def post(self, request, group_pk, document_pk, format=None):
        """Creates a new annotation"""
        annotation = json.loads(request.body)

        try:
            # firstly validate annotation
            validate = ann.AnnotationValidator()
            validate(annotation)
        except (InvalidAnnotationError, InvalidResourceTypeError):
            return HttpResponse(status=400)
        else:
            annotation['id'] = uuid.uuid1().hex
            ann.add_creator(annotation, request.user.email)
            annotation['created'] = datetime.datetime.now().isoformat()
            annotation['updated'] = annotation['created']

            # OA specific enrichment
            if 'oa' in annotation:
                # add context JSON-LD embedding
                annotation['oa']['@context'] = settings.NEONION_BASE_NAMESPACE.rstrip('/') + "/ns/neonion-context.jsonld",
                # generate URI for annotation
                annotation['oa']['@id'] = generate_uri(neonion.ANNOTATION)

                # enrich body
                if 'hasBody' in annotation['oa']:
                    # generate URN for body
                    annotation['oa']['hasBody']['@id'] = generate_urn()

                    # generate URI for classified or identified instance
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

            # serialize annotation to triple store
            if hasattr(settings, 'ENDPOINT_ENABLED') and settings.ENDPOINT_ENABLED:
                try:
                    ann.endpoint_create_annotation(annotation)
                except Exception:
                    pass

            try:
                es.index(settings.ELASTICSEARCH_INDEX, ANNOTATION_TYPE, annotation, id=annotation['id'])
		log_annotation_created(request)
            except:
                return HttpResponse(status=500)
            else:
                return JsonResponse(annotation, status=201, safe=False)


class AnnotationDetailView(APIView):
    # TODO: find solution for annotator.store plugin an CSRF Tokens other than ignoring the absence of the token
    authentication_classes = (UnsafeSessionAuthentication,)
    permission_classes = (permissions.AllowAny,)

    @require_group_permission
    def get(self, request, group_pk, document_pk, annotation_pk, format=None):
        """Returns the specified annotation object"""
        try:
            annotation = es.get(settings.ELASTICSEARCH_INDEX, ANNOTATION_TYPE, annotation_pk)
        except:
            return HttpResponse(status=500)
        else:
            return JsonResponse(annotation, safe=False)

    @require_group_permission
    def put(self, request, group_pk, document_pk, annotation_pk, format=None):
        """Updates the specified annotation object"""
        annotation = json.loads(request.body)

        try:
            # firstly validate annotation
            validate = ann.AnnotationValidator()
            validate(annotation)
        except (InvalidAnnotationError, InvalidResourceTypeError):
            return HttpResponse(status=400)
        else:
            ann.add_creator(annotation, request.user.email)
            annotation['updated'] = datetime.datetime.now().isoformat()

            try:
                es.index(settings.ELASTICSEARCH_INDEX, ANNOTATION_TYPE, annotation,
                         id=annotation['id'], overwrite_existing=True)
		log_annotation_edited(request)
            except:
                return HttpResponse(status=500)
            else:
                return JsonResponse(annotation, status=200, safe=False)

    @require_group_permission
    def delete(self, request, group_pk, document_pk, annotation_pk, format=None):
        """Deletes the specified annotation object"""
        try:
            es.delete(settings.ELASTICSEARCH_INDEX, ANNOTATION_TYPE, annotation_pk)
            log_annotation_deleted(request)
        except:
            return HttpResponse(status=500)
        else:
            return HttpResponse(status=204)


class SearchView(generics.GenericAPIView):

    @require_group_permission
    def get(self, request, group_pk, document_pk, format=None):
        params = dict(request.GET)
        offset = params.pop("offset", 0)
        size = params.pop("limit", PAGE_SIZE)
        params['permissions.read'] = group_pk
        params['uri'] = document_pk

        try:
            query = get_filter_query(params)
            response = es.search(query, index=settings.ELASTICSEARCH_INDEX,
                                 doc_type=ANNOTATION_TYPE, es_from=offset, size=size)
        except exceptions.ElasticHttpNotFoundError:
            return JsonResponse(empty_result())
        except:
            return HttpResponse(status=500)
        else:
            return JsonResponse(convert_es_to_list(response), safe=False)


@api_view(["GET"])
def root(request):
    return JsonResponse([], safe=False)


@api_view(["GET"])
def search(request, format=None):
    params = dict(request.GET)
    offset = params.pop("offset", 0)
    size = params.pop("limit", PAGE_SIZE)

    try:
        query = get_filter_query(params)
        response = es.search(query, index=settings.ELASTICSEARCH_INDEX,
                             doc_type=ANNOTATION_TYPE, es_from=offset, size=size)
    except exceptions.ElasticHttpNotFoundError:
        return JsonResponse(empty_result())
    except:
        return HttpResponse(status=500)
    else:
        return JsonResponse(convert_es_to_list(response), safe=False)
