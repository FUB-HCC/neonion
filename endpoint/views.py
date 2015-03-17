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
    sparql_output = 'json'

    if request.method == 'POST':
        if 'query' in request.POST: sparql_query = request.POST['query']
        if 'output' in request.POST: sparql_output = request.POST['output']
    elif request.method == 'GET':
        if 'query' in request.GET: sparql_query = request.GET['query']
        if 'output' in request.GET: sparql_output = request.GET['output']

    print(sparql_query)
    try:
        # execute query
        sparql = SPARQLWrapper(settings.ENDPOINT, settings.ENDPOINT_UPDATE)
        sparql.setQuery(sparql_query)
        sparql.setReturnFormat(sparql_output)
        return JsonResponse(sparql.query().convert())
    except Exception as e:
        return HttpResponseForbidden()
