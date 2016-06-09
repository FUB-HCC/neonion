from documents.models import Document
from annotationsets.models import ConceptSet, Concept, Property, LinkedConcept, LinkedProperty
from rest_framework import viewsets, status
from accounts.models import User, WorkingGroup, Membership
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from api.serializers import UserSerializer, UserDetailedSerializer, WorkingGroupSerializer, \
    ConceptSetSerializer, ConceptSetDeepSerializer, \
    DocumentSerializer, DocumentDetailedSerializer, WorkingGroupDocumentSerializer, ConceptSerializer, \
    PropertySerializer, LinkedConceptSerializer, LinkedPropertySerializer, MembershipSerializer


# ViewSets for document.
class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DocumentDetailedSerializer
        else:
            return DocumentSerializer


# ViewSets for properties.
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer


# ViewSets for concepts.
class ConceptViewSet(viewsets.ModelViewSet):
    queryset = Concept.objects.all()
    serializer_class = ConceptSerializer


# ViewSets for linked concepts.
class LinkedConceptViewSet(viewsets.ModelViewSet):
    queryset = LinkedConcept.objects.all()
    serializer_class = LinkedConceptSerializer


# ViewSets for concept sets.
class ConceptSetViewSet(viewsets.ModelViewSet):
    queryset = ConceptSet.objects.all()

    def get_serializer_class(self):
        # allow a deep serialisation on retrieve
        if self.action == 'retrieve' and 'deep' in self.request.query_params:
            return ConceptSetDeepSerializer
        else:
            return ConceptSetSerializer


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
        serializer = UserDetailedSerializer(request.user)
        return Response(serializer.data)

    @detail_route(methods=['post'])
    def hide_document(self, request, pk, format=None):
        if 'doc_id' in request.data and Document.objects.filter(id=request.data['doc_id']).exists():
            document = Document.objects.get(id=request.data['doc_id'])
            user = User.objects.get(pk=pk)
            user.hide_document(document)

        return Response(status=status.HTTP_200_OK)

    @detail_route(methods=['get'])
    def entitled_documents(self, request, pk):
        user = User.objects.get(pk=pk)
        serializer = WorkingGroupDocumentSerializer(user.entitled_groups(), many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ViewSets for memberships.
class MembershipViewSet(viewsets.ModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer


class WorkingGroupViewSet(viewsets.ModelViewSet):
    queryset = WorkingGroup.objects.all()
    serializer_class = WorkingGroupSerializer

    def create(self, request):
        # create new group where the owner is the current user
        new_group = WorkingGroup.objects.create(owner=self.request.user, **request.data)
        new_group.save()
        # assign owner to group
        self.request.user.join_group(new_group)
        # response
        return Response(self.get_serializer(new_group).data, status=status.HTTP_201_CREATED)
