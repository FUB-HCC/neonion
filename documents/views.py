# coding=utf-8

import re
import requests
import os
import json

from django.http import HttpResponse, HttpResponseForbidden, Http404
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from documents.models import Document
from neonion.models import Workspace
from bs4 import BeautifulSoup
from django.shortcuts import get_object_or_404, redirect
from django.core.files.base import ContentFile

@login_required
def list(request):
    workspace = Workspace.objects.get_workspace(owner=request.user)
    #workspace.delete()

    documents = []
    for doc in workspace.documents.all():
        documents.append({ 
            "urn": doc.urn,
            "title": doc.title,
            "createdAt": str(doc.created)
        })

    return JsonResponse(documents, safe=False)

@login_required
def upload(request):
    if request.method == 'POST':
        for f in request.FILES:
            file = ContentFile(request.FILES[f].read())
            j = json.loads(file.read())

            if not Document.objects.filter(urn=j['urn']).exists():
                Document.objects.create_document(j['urn'], j['title'], j['content'])
        return redirect('/')
    else:
        return HttpResponseForbidden


@login_required
def meta(request, doc_urn):
    pass


@login_required
def to_json(request, doc_urn):
    document = get_object_or_404(Document, urn=doc_urn)
    return JsonResponse({"urn": document.urn, "title": document.title, "content": document.content})

@login_required
def query(request, search_string):
    pass


@login_required
def euler_list(request):    
    doc_list = []
    doc_list.append({"name": "Jahrbuch der MPG 1974", "urn" : "Jahrbuch_der_MPG-1974" })
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1964-1965", "urn" : "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1964-1965"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1958-1960", "urn" : "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1958-1960"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1972-1973", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1972-1973"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1968-1969", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1968-1969"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1966-1967", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1966-1967"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1964-1965", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1964-1965"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1962-1963", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1962-1963"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1961-1962", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1961-1962"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1960-1961", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1960-1961"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1958-1960", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1958-1960"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1956-1958", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1956-1958"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1954-1956", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1954-1956"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1952-1954 Teil 1", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil1"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1952-1954 Teil 2", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil2"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1951-1952", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1951-1952"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1946-51 Teil 1", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil1"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1946-51 Teil 2", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil2"})
    doc_list.append({"name": "Tätigkeitsbericht der MPG 1946-51 Teil 3", "urn" : "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil3"})

    return JsonResponse(doc_list, safe=False)


@login_required
def euler_import(request, doc_urn):
    doc_title = " ".join(doc_urn.split("_"))

    # import document if it not exist otherwise skip import from euler
    if not Document.objects.filter(urn=doc_urn).exists():
        print("not exist")
        # import document from euler
        doc_pages = []
        pn = 1
        while True:
            try:
                cms_url = settings.EULER_URL + u'/hocr?document={0}&pn={1}'.format(doc_urn, pn)
                pn += 1
                response = requests.get(cms_url)
                if response.status_code == 200:
                    doc_pages.append(response.text)
                else:
                    break
            except Exception as e:
                print(e)
                break

        if len(doc_pages) > 0:
            # strip markup
            doc_pages = map(postprocess_content, doc_pages)
            document = Document.objects.create_document(doc_urn, doc_title, ''.join(doc_pages))
    else:
        document = Document.objects.get(urn=doc_urn)

    # import document into workspace
    if document:
        workspace = Workspace.objects.get_workspace(owner=request.user)
        workspace.documents.add(document)

    return JsonResponse({"urn": doc_urn, "title": doc_title})


def postprocess_content(row):
    row = re.sub(r'\n', '', row)
    row = re.sub(r'<\/*span[^>]*?>', '', row)
    return row


# this method fakes the communication to euler
def euler_hocr(request):
    if request.method == 'GET':
        page_number = int(request.GET['pn']) - 1
        local_path = "/Users/administrator/Desktop/jahrbuch74/hocr/hocr/"
        files = os.listdir(local_path)
        if page_number < len(files):
            file = open(local_path + files[page_number])
            soup = BeautifulSoup(file.read())

            page_html = "".join([str(x) for x in soup.body.contents])
            return HttpResponse("<div class='pageContent'>" + page_html + "</div>",
                                content_type="text/plain; charset=utf-8")
        else:
            return Http404()
    else:
        return HttpResponseForbidden()


@login_required
def euler_meta(request, doc_urn):
    pass


@login_required
def euler_query(request, search_string):
    pass