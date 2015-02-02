import requests

from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from documents.models import Document
from neonion.models import Workspace
from api.serializers import DocumentSerializer
from rest_framework.response import Response
from django.db import transaction
from rest_framework.views import APIView
from common import uri


class WorkspaceDocumentList(APIView):
    def get(self, request, format=None):
        workspace = Workspace.objects.get_workspace(owner=request.user)
        serializer = DocumentSerializer(workspace.documents.all(), many=True)
        return Response(serializer.data)

    def post(self, request, pk, format=None):
        if Document.objects.filter(urn=pk).exists():
            document = Document.objects.get(urn=pk)
            workspace = Workspace.objects.get_workspace(owner=request.user)

            with transaction.atomic():
                workspace.documents.add(document)
                workspace.hidden_documents.remove(document)

            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk, format=None):
        if Document.objects.filter(urn=pk).exists():
            document = Document.objects.get(urn=pk)
            workspace = Workspace.objects.get_workspace(owner=request.user)

            with transaction.atomic():
                workspace.hidden_documents.add(document)
                workspace.documents.remove(document)

        return Response(status=status.HTTP_204_NO_CONTENT)


class AnnotationListView(APIView):
    def get(self, request, format=None):
        """Returns a list of all annotations"""
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations')
        return JsonResponse(response.json(), safe=False)

    def post(self, request, format=None):
        """Creates a new annotation"""
        # TODO get or create URI according type of resource and attach it to the annotation object
        headers = {'content-type': 'application/json'}
        response = requests.post(settings.ANNOTATION_STORE_URL + '/annotations',
                                 data=request.body, headers=headers)
        return JsonResponse(response.json(), status=201, safe=False)


class AnnotationDetailView(APIView):
    def get(self, request, pk, format=None):
        """Returns the specified annotation object"""
        response = requests.get(settings.ANNOTATION_STORE_URL + '/annotations/' + pk)
        return JsonResponse(response.json(), safe=False)

    def put(self, request, pk, format=None):
        """Updates the specified annotation object"""
        headers = {'content-type': 'application/json'}
        response = requests.put(settings.ANNOTATION_STORE_URL + '/annotations/' + pk,
                                data=request.body, headers=headers)
        return JsonResponse(response.json(), safe=False)

    def delete(self, request, pk, format=None):
        """Deletes the specified annotation object"""
        response = requests.delete(settings.ANNOTATION_STORE_URL + '/annotations/' + pk)
        return JsonResponse(response.json(), safe=False, status=204)


@api_view(["GET"])
def store_root(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/')
    return JsonResponse(response.json(), safe=False)


@api_view(["GET"])
def store_filter_annotations(request):
    response = requests.get(settings.ANNOTATION_STORE_URL + '/search?creator.email=' + request.user.email)
    return JsonResponse(response.json(), safe=False)


@api_view(["GET"])
def store_search(request):
    ##print(request.GET.urlencode())
    response = requests.get(settings.ANNOTATION_STORE_URL + '/search?' + request.GET.urlencode())
    return JsonResponse(response.json(), safe=False)


# TEST uri
def generate_uri(request, type, name):
    return JsonResponse({
        'uri': uri.generate_uri(resource_type=type, name=name),
        'label': name,
        'type': type
    })