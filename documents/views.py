# coding=utf-8

import json
import re
import requests

from django.http import HttpResponse
from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from documents.models import Document
from requests.exceptions import ConnectionError, RequestException


@login_required
def list(request):
    documents = []
    for doc in Document.objects.all():
        documents.append({ 
            "urn" : doc.urn, 
            "title" : doc.title, 
            "createdAt" : str(doc.created)
        })

    return HttpResponse(json.dumps(documents), content_type="application/json")

@login_required
def get(request, doc_urn):
    pass

@login_required
def meta(request, doc_urn):
    pass

@login_required
def query(request, search_string):
    pass


@login_required
def euler_list(request):
    doc_list = []
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1964-1965", "urn" : "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1964-1965" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1958-1960", "urn" : "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1958-1960" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1972-1973", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1972-1973" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1968-1969", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1968-1969" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1966-1967", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1966-1967" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1964-1965", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1964-1965" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1962-1963", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1962-1963" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1961-1962", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1961-1962" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1960-1961", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1960-1961" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1958-1960", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1958-1960" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1956-1958", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1956-1958" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1954-1956", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1954-1956" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1952-1954 Teil1", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil1" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1952-1954 Teil2", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil2" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1951-1952", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1951-1952" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1946-51 Teil1", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil1" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1946-51 Teil2", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil2" })
    doc_list.append({ "name": "Tätigkeitsbericht der MPG 1946-51 Teil3", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil3" })

    return HttpResponse(json.dumps(doc_list), content_type="application/json")

@login_required
def euler_import(request, doc_urn):
    doc_rows = []
    pn = 1
    while True:
        try:
            cms_url = settings.EULER_URL + u'/hocr?document={0}&pn={1}'.format(doc_urn, pn)
            print(cms_url)
            pn += 1
            response = requests.get(cms_url)
            if (response.status_code == 200):
                doc_rows.append(response.text)
            else:
                break
        except (ConnectionError, RequestException) as err:
            break
    
    # strip markup
    doc_rows = map(postprocess_content, doc_rows)
    doc_title = " ".join(doc_urn.split("_"))

    new_document = Document.objects.create_document(doc_urn, doc_title, ''.join(doc_rows))

    return HttpResponse(json.dumps({ "urn" : doc_urn, "title" : doc_title}), content_type="application/json")

def postprocess_content(row):
      row = re.sub(r'\n', '', row)
      row = re.sub(r'<\/*span[^>]*?>', '', row)
      return row

@login_required
def euler_meta(request, doc_urn):
    pass

@login_required
def euler_query(request, search_string):
    pass