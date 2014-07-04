from django.shortcuts import render_to_response
from django.template import RequestContext

# Create your views here.
def home(request):
    return render_to_response('base_overview.html', {}, context_instance=RequestContext(request))

def annotator(request, doc_id):
    return render_to_response('base_annotator.html', { "doc_id" : doc_id }, context_instance=RequestContext(request))