import json

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST
from django.conf import settings
from SPARQLWrapper import SPARQLWrapper
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse


@login_required
@require_http_methods(["GET", "POST"])
def query(request):
    sparql_query = ''
    sparql_output= 'json'

    if request.method == 'POST':
        if 'query' in request.POST: sparql_query = request.POST['query']
        if 'output' in request.POST: sparql_output = request.POST['output']
    elif request.method == 'GET':
        if 'query' in request.GET: sparql_query = request.GET['query']
        if 'output' in request.GET: sparql_output= request.GET['output']

    print(sparql_query)
    try:
        # execute query
        sparql = SPARQLWrapper(settings.ENDPOINT, settings.ENDPOINT_UPDATE)
        sparql.setQuery(sparql_query)
        sparql.setReturnFormat(sparql_output)
        return JsonResponse(sparql.query().convert())
    except Exception as e:
        return HttpResponseForbidden()


@login_required
def query_form(request):
    if request.method == 'POST' and 'query-field' in request.POST:
        sparql_query = request.POST['query-field']
    elif request.method == 'GET' and 'query-field' in request.GET:
        sparql_query = request.GET['query-field']
    else:
        sparql_query = """SELECT * {
        \t?s <rdf:type> <foaf:Person> .
        \t?s <foaf:name> ?n
        }
        LIMIT 50"""

    return render_to_response('base_query.html', {'query': sparql_query, 'endpoint': settings.ENDPOINT}, context_instance=RequestContext(request))


@login_required
@require_POST
def annotation_created(request):
    annotation = json.loads(request.POST['annotation'])
    rdf = annotation['rdf']
    print(settings.ENDPOINT_UPDATE)

    if rdf['typeof'] == 'foaf:Person':
        # insert statements about a person
        try:
            # http://stackoverflow.com/questions/14160437/insert-delete-update-query-using-sparqlwrapper
            sparql = SPARQLWrapper(settings.ENDPOINT, settings.ENDPOINT_UPDATE)
            sparql.method = 'POST'
            sparql.setQuery(statement_about_person(annotation))
            sparql.query()
        except Exception as e:
            print(e)
    elif rdf['typeof'] == 'aiiso:Institution':
        pass

    return HttpResponse('')


def statement_about_person(annotation):
    print(annotation)
    rdf = annotation['rdf']
    query = u'''INSERT DATA {{
    <{}> <rdf:type> <foaf:Person>;
    <foaf:name> "{}". }}'''.format(rdf['about'], annotation['quote'])

    return query