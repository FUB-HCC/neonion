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
from django.shortcuts import redirect
from django.core.files.base import ContentFile
from operator import itemgetter
from os.path import splitext, basename


@login_required
def meta(request, doc_urn):
    pass


@login_required
def query(request, search_string):
    pass


@login_required
def cms_list(request):
    # instantiate CMS provider
    modulepath, classname = settings.CONTENT_SYSTEM_CLASS.rsplit('.', 1)
    module = __import__(modulepath, fromlist=[classname])
    cms = getattr(module, classname)()

    return JsonResponse(sorted(cms.list(), key=itemgetter('name')), safe=False)


@login_required
@require_POST
def upload_file(request):
    for f in request.FILES:
        create_new_doc = False

        if request.FILES[f].content_type == 'application/json':
            uploaded_file = ContentFile(request.FILES[f].read())
            j = json.loads(uploaded_file.read())
            doc_urn = j['urn']
            doc_title = j['title']
            doc_content = j['content']

            create_new_doc = True
        elif request.FILES[f].content_type == 'text/plain':
            doc_title = str('_'.join(splitext(basename(request.FILES[f].name))[0].split()))
            doc_urn = doc_title.encode('string_escape', 'ignore')

            # read plain text content
            content = []
            for chunk in request.FILES[f].chunks():
                content.append(chunk)
            doc_content = ''.join(content)

            create_new_doc = True

        if create_new_doc:
            if not Document.objects.filter(urn=doc_urn).exists():
                document = Document.objects.create_document(doc_urn, doc_title, doc_content)
            else:
                document = Document.objects.get(urn=doc_urn)

            # import document into workspace
            workspace = Workspace.objects.get_workspace(owner=request.user)
            workspace.documents.add(document)

    return redirect('/')


@login_required
def cms_import(request, doc_urn):
    # import document if it not exists otherwise skip import
    if not Document.objects.filter(urn=doc_urn).exists():
        # instantiate CMS provider
        modulepath, classname = settings.CONTENT_SYSTEM_CLASS.rsplit('.', 1)
        module = __import__(modulepath, fromlist=[classname])
        cms = getattr(module, classname)()

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