from neonion.models import Workspace
from rest_framework.decorators import api_view
from api.urls import WorkspaceSerializer
from django.contrib.auth.decorators import login_required
from rest_framework.response import Response


@api_view(['GET'])
@login_required
def personal_workspace(request):
    workspace = Workspace.objects.get_workspace(owner=request.user)
    serializer = WorkspaceSerializer(workspace)
    return Response(serializer.data)