from rest_framework import serializers
from accounts.models import User, WorkingGroup, Membership
from documents.models import Document, File
from annotationsets.models import ConceptSet, Concept, LinkedConcept, Property, LinkedProperty


# Serializers for file representation.
class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'name', 'origin_url', 'content_type')


# Serializers for document representation.
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ('id', 'uri', 'title', 'created', 'updated', 'workinggroup_set')


# Serializers for full document representation representation.
class DocumentDetailedSerializer(DocumentSerializer):
    attached_file = FileSerializer()

    class Meta:
        model = Document
        fields = ('id', 'uri', 'title', 'created', 'updated', 'attached_file', 'workinggroup_set')


# Serializer for user representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_active', 'is_staff', 'is_superuser')


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
        fields = ('id', 'user', 'group', 'invite_reason')


# Serializer for working group representation
class WorkingGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingGroup
<<<<<<< HEAD
        fields = ('id', 'name', 'owner', 'members', 'documents')
=======
        fields = ('id', 'name', 'owner', 'members', 'documents', 'concept_set')
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8
        read_only_fields = ('owner', 'members')


# Serializer for working group representation
class WorkingGroupDocumentSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True)

    class Meta:
        model = WorkingGroup
        fields = ('id', 'name', 'documents')


# Serializers for linked concept representation.
class LinkedPropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedProperty
        fields = ('id', 'uri', 'label', 'comment', 'linked_property')


# Serializers for concept representation.
class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = ('id', 'uri', 'label', 'comment', 'inverse_property', 'range', 'linked_properties')


# Serializers for linked concept representation.
class LinkedConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedConcept
        fields = ('id', 'uri', 'label', 'comment', 'endpoint', 'linked_type',
                  'custom_query', 'provider_class', 'retrieved_at')
        read_only_fields = ('retrieved_at',)


# Serializers for concept representation.
class ConceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concept
        fields = ('id', 'uri', 'label', 'comment', 'properties', 'linked_concepts')


# Serializers for concept set representation.
class ConceptSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConceptSet
        fields = ('id', 'uri', 'label', 'comment', 'concepts')


# Serializers for a detailed concept set representation.
class ConceptSetDeepSerializer(serializers.ModelSerializer):

    class ConceptDeepSerializer(ConceptSerializer):
        properties = PropertySerializer(many=True)
        linked_concepts = LinkedConceptSerializer(many=True)

        class Meta:
            model = Concept
            fields = ('id', 'uri', 'label', 'comment', 'properties', 'linked_concepts')

    concepts = ConceptDeepSerializer(many=True)

    class Meta:
        model = ConceptSet
        fields = ('id', 'uri', 'label', 'comment', 'concepts')
        read_only_fields = ('id', 'uri', 'label', 'comment', 'concepts')
