import json

from django.contrib.auth.decorators import login_required
from django.conf import settings
from SPARQLWrapper import SPARQLWrapper
from django.http import HttpResponse

@login_required
def annotation_created(request):
    if request.method == 'POST':
        annotation = json.loads(request.POST['annotation'])
        rdf = annotation['rdf']

        sparql = SPARQLWrapper(settings.ENDPOINT_UPDATE)
        sparql.method = 'POST'

        if rdf['typeof'] == 'http://www.wikidata.org/wiki/Q5':
            # insert statements about a person
            sparql.setQuery(statement_about_person(annotation))
            sparql.query()
        elif rdf['typeof'] == 'http://www.wikidata.org/wiki/Q31855':
            pass

    return HttpResponse('')


def statement_about_person(annotation):
    rdf = annotation['rdf']
    query = u'''INSERT DATA {{
    <{}> <rdf:type> <foaf:Person>;
    <foaf:name> "{}". }}'''.format(rdf['about'], rdf['label'])

    return query