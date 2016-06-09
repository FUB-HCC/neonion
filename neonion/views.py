from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from documents.models import Document
from django.shortcuts import get_object_or_404


# Create your views here.
@login_required
def render_home(request):
    return render_to_response('workspace.html', context_instance=RequestContext(request))


@login_required
def render_annotator(request, group_pk, document_pk):
    get_object_or_404(Document, id=document_pk)

    data = {
        'group_pk': group_pk,
        'document_pk': document_pk,
    }
    return render_to_response('annotator.html', data, context_instance=RequestContext(request))


@login_required
def annotations(request):
    return render_to_response('base_annotations.html', context_instance=RequestContext(request))


@login_required
def annotation_occurrences(request):
    return render_to_response('base_annotations_occurrences.html', context_instance=RequestContext(request))


@login_required
def annotation_documents(request):
    return render_to_response('base_annotations_documents.html', context_instance=RequestContext(request))


@login_required
def render_vocabulary(request):
    return render_to_response('base_vocabulary.html', context_instance=RequestContext(request))


@login_required
def render_settings(request):
    return render_to_response('base_settings.html', context_instance=RequestContext(request))


@login_required
def accounts_management(request):
    return render_to_response('accounts_management.html', context_instance=RequestContext(request))


@login_required
def render_query(request):
    return render_to_response('query.html', context_instance=RequestContext(request))


@login_required
def render_workbench(request):
    return render_to_response('workbench.html', context_instance=RequestContext(request))


@login_required
def import_document(request):
    return render_to_response('base_import.html', context_instance=RequestContext(request))

