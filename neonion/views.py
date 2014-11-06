# coding=utf-8

import json
import random
import requests

from django.http import HttpResponse, HttpResponseForbidden, HttpResponseBadRequest
from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from pyelasticsearch import ElasticSearch
from documents.models import Document
from django.http import JsonResponse
from django.shortcuts import get_object_or_404


# Create your views here.
@login_required
def home(request):
    return render_to_response('base_overview.html', {}, context_instance=RequestContext(request))


@login_required
def annotator(request, doc_urn):
    doc = get_object_or_404(Document, urn=doc_urn)

    data = {
        'urn': doc_urn,
        'title': doc.title,
        'content': doc.content,
        'endpoint_url': '/endpoint/',
        'store_url': settings.ANNOTATION_STORE_URL,
    }
    return render_to_response('base_annotator.html', data, context_instance = RequestContext(request))


@login_required
def import_document(request):
    return render_to_response('base_import.html', {}, context_instance=RequestContext(request))


@login_required
def elasticsearch(request, index):
    if request.method == 'GET':
        if 'q' in request.GET:
            size = 10
            query = {
                'query': {
                    'fuzzy_like_this': {
                        'like_text': request.GET.get('q'),
                        'fields': ['label','alias'],
                        'fuzziness': 0.1,
                    }
                }
            }
            url = settings.ELASTICSEARCH_URL + '/' + index + '/_search?size='+str(size)+'&pretty=true&source={}'.format( json.dumps(query) )
            print(url)
            r = requests.get(url)
            return JsonResponse(r.json())
        else:
            return HttpResponseBadRequest()
    else:
        return HttpResponseForbidden()


@login_required
def elasticsearchCreate(request, index):
    if request.method == 'POST':
        data = json.loads(request.POST['data'])
        data['new'] = True
        # random identifier
        data['uri'] = ''.join(random.choice('0123456789ABCDEF') for i in range(32))

        # store data in elasticsearch
        es = ElasticSearch(settings.ELASTICSEARCH_URL)
        if index == 'persons':
            es.index(index, "person", data)
        elif index == 'institutes':
            es.index(index, "institute", data)
        es.refresh(index)

        return HttpResponse(json.dumps(data), content_type="application/json")
    else:
        return HttpResponseForbidden()