from django.http import HttpResponseBadRequest
from django.conf import settings
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from documents.models import Document
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from common.knowledge.provider import Provider


# Create your views here.
@login_required
def render_home(request):
    return render_to_response('workspace.html', context_instance=RequestContext(request))


@login_required
def render_annotator(request, doc_id):
    doc = get_object_or_404(Document, id=doc_id)

    data = {
        'doc_id': doc_id,
        'title': doc.title,
        'content': doc.content,
        'ner_url': settings.NER_SERVICE_URL,
        'ner_auth': 'WCZZYjnOQFUYfJIN2ShH1iD24UHo58A6TI'
    }
    return render_to_response('annotator.html', data, context_instance=RequestContext(request))


@login_required
def my_annotations(request):
    return render_to_response('base_my_annotations.html', context_instance=RequestContext(request))


@login_required
def annotations_occurrences(request, quote):
    data = {'annotation': quote}
    return render_to_response('base_annotations_occurrences.html', data, context_instance=RequestContext(request))


@login_required
def ann_documents(request, quote):
    data = {'annotation': quote}
    return render_to_response('base_annotations_documents.html', data, context_instance=RequestContext(request))


@login_required
def render_settings(request):
    return render_to_response('base_settings.html', context_instance=RequestContext(request))


@login_required
def accounts_management(request):
    return render_to_response('accounts_management.html', context_instance=RequestContext(request))


@login_required
def render_query(request):
    return render_to_response('query.html', {'endpoint': settings.ENDPOINT}, context_instance=RequestContext(request))


@login_required
def import_document(request):
    data = {}
    if hasattr(settings, 'CONTENT_SYSTEM_CLASS'):
        data['use_file_upload'] = False
    else:
        data['use_file_upload'] = True

    return render_to_response('base_import.html', data, context_instance=RequestContext(request))


@login_required
@require_GET
def resource_search(request):
    if 'type' in request.GET and 'q' in request.GET:
        resource_type = request.GET.get('type')
        # extract from resource type
        search_type = resource_type.rstrip('/').rsplit('/', 1)[1]
        search_term = request.GET.get('q')
        if search_term:
            # call search method from provider
            provider = Provider(settings.ELASTICSEARCH_URL)
            result_set = provider.search(search_term, search_type)['hits']['hits']
            result_set = map(lambda item: item['_source'], result_set)
        else:
            result_set = []

        return JsonResponse(result_set, safe=False)
    else:
        return HttpResponseBadRequest()
