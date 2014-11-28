# coding=utf-8

import os
import json

from django.http import HttpResponse, Http404
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.http import JsonResponse
from documents.models import Document
from neonion.models import Workspace
from bs4 import BeautifulSoup
from django.shortcuts import get_object_or_404, redirect
from django.core.files.base import ContentFile
from operator import itemgetter
from common.cms import Euler


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
@require_POST
def upload(request):
    for f in request.FILES:
        file = ContentFile(request.FILES[f].read())
        # type json

        j = json.loads(file.read())
        if not Document.objects.filter(urn=j['urn']).exists():
            Document.objects.create_document(j['urn'], j['title'], j['content'])

    return redirect('/')


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
    cms = Euler(settings.EULER_URL)
    return JsonResponse(sorted(cms.list(), key=itemgetter('name')), safe=False)


@login_required
def euler_import(request, doc_urn):
    # import document if it not exists otherwise skip import
    if not Document.objects.filter(urn=doc_urn).exists():
        cms = Euler(settings.EULER_URL)
        new_document = cms.get_document(doc_urn)
        document = Document.objects.create_document(doc_urn, new_document['title'], new_document['content'])
    else:
        document = Document.objects.get(urn=doc_urn)

    # import document into workspace
    if document:
        workspace = Workspace.objects.get_workspace(owner=request.user)
        workspace.documents.add(document)

    return JsonResponse({"urn": doc_urn, "title": document.title})


# this method fakes the communication to euler
@require_GET
def euler_hocr(request):
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


@login_required
def euler_meta(request, doc_urn):
    pass


@login_required
def euler_query(request, search_string):
    pass