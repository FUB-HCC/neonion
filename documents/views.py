import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse, HttpResponse
from documents.models import Document, File
from django.shortcuts import redirect
from operator import itemgetter
from common.cms import instantiate_provider
from django.shortcuts import get_object_or_404


@login_required
@require_POST
def upload_file(request):
    docProperties = {}
    docModels = ["creator", "type", "contributor", "coverage", "description", "format", "identifier",
                 "language", "publisher", "relation", "rights", "source", "subject"]

    for m in docModels:
        docProperties[m] = request.POST.get(m, None)        # fetches value or provides default if it does not exist

    for upload_field in request.FILES:
        for f in request.FILES.getlist(upload_field):
            document = Document.objects.create_document_from_file(f, **docProperties)
            document.save()
 
            if document is not None:
                # import document into workspace
                request.user.owned_documents.add(document)

    return redirect('/')


@login_required
@require_GET
def viewer(request, pk):
    f = get_object_or_404(File, pk=pk)
    # return raw data
    return HttpResponse(str(f.raw_data), content_type=f.content_type + '; charset=utf-8')


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
            document = Document.objects.create_document(doc_id, new_document['title'], new_document['content'], )
        else:
            document = Document.objects.get(id=doc_id)

        # import document into workspace
        request.user.owned_documents.add(document)

    return JsonResponse({})