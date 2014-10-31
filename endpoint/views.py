import json

from django.contrib.auth.decorators import login_required
from django.conf import settings
from SPARQLWrapper import SPARQLWrapper, SPARQLExceptions
from django.http import HttpResponse

@login_required
def annotation_created(request):
    if request.method == 'POST':
        annotation = json.loads(request.POST['annotation'])
        rdf = annotation['rdf']
        print(settings.ENDPOINT_UPDATE)
        sparql = SPARQLWrapper(settings.ENDPOINT_UPDATE)
        sparql.method = 'POST'

        if rdf['typeof'] == 'http://www.wikidata.org/wiki/Q5':
            # insert statements about a person
            sparql.setQuery(statement_about_person(annotation))
            try :
                sparql.query()
            except SPARQLExceptions as e:
                print(e)
        elif rdf['typeof'] == 'http://www.wikidata.org/wiki/Q31855':
            pass

    return HttpResponse('')


def statement_about_person(annotation):
    print(annotation)
    rdf = annotation['rdf']
    query = u'''INSERT DATA {{
    <{}> <rdf:type> <foaf:Person>;
    <foaf:name> "{}". }}'''.format(rdf['about'], annotation['quote'])

    return query