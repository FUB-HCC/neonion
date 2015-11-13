import json

from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.http import require_GET, require_POST

from django.contrib.auth.decorators import login_required

from common.knowledge.provider import Provider
from pyelasticsearch import ElasticSearch, bulk_chunks
from django.http import JsonResponse
from pyelasticsearch.exceptions import IndexAlreadyExistsError, BulkError, ElasticHttpError, ElasticHttpNotFoundError


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
