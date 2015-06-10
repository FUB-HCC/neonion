from rest_framework import serializers
from accounts.models import User, WorkingGroup, Membership
from documents.models import Document, File
from annotationsets.models import AnnotationSet, Concept, LinkedConcept


# Serializers for file representation.
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'name', 'origin_url', 'content_type')


# Serializers for document representation.
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('id', 'title', 'created', 'updated', 'workinggroup_set')


# Serializers for full document representation representation.
class DocumentDetailedSerializer(DocumentSerializer):
    attached_file = FileSerializer()

    class Meta:
        model = Document
        fields = ('id', 'title', 'created', 'updated', 'attached_file', 'workinggroup_set')


# Serializer for user representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_superuser')


# Serializer for user representation.
class UserDetailedSerializer(serializers.ModelSerializer):
    owned_documents = DocumentSerializer(many=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'is_active', 'is_superuser', 'membership_set', 'owned_documents')


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
class WorkingGroupDocumentSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True)

    class Meta:
        model = WorkingGroup
        fields = ('id', 'name', 'documents')


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
