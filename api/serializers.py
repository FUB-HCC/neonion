from rest_framework import serializers
from accounts.models import User, WorkingGroup, Membership
from documents.models import Document
from neonion.models import Workspace
from annotationsets.models import AnnotationSet, Concept, LinkedConcept


# Serializers for document representation.
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'created', 'updated', 'workinggroup_set')


# Serializer for user representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_active', 'is_superuser', 'membership_set')


# Serializer for memberships representation.
class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ('user', 'group')


# Serializer for working group representation
class WorkingGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingGroup
        fields = ('id', 'name', 'owner', 'members', 'documents')


# Serializer for working group representation
class DetailedWorkingGroupSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True)

    class Meta:
        model = WorkingGroup
        fields = ('id', 'name', 'owner', 'documents')


# Serializers for linked concept representation.
class LinkedConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedConcept
        fields = ('uri', 'label', 'comment', 'linked_type', 'type', 'provider_class')


# Serializers for concept representation.
class ConceptSerializer(serializers.ModelSerializer):
    linked_concepts = LinkedConceptSerializer(many=True)

    class Meta:
        model = Concept
        fields = ('uri', 'label', 'comment', 'additional_type', 'type', 'linked_concepts')


# Serializers for annotation set representation.
class AnnotationSetSerializer(serializers.ModelSerializer):
    concepts = ConceptSerializer(many=True)

    class Meta:
        model = AnnotationSet
        fields = ('uri', 'label', 'comment', 'type', 'concepts')

    def create(self, validated_data):
        return AnnotationSet.objects.create_set(**validated_data)



# Serializers for full document representation representation.
class DetailedDocumentSerializer(DocumentSerializer):
    class Meta:
        model = Document
        fields = ('urn', 'title', 'content', 'created', 'updated')


# Serializers for workspace representation.
class WorkspaceSerializer(serializers.ModelSerializer):
    owner = UserSerializer()
    documents = DocumentSerializer(many=True)
    active_annotationset = AnnotationSetSerializer()

    class Meta:
        model = Workspace
        fields = ('owner', 'documents', 'active_annotationset')
