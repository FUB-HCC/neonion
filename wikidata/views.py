import json
import requests
from urllib import urlencode

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET

from annotationsets.models import Concept, LinkedConcept

import wiki


query_temp = "https://www.wikidata.org/w/api.php?action=wbsearchentities&language=en&format=json&uselang=en&{}"

def map_result(item):
    if type(item) == dict:
        return {
            "descr": item.get('description',''),
            "label": item.get('label',''),
            "id": item.get('id', ''),
            "uri": item.get('concepturi', ''),
            "aliases": item.get('aliases', []),
            "valid": item.get('valid', False),
            "rank": item.get('rank', -1)
        }
    elif type(item) == wiki._wiki.page.ItemPage:
        return {
            "descr": item.__dict__.get('descriptions',{}).get('en', ''),
            "label": item.__dict__.get('labels',{}).get('en', ''),
            "id": item.id,
            "uri": item.full_url(),
            "aliases": [a for a in item.__dict__.get('aliases', {}).values()],
            "valid": True
            }


def concept_linked_types_qids(concept):
    return [lc.linked_type.split('/')[-1] for lc in concept.linked_concepts.all()]


def search_typed_items(request, index, concept_id, term):

    url = query_temp.format(urlencode({"search":term}))
    response = requests.get(url)

    print(concept_id)
    print(response.json())

    results = []
    for i, result in enumerate(response.json()['search']):
        results.append(result)
        result['rank'] = i
    results = {result['id']:result for result in results}

    concept = Concept.objects.get(id=concept_id)
    print(concept)
    print(concept.id)
    query = 'VALUES ?item {{{}}} . VALUES ?type {{{}}} . ?item wdt:P31/wdt:P279* ?type.'.format(
            ' '.join(['wd:'+qid for qid in results.keys()]),
            ' '.join(['wd:'+qid for qid in concept_linked_types_qids(concept)]))

    items = wiki.query(query)
    for item in items:
        print(item.full_url())
        results[item.id]['valid'] = True

    if response.status_code == 200:
        item_list = filter(lambda r:r.get('valid'), map(map_result, sorted(results.values(), key=lambda r:r.get('rank',-1))))
    return JsonResponse(item_list, safe=False)


# Create your views here.
