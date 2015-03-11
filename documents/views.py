import uuid
import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from documents.models import Document
from django.shortcuts import redirect
from django.core.files.base import ContentFile
from operator import itemgetter
from os.path import splitext, basename
from common.cms import instantiate_provider


@login_required
@require_POST
def upload_file(request):
    TEXT_TYPES = [
        'text/plain',
        'text/html',
    ]
    for f in request.FILES:
        create_new_doc = False

        if request.FILES[f].content_type == 'application/json':
            uploaded_file = ContentFile(request.FILES[f].read())
            j = json.loads(uploaded_file.read())
            doc_id = j['id']
            doc_title = j['title']
            doc_content = j['content']

            create_new_doc = True
        elif request.FILES[f].content_type in TEXT_TYPES:
            file_name = request.FILES[f].name.encode('utf-8')
            doc_title = str(' '.join(splitext(basename(file_name))[0].split()))
            doc_id = uuid.uuid1().hex
            print(doc_title + "   " + doc_id)
            # read plain text content
            content = []
            for chunk in request.FILES[f].chunks():
                content.append(chunk)
            doc_content = ''.join(content)

            create_new_doc = True

        if create_new_doc:
            if not Document.objects.filter(id=doc_id).exists():
                document = Document.objects.create_document(doc_id, doc_title, doc_content)
            else:
                document = Document.objects.get(id=doc_id)

            # import document into workspace
            request.user.owned_documents.add(document)

    return redirect('/')


@login_required
def cms_list(request):
    cms = instantiate_provider(settings.CONTENT_SYSTEM_CLASS)
    return JsonResponse(sorted(cms.list(), key=itemgetter('name')), safe=False)


@login_required
@require_POST
def cms_import(request):
    data = json.loads(request.body)
    for doc_id in data['documents']:
        # import document if it not exists otherwise skip import
        if not Document.objects.filter(id=doc_id).exists():
            cms = instantiate_provider(settings.CONTENT_SYSTEM_CLASS)

            new_document = cms.get_document(doc_id)
            document = Document.objects.create_document(doc_id, new_document['title'], new_document['content'])
        else:
            document = Document.objects.get(id=doc_id)

        # import document into workspace
        request.user.owned_documents.add(document)

    return JsonResponse({})