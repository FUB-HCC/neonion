from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required


# Create your views here.
# @login_required
def home(request):
    return render_to_response('base_overview.html', {}, context_instance=RequestContext(request))

# @login_required
def annotator(request, doc_id):
    return render_to_response('base_annotator.html', { "doc_id" : doc_id }, context_instance=RequestContext(request))

# @login_required
def import_document(request):
    return render_to_response('base_import.html', { }, context_instance=RequestContext(request))
