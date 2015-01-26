from rest_framework import status
from documents.models import Document
from neonion.models import Workspace
from api.serializers import DocumentSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

class WorkspaceDocumentList(APIView):

    def get(self, request, format=None):
        workspace = Workspace.objects.get_workspace(owner=request.user)
        serializer = DocumentSerializer(workspace.documents.all(), many=True)
        return Response(serializer.data)

    def delete(self, request, pk, format=None):
        if Document.objects.filter(urn=pk).exists():
            document = Document.objects.get(urn=pk)
            workspace = Workspace.objects.get_workspace(owner=request.user)

            with transaction.atomic():
                workspace.hidden_documents.add(document)
                workspace.documents.remove(document)

        return Response(status=status.HTTP_204_NO_CONTENT)

