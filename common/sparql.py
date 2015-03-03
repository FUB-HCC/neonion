from SPARQLWrapper import SPARQLWrapper
from django.conf import settings


def insert_data(query):
    try:
        # http://stackoverflow.com/questions/14160437/insert-delete-update-query-using-sparqlwrapper
        sparql = SPARQLWrapper(settings.ENDPOINT, settings.ENDPOINT_UPDATE)
        sparql.method = 'POST'
        sparql.setQuery(query)
        sparql.query()
    except Exception as e:
        print(e)

