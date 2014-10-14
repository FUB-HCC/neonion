# coding=utf-8

from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required

import json
import re
import requests
from requests.exceptions import ConnectionError, RequestException
from django.http import HttpResponse

@login_required
def create(request):
    pass

@login_required
def list(request):
    response_data = []
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1964-1965", "urn" : "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1964-1965" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1958-1960", "urn" : "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1958-1960" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1972-1973", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1972-1973" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1968-1969", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1968-1969" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1966-1967", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1966-1967" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1964-1965", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1964-1965" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1962-1963", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1962-1963" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1961-1962", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1961-1962" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1960-1961", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1960-1961" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1958-1960", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1958-1960" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1956-1958", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1956-1958" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1954-1956", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1954-1956" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1952-1954 Teil1", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil1" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1952-1954 Teil2", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil2" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1951-1952", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1951-1952" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1946-51 Teil1", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil1" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1946-51 Teil2", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil2" })
    response_data.append({ "name": "Tätigkeitsbericht der MPG 1946-51 Teil3", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil3" })
    return HttpResponse(json.dumps(response_data), content_type="application/json")

@login_required
def get(request, doc_id):
    response_data = []
    pn = 1
    while True:
        try:
            cms_url = settings.EULER_URL + u'/hocr?document={0}&pn={1}'.format(doc_id, pn)
            print(cms_url)
            pn += 1
            response = requests.get(cms_url)
            if (response.status_code == 200):
                response_data.append(response.text)
            #else:
            break
        except (ConnectionError, RequestException) as err:
            break
    
    # strip markup
    response_data = map(postprocessContent, response_data)
    return HttpResponse(''.join(response_data), content_type="text/plain")

def postprocessContent(row):
      row = re.sub(r'\n', '', row)
      row = re.sub(r'<\/*span[^>]*?>', '', row)
      return row

@login_required
def meta(request, doc_id):
    pass

@login_required
def query(request, search_string):
    pass