from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_GET
from django.http import JsonResponse
from django.http import HttpResponse
from documents.models import Document, File
from django.shortcuts import redirect
from django.shortcuts import render_to_response
from django.shortcuts import get_object_or_404
from django.utils.html import escape
import requests
from logging.signals import log_document_metadata_request_error


@login_required
@require_POST
def upload_file(request):
    document_properties = {}
    document_fields = ["title", "creator", "type", "contributor", "coverage", "description", "format", "identifier",
                       "language", "publisher", "relation", "rights", "source", "subject", "concept_set"]

    for m in document_fields:
        document_properties[m] = request.POST.get(m, None)  # fetches value or provides default if it does not exist

    for upload_field in request.FILES:
        errors = [];
        for f in request.FILES.getlist(upload_field):
            if not document_properties['title']:
                errors.append("Missing Title for Document")
            if not document_properties['creator']:
                errors.append("Missing Creator for Document")
            if not document_properties['type']:
                errors.append("Missing Type for Document")
            if errors == []:
                document = Document.objects.create_document_from_file(f, **document_properties)
                document.save()
 
                if document is not None:
                    # import document into workspace
                    request.user.owned_documents.add(document)
            else:
                return render_to_response('base_import.html',{'form' : document_properties,'errors' : errors})

    return redirect('/')

@login_required
@require_POST
def modify_document(request,document_pk):
    document_properties = {}
    document_fields = ["title", "creator", "type", "contributor", "coverage", "description", "format", "identifier",
                       "language", "publisher", "relation", "rights", "source", "subject"]

    for m in document_fields:
        document_properties[m] = request.POST.get(m, None)  # fetches value or provides default if it does not exist

    errors = [];
    if not document_properties['title']:
        errors.append("Missing Title for Document")
    if not document_properties['creator']:
        errors.append("Missing Creator for Document")
    if not document_properties['type']:
        errors.append("Missing Type for Document")
    if errors == []:
        if Document.objects.filter(id=document_pk).exists():
            document = Document.objects.get(id=document_pk)
            document.title = document_properties['title']
            #attached_file = models.OneToOneField(File, null=True)
            document.creator = document_properties['creator']
            document.type = document_properties['type']
            document.contributor = document_properties['contributor']
            document.coverage = document_properties['coverage']
            ### TODO
            ### date = models.DateTimeField('date', default='', null=True, blank=True)
            document.description = document_properties['description']
            document.format = document_properties['format']
            document.identifier = document_properties['identifier']
            document.language = document_properties['language']
            document.publisher = document_properties['publisher']
            document.relation = document_properties['relation']
            document.rights = document_properties['rights']
            document.source = document_properties['source']
            document.subject = document_properties['subject']
            #created = models.DateTimeField(auto_now_add=True)
            #updated = models.DateTimeField(auto_now=True)
            document.save()
    else:
        return render_to_response('base_modify.html',{'form' : document_properties,'errors' : errors})

    return redirect('/')

@require_GET
def search_metadata(request, title):
    try:
        result = requests.get('http://api.crossref.org/works?query.title='+title,timeout=10).json()
        document = result['message']['items'][0]
        return JsonResponse(document)
    except requests.Timeout as e:
        #Logging
        log_document_metadata_request_error('TIMEOUT: Failed to request metadata from api.crossref.org')
        return JsonResponse({"error":"Timeout"})
    except requests.ConnectionError as e:	
        log_document_metadata_request_error('CONERROR: Failed to connect to api.crossref.org')
        return JsonResponse({"error":"Connection Error"})

@login_required
@require_GET
def viewer(request, pk):
    f = get_object_or_404(File, pk=pk)
    # return raw data
    return HttpResponse(str(f.raw_data), content_type=f.content_type + '; charset=utf-8')
