# coding=utf-8

from django.core.urlresolvers import reverse
from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext, Context
from django.contrib.auth.decorators import login_required
from pyelasticsearch import ElasticSearch

import json
import random
import requests
from django.http import HttpResponse


# Create your views here.
@login_required
def home(request):
    return render_to_response('base_overview.html', {}, context_instance=RequestContext(request))

@login_required
def annotator(request, doc_id):
    loomp_url = 'http://localhost:9090/content/get?uri={}'.format( "http://loomp.org/data/" + doc_id )
    r = requests.get( loomp_url )
    doc = json.loads(r.text)

    data = {}
    data['doc_id'] = doc_id
    data['doc_title'] = doc['title']
    data['doc_content'] = doc['content']
    data['me_url'] = reverse('accounts:accounts.views.me')
    data['store_url'] = settings.ANNOTATION_STORE_URL

    return render_to_response('base_annotator.html', Context(data), context_instance = RequestContext(request))

@login_required
def import_document(request):
    return render_to_response('base_import.html', { }, context_instance=RequestContext(request))

@login_required
def elasticsearch(request, index):
    if request.GET:
        if 'q' in request.GET:
            query = request.GET.get('q')
            size = 10
            url = settings.ELASTICSEARCH_URL + '/' + index + '/_search?size='+str(size)+'&pretty=true&source={"query":{"fuzzy_like_this":{"fields":["label","alias"],"like_text":"' + query + '"}}}'
            print(url)
            r = requests.get( url )
            return HttpResponse( r.text, content_type='application/json' )

@login_required
def elasticsearchCreate(request, index):
    if request.method == 'POST':
        data = json.loads(request.POST['data'])
        data['new'] = True
        # random identifer
        data['uri'] = ''.join(random.choice('0123456789ABCDEF') for i in range(32))

        # store data in elasticsearch
        es = ElasticSearch(settings.ELASTICSEARCH_URL)
        if index == 'persons':
            es.index(index, "person", data)
        elif index == 'institutes':
            es.index(index, "institute", data)
        es.refresh(index)

        return HttpResponse(json.dumps(data), content_type="application/json")

@login_required
def loomp_get(request):
    if request.GET:
        if 'uri' in request.GET:
            loomp_url = 'http://localhost:9090/content/get?uri={}'.format( request.GET.get('uri') )
            r = requests.get( loomp_url )
            return HttpResponse( r.text, content_type='application/json' )
        else:
            pass

@login_required
def loomp_getAll(request):
    if request.GET:
        if 'type' in request.GET:
            loomp_url = 'http://localhost:9090/content/getAll?type={}'.format( request.GET.get('type') )
            r = requests.get( loomp_url )
            print(r.url)
            return HttpResponse( r.text, content_type='application/json' )
        else:
            pass

@login_required
def loomp_save(request):
    if request.POST:
        if 'data' in request.POST:
            loomp_url = 'http://localhost:9090/content/save'
            r = requests.post( loomp_url, data = { 'data' : request.POST.get('data'), 'fmt': 'JSON' } )
            return HttpResponse( r.text, content_type='application/json' )
        else:
            pass