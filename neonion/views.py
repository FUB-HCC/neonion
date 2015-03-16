# coding=utf-8

import json
import random
import requests

from django.http import HttpResponseBadRequest
from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET
from pyelasticsearch import ElasticSearch
from documents.models import Document
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from common.knowledge.provider import Provider


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
        'ner_url': settings.NER_SERVICE_URL,
    }
    return render_to_response('base_annotator.html', data, context_instance=RequestContext(request))


@login_required
def my_annotations(request):
    return render_to_response('base_my_annotations.html', {}, context_instance=RequestContext(request))


@login_required
def annotations_occurrences(request, quote):
    data = { 'annotation': quote }
    return render_to_response('base_annotations_occurrences.html', data, context_instance=RequestContext(request))


@login_required
def ann_documents(request, quote):
    data = { 'annotation': quote }
    return render_to_response('base_annotations_documents.html', data, context_instance=RequestContext(request))


@login_required
def load_settings(request):
    return render_to_response('base_settings.html', context_instance=RequestContext(request))


@login_required
def load_annotation_sets(request):
    return render_to_response('static/partials/annotationsets_list.html', context_instance=RequestContext(request))


@login_required
def load_ner_settings(request):
    return render_to_response('static/partials/ner_models.html', context_instance=RequestContext(request))


@login_required
def load_meta_data(request):
    return render_to_response('static/partials/meta_data.html', context_instance=RequestContext(request))


@login_required
def accounts_management(request):
    return render_to_response('accounts_management.html', context_instance=RequestContext(request))


@login_required
def import_document(request):
    data = {}
    if hasattr(settings, 'CONTENT_SYSTEM_CLASS'):
        data['use_file_upload'] = False
    else:
        data['use_file_upload'] = True

    return render_to_response('base_import.html', data, context_instance=RequestContext(request))


@login_required
@require_GET
def resource_search(request):
    if 'type' in request.GET and 'q' in request.GET:
        resource_type = request.GET.get('type')
        # extract from resource type
        search_type = resource_type.rstrip('/').rsplit('/', 1)[1]
        search_term = request.GET.get('q')
        # call search method from provider
        provider = Provider(settings.ELASTICSEARCH_URL)
        return JsonResponse(provider.search(search_term, search_type))
    else:
        return HttpResponseBadRequest()


@login_required
@require_POST
def resource_create(request, index):
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

    return JsonResponse(data)