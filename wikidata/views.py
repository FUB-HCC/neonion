import os
import re
import json
import requests
from urllib import urlencode

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET

from annotationsets.models import Concept, LinkedConcept

os.environ["PYWIKIBOT2_NO_USER_CONFIG"] = "1"
import wiki

# action, search, limit
wbapi_url_template = "https://www.wikidata.org/w/api.php?format=json&{}"

# insert 2 lists of items: instances and types to match against
types_query_template = 'VALUES ?item {{{}}} . VALUES ?type {{{}}} . ?item wdt:P31/wdt:P279* ?type.'

# insert filtered list of items
birth_death_query_template = 'VALUES ?item {{{}}} . {}'

# regular expression for parsing wikidata xs:dateTime literals
rx_dateTime = re.compile('^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-2][0-9]:[0-5][0-9]:[0-5][0-9]).*$')

# when querying for additional information to render into search result list, we look for these properties
temporal_properties = {
        "birth": "P569",
        "death": "P570"
        }


# render QId list to string with wd: prefix for every ID and space as delimiter
# (can be used for sparql expression ' VALUES ?item {...} . '
wd_item_id_list = lambda qids: ' '.join(['wd:' + qid for qid in qids])
# prepare query components for temporal_properties defined above
wd_opt_props = ' . '.join(
        ['OPTIONAL {{ ?item wdt:{} ?{} }}'.format(v, k)
            for k, v in temporal_properties.items()])

# TODO determine lang parameter based on language of document
def wbsearchentities(terms, limit=50, lang='en'):
    """Queries Wikidata's Wikibase API endpoint with action wbsearchentities"""
    res = []
    if terms and len(terms) > 0:
        url = wbapi_url_template.format(urlencode({
            "action": "wbsearchentities",
            "search": terms,
            "limit": limit,
            "language": lang,
            "uselang": lang
            }))
        response = requests.get(url)
        if response.status_code == 200:
            for i, result in enumerate(response.json().get('search', [])):
                res.append(result)
                result['rank'] = i
    return res

def validate_item_types(results, concept):
    """Takes an id:search_result dict and flags all items that match a linked concept of the passed neonion concept."""
    # extract Q-ids from URLs of external types linked to concept
    concept_linked_types_qids = [lc.linked_type.split('/')[-1] for lc in concept.linked_concepts.all()]
    # fill in item and type lists in SPARQL query
    query = types_query_template.format(
            wd_item_id_list(results.keys()),
            wd_item_id_list(concept_linked_types_qids)
            )
    # query WDQS endpoint, retrieve pywikidata ItemPage objects
    items = wiki.query(query)
    # in the search result dictionary, flag all items that are amongst results of previous SPARQL query
    for item in items:
        results[item.id]['valid'] = True
    # return
    return results


def add_temporal_data(results):
    """Try to retrieve timespan information like dates of birth and death."""
    # insert item IDs into SPARQL query template (only items of valid type for classifying concept)
    # insert OPTIONAL clauses matching properties defined above (temporal_properties)
    query = birth_death_query_template.format(
            wd_item_id_list(
                [k for k,v in results.items() if v.get('valid')]
                ),
            wd_opt_props
            )
    # query WDQS endpoint and retrieve JSON
    data = wiki.sparql(query)
    # TODO problem is that in order to do this properly, we would need to resolve predicate qualifiers because otherwise we
    # TODO can't tell whether a date is of the Gregorian or Julian calendar, nor what is its granularity/precision.
    # TODO this means we would specify the temporal properties not with wdt: but with p: prefix (which will return a statement url rather than a dateTime literal as value)
    # TODO and somehow address the statement's properties in the query. that's ridiculously complicated so we don't do it for now.
    # process response
    for row in data:
        # get corresponding entry in results dictionary (key: wd url hindmost segment of path)
        item = results.get(row.get('item', {}).get('value', '').split('/')[-1])
        # parse values for specified properties
        for prop in temporal_properties.keys():
            predicate = row.get(prop, {})
            if predicate.get('datatype') == 'http://www.w3.org/2001/XMLSchema#dateTime' and predicate.get('type') == 'literal':
                values = rx_dateTime.findall(predicate.get('value', ''))
                if len(values) > 0:
                    # if value available, write into dictionary
                    item[prop] = values[0][0]
    return results



# key mapping from wikidata to neonion (annotator controller)
mappings = {
        "description" : "descr",
        "concepturi": "uri",
        "repository": None,
        "title": None,
        "match": None
        }

def map_result(item):
    for wd_key, key in mappings.items():
        if key:
            item[key] = item.get(wd_key)
        if wd_key in item:
            del item[wd_key]
    return item



###########################################################################################################
##                                              VIEWS                                                    ##
###########################################################################################################

def search_typed_items(request, index, concept_id, term):

    item_list = []

    # go search for entities with matching labels/aliases
    results = wbsearchentities(term)
    # convert result list to dictionary, use ids as keys
    results = {result['id']:result for result in results}

    # retrieve neonion concept used for classification of selected terms
    concept = Concept.objects.get(id=concept_id)
    results = validate_item_types(results, concept)

    # try to enhance search results with life span information for persons
    # TODO add temporal data extraction and formatting for other concepts as well
    if concept_id == 'person':
        results = add_temporal_data(results)

    # return only matching items of valid type, mapped into schema expected by annotator controller and sorted by original rank
    item_list = filter(lambda r:r.get('valid'),
            map(map_result,
                sorted(results.values(),
                    key=lambda r:r.get('rank',-1))))

    return JsonResponse(item_list, safe=False)


