from django.http import HttpResponseForbidden
from documents.models import Document
from annotationsets.models import AnnotationSet
from rest_framework import viewsets, status
from accounts.models import User, WorkingGroup, Membership
from django.db import transaction
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from api.serializers import UserSerializer, UserDetailedSerializer, WorkingGroupSerializer, AnnotationSetSerializer, \
    DocumentSerializer, DetailedDocumentSerializer, WorkingGroupDocumentSerializer


# ViewSets for document.
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DetailedDocumentSerializer
        else:
            return DocumentSerializer


# ViewSets for annotation sets.
class AnnotationSetViewSet(viewsets.ModelViewSet):
    queryset = AnnotationSet.objects.all()
    serializer_class = AnnotationSetSerializer


# ViewSets for users.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailedSerializer
        else:
            return UserSerializer

    @list_route(methods=['get'])
    def current(self, request, format=None):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @detail_route(methods=['post'])
    def hide_document(self, request, pk, format=None):
        if 'doc_id' in request.POST and Document.objects.filter(id=request.POST['doc_id']).exists():
            document = Document.objects.get(urn=request.POST['doc_id'])
            user = User.objects.get(pk=pk)

            with transaction.atomic():
                user.hidden_documents.add(document)
                user.owned_documents.remove(document)

        return Response(status=status.HTTP_200_OK)

    @detail_route(methods=['get'])
    def documents_by_group(self, request, pk):
        user = User.objects.get(pk=pk)
        serializer = WorkingGroupDocumentSerializer(user.groups.all(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WorkingGroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WorkingGroup.objects.all()
    serializer_class = WorkingGroupSerializer

    @list_route(methods=['post'])
    def create_group(self, request):
        # create new group where the owner is the current user
        group = WorkingGroup.objects.create(owner=self.request.user, **request.data)
        group.save()
        # assign owner to group
        membership = Membership.objects.create(user=self.request.user, group=group)
        membership.save()
        # response
        return Response(self.get_serializer(group).data, status=status.HTTP_201_CREATED)

    @detail_route(methods=['post'])
    def rename_group(self, request, pk):
        # get group
        group = WorkingGroup.objects.get(pk=pk)
        if self.request.user.is_superuser or group.owner == self.request.user:
            group.name = request.data['name']
            group.save()
            return Response(self.get_serializer(group).data, status=status.HTTP_204_NO_CONTENT)
        else:
            return HttpResponseForbidden()

    @detail_route(methods=['delete'])
    def delete_group(self, request, pk):
        # get group
        group = WorkingGroup.objects.get(pk=pk)
        if self.request.user.is_superuser or group.owner == self.request.user:
            group.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return HttpResponseForbidden()

    @detail_route(methods=['post'])
    def add_member(self, request, pk):
        # get group
        group = WorkingGroup.objects.get(pk=pk)
        if self.request.user.is_superuser or group.owner == self.request.user:
            user = User.objects.get(pk=request.data['id'])
            membership = Membership.objects.create(user=user, group=group)
            membership.save()
            return Response(self.get_serializer(group).data, status=status.HTTP_200_OK)
        else:
            return HttpResponseForbidden()

    @detail_route(methods=['post'])
    def remove_member(self, request, pk):
        # get group
        group = WorkingGroup.objects.get(pk=pk)
        if self.request.user.is_superuser or group.owner == self.request.user:
            user = User.objects.get(pk=request.data['id'])
            if group.owner is not user:
                membership = Membership.objects.get(user=user, group=group)
                membership.delete()
            return Response(self.get_serializer(group).data, status=status.HTTP_200_OK)
        else:
            return HttpResponseForbidden()

    @detail_route(methods=['post'])
    def add_document(self, request, pk):
        # get group
        group = WorkingGroup.objects.get(pk=pk)
        if self.request.user.is_superuser or group.owner == self.request.user:
            document = Document.objects.get(pk=request.data['urn'])
            group.documents.add(document)
            group.save()
            return Response(self.get_serializer(group).data, status=status.HTTP_200_OK)
        else:
            return HttpResponseForbidden()

    @detail_route(methods=['post'])
    def remove_document(self, request, pk):
        # get group
        group = WorkingGroup.objects.get(pk=pk)
        if self.request.user.is_superuser or group.owner == self.request.user:
            document = Document.objects.get(pk=request.data['urn'])
            group.documents.remove(document)
            group.save()
            return Response(self.get_serializer(group).data, status=status.HTTP_200_OK)
        else:
            return HttpResponseForbidden()
