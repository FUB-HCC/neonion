import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST
from elasticsearch import Elasticsearch, TransportError, helpers
from elasticsearch.helpers import BulkIndexError

from common.knowledge.provider import Provider


@login_required
@require_POST
def entity_bulk_import(request, index, type):
    json_data = ''
    # read chunks
    f = request.FILES.getlist('file')[0]
    for chunk in f.chunks():
        json_data += chunk

    data = json.loads(json_data)

    es = Elasticsearch(settings.ELASTICSEARCH_URL)
    try:
        es.indices.create(index)
    except TransportError:
        pass

    # clear item of type in document
    try:
        es.delete_by_query(index=index, doc_type=type, body='{"query":{"match_all":{}}}')
    except Exception:
        pass

    # https://gist.github.com/jayswan/a8d9920ef74516a02fe1
    # create generator
    def items():
        for item in data:
            item['_type'] = type
            item['_index'] = index
            yield item

    try:
        helpers.bulk(es, items())
    except BulkIndexError:
        pass

    # refresh the index
    es.indices.refresh(index=index)

    return HttpResponse(status=201)


@login_required
@require_GET
def entity_search(request, index, type, term):
    # call search method from provider
    provider = Provider(settings.ELASTICSEARCH_URL)
    return JsonResponse(provider.search(term, type, index), safe=False)
