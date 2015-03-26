from SPARQLWrapper import SPARQLWrapper
from django.conf import settings


def prepare_sparql(format='json'):
    if hasattr(settings, 'ENDPOINT') and hasattr(settings, 'ENDPOINT_UPDATE'):
        sparql = SPARQLWrapper(settings.ENDPOINT, settings.ENDPOINT_UPDATE)
        sparql.method = 'GET'
        sparql.setReturnFormat(format)
        return sparql
    else:
        raise ValueError("Missing parameter for ENDPOINT")


def insert_data(query):
    sparql = prepare_sparql()
    sparql.method = 'POST'
    sparql.setQuery(query)
    return sparql.query()


def execute_query(query, format='json'):
    sparql = prepare_sparql(format)
    sparql.setQuery(query)
    return sparql.query().convert()