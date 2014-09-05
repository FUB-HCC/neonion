# coding=utf-8

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

import json
import requests
from django.http import HttpResponse


# Create your views here.
@login_required
def home(request):
    return render_to_response('base_overview.html', {}, context_instance=RequestContext(request))

@login_required
def annotator(request, doc_id):
    return render_to_response('base_annotator.html', { "doc_id" : doc_id }, context_instance=RequestContext(request))

@login_required
def elasticsearch(request, index ):
    if request.GET:
        if 'q' in request.GET:
            query = request.GET.get('q')
            if index == 'persons':      size = 10
            elif index == 'institutes': size = 100
            else:                       size = 1
            url = 'http://localhost:9200/'+index+'/_search?size='+str(size)+'&pretty=true&source={"query":{"fuzzy_like_this":{"fields":["label","alias"],"like_text":"' + query + '"}}}'
            r = requests.get( url )
            return HttpResponse( r.text, content_type='application/json' )

@login_required
def loomp_get( request ):
    if request.GET:
        if 'uri' in request.GET:
            loomp_url = 'http://localhost:8080/content/get?uri={}'.format( request.GET.get('uri') )
            r = requests.get( loomp_url )
            return HttpResponse( r.text, content_type='application/json' )
        else:
            pass

@login_required
def loomp_getAll( request ):
    if request.GET:
        if 'type' in request.GET:
            loomp_url = 'http://localhost:8080/content/getAll?type={}'.format( request.GET.get('type') )
            r = requests.get( loomp_url )
            print(r.url)
            return HttpResponse( r.text, content_type='application/json' )
        else:
            pass

@login_required
def loomp_save( request ):
    if request.POST:
        if 'data' in request.POST:
            loomp_url = 'http://localhost:8080/content/save'
            r = requests.post( loomp_url, data = { 'data' : request.POST.get('data'), 'fmt': 'JSON' } )
            return HttpResponse( r.text, content_type='application/json' )
        else:
            pass

@login_required
def import_document(request):
    return render_to_response('base_import.html', { }, context_instance=RequestContext(request))