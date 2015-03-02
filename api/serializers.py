from rest_framework import serializers
from accounts.models import User
from documents.models import Document
from neonion.models import Workspace
from annotationsets.models import AnnotationSet, Concept, LinkedConcept, AnnotationSetManager
from django.contrib.auth.models import Group


# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_active', 'is_superuser', 'groups')


class GroupSerializer(serializers.ModelSerializer):
    #user_set = GroupMemberSerializer(many=True)

    class Meta:
        model = Group
        fields = ('id', 'name', 'user_set')


# Serializers define the API representation.
class LinkedConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedConcept
        fields = ('uri', 'label', 'comment', 'linked_type', 'type', 'provider_class')


# Serializers define the API representation.
class ConceptSerializer(serializers.ModelSerializer):
    linked_concepts = LinkedConceptSerializer(many=True)

    class Meta:
        model = Concept
        fields = ('uri', 'label', 'comment', 'additional_type', 'type', 'linked_concepts')


# Serializers define the API representation.
class AnnotationSetSerializer(serializers.ModelSerializer):
    concepts = ConceptSerializer(many=True)

    class Meta:
        model = AnnotationSet
        fields = ('uri', 'label', 'comment', 'type', 'concepts')

    def create(self, validated_data):
        return AnnotationSet.objects.create_set(**validated_data)


# Serializers define the API representation.
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'created', 'updated')


# Serializers define the API representation.
class DetailedDocumentSerializer(DocumentSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'content', 'created', 'updated')


# Serializers define the API representation.
class WorkspaceSerializer(serializers.HyperlinkedModelSerializer):
    owner = UserSerializer()
    documents = DocumentSerializer(many=True)
    active_annotationset = AnnotationSetSerializer()

    class Meta:
        model = Workspace
        fields = ('owner', 'documents', 'active_annotationset')
