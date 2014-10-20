import requests
import json

from django.conf import settings
from SPARQLWrapper import SPARQLWrapper
from django.shortcuts import render
from django.http import HttpResponse

@login_required
def annotation_created(request):
    if request.method == 'POST':
        docUrl = 'http://www.neonion.org/documents/' + request.POST['docUrn']
        annotationUri = '' #annotation['id']
        annotation = json.loads(request.POST['annotation'])
        rdf = annotation['rdf']

        sparql = SPARQLWrapper(settings.ENDPOINT_UPDATE)
        sparql.method = 'POST'
        
        # insert resource is mentioned in document statement
        query = u'INSERT DATA {{ GRAPH <http://neonion.org/> {{ <{}> <{}> <{}> . }} }}'.format(docUrl, r'http://purl.org/dc/terms/references', rdf['about'])
        sparql.setQuery(query)
        sparql.query()

        # # insert annotation refers to resource statement
        # query = u'INSERT DATA {{ GRAPH <http://neonion.org/> {{ "{}" <{}> <{}> . }} }}'.format(annotationUri, r'http://purl.org/dc/terms/hasPart', rdf['about'])
        # sparql.setQuery(query)
        #sparql.query()

        # # insert annotation type
        # query = u'INSERT DATA {{ GRAPH <http://neonion.org/> {{ "{}" <{}> <{}> . }} }}'.format(annotationUri, r'http://purl.org/dc/terms/type', rdf['typeof'])
        # sparql.setQuery(query)
        #sparql.query()

	
	return HttpResponse('')