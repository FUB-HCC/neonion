from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from common.sparql import execute_query
from django.http import HttpResponseForbidden, JsonResponse


@login_required
@require_http_methods(["GET", "POST"])
def query(request):
    sparql_query = ''
    sparql_output = 'json'

    if request.method == 'POST':
        sparql_query = request.POST.get('query')
        sparql_output = request.POST.get('output')
    elif request.method == 'GET':
        if 'query' in request.GET: sparql_query = request.GET['query']
        if 'output' in request.GET: sparql_output = request.GET['output']

    try:
        print(request.POST)
        # execute query
        return JsonResponse(execute_query(sparql_query, sparql_output))
    except Exception as e:
        return HttpResponseForbidden()
