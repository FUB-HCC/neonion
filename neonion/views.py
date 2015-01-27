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
from annotationsets.models import AnnotationSet
from neonion.models import Workspace


# Create your views here.
@login_required
def home(request):
    return render_to_response('base_overview.html', {}, context_instance=RequestContext(request))


@login_required
def annotator(request, doc_urn):
    doc = get_object_or_404(Document, urn=doc_urn)
    workspace = Workspace.objects.get_workspace(owner=request.user)

    data = {
        'urn': doc_urn,
        'title': doc.title,
        'content': doc.content,
        'endpoint_url': '/endpoint/',
        'store_url': settings.ANNOTATION_STORE_URL,
        'ner_url': settings.NER_SERVICE_URL,
        'annotation_sets': workspace.annotation_sets.all()
    }
    return render_to_response('base_annotator.html', data, context_instance=RequestContext(request))


@login_required
def load_settings(request):
    workspace = Workspace.objects.get_workspace(owner=request.user)

    # update active annotation sets in current workspace
    if request.method == 'POST':
        # better move to update settings view???
        if 'as' in request.POST:
            active_sets = request.POST.getlist('as')
        else:
            active_sets = []

        for annotation_set in AnnotationSet.objects.all():
            if annotation_set.uri in active_sets:
                workspace.annotation_sets.add(annotation_set)
            else:
                workspace.annotation_sets.remove(annotation_set)

    annotation_sets = {}
    for annotation_set in AnnotationSet.objects.all():
        annotation_sets[annotation_set] = workspace.annotation_sets.all().filter(uri=annotation_set.uri).exists()

    data = {
        'annotation_sets': annotation_sets
    }
    return render_to_response('base_settings.html', data, context_instance=RequestContext(request))


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
def resource_search(request, index):
    if 'q' in request.GET:
        # TODO call WikiData.search method
        search_term = request.GET.get('q')
        size = 5
        query = {
            'query': {
                'filtered': {
                    'query': {
                        'bool': {
                            'should': [
                                {
                                    'wildcard': {
                                        'label': u'*{}*'.format(search_term)
                                    }
                                },
                                {
                                    'wildcard': {
                                        'aliases': u'*{}*'.format(search_term)
                                    }
                                },
                                {
                                    'more_like_this': {
                                        'fields': ['label', 'aliases'],
                                        'like_text': search_term,
                                        'min_term_freq': 1,
                                        'min_doc_freq': 1,
                                        'max_query_terms': 12
                                    }
                                }
                            ]
                        }
                    },
                    'filter': {
                        'type': {
                            'value': index
                        }
                    }
                }
            }
        }
        index = 'wikidata' # TODO
        url = settings.ELASTICSEARCH_URL + '/' + index + '/_search?size='+str(size)+'&pretty=true&source={}'.format(json.dumps(query))
        #print(url)
        r = requests.get(url)
        return JsonResponse(r.json())
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