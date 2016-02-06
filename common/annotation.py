from common.uri import generate_uri
from common.exceptions import InvalidAnnotationError
from common.sparql import insert_data
from common.statements import Annotation
from common.vocab import neonion, OpenAnnotation
from django.utils.deconstruct import deconstructible
from django.utils.translation import ugettext_lazy as _


@deconstructible
class SemanticAnnotationValidator(object):

    def __init__(self):
        self.message = _('Ensure this annotation has semantic content.')
        self.code = 'invalid'

    def __call__(self, annotation):
        throw_error = False
        if self.has_motivation_field(annotation):
            if self.has_body_field(annotation):
                # check the motivation
                if (motivation_equals(annotation, OpenAnnotation.Motivations.classifying) or
                        motivation_equals(annotation, OpenAnnotation.Motivations.identifying)):
                    throw_error = not self.has_instance_mandatory_fields(annotation)
                elif motivation_equals(annotation, OpenAnnotation.Motivations.linking):
                    throw_error = not self.has_relation_mandatory_fields(annotation)
            else:
                # only highlights do not need a body
                throw_error = not motivation_equals(annotation, OpenAnnotation.Motivations.highlighting)
        else:
            throw_error = True

        if throw_error:
            raise InvalidAnnotationError(self.message, code=self.code, params=annotation)

    def __eq__(self, other):
        return (
            isinstance(other, self.__class__)
            and (self.message == other.message)
            and (self.code == other.code)
        )

    @classmethod
    def has_motivation_field(cls, annotation):
        return 'oa' in annotation and 'motivatedBy' in annotation['oa']

    @classmethod
    def has_body_field(cls, annotation):
        return 'oa' in annotation and 'hasBody' in annotation['oa'] and '@type' in annotation['oa']['hasBody']

    @classmethod
    def has_instance_mandatory_fields(cls, annotation):
        # classifying and identifying motivated annotations has the body type semanticTag
        return (OpenAnnotation.TagTypes.semanticTag.value in annotation['oa']['hasBody']['@type'] and
            "neo:Instance" in annotation['oa']['hasBody']['@type'] and
            "instanceOf" in annotation['oa']['hasBody'] and
            "label" in annotation['oa']['hasBody'])

    @classmethod
    def has_relation_mandatory_fields(cls, annotation):
        # linking has the body type semanticTag
        return (OpenAnnotation.TagTypes.semanticTag.value in annotation['oa']['hasBody']['@type'] and
            "neo:Relation" in annotation['oa']['hasBody']['@type'])


def endpoint_create_annotation(validated_annotation):
    # extract data from annotation and insert in triple store
    if (motivation_equals(validated_annotation, OpenAnnotation.Motivations.identifying) or
            motivation_equals(validated_annotation, OpenAnnotation.Motivations.classifying)):
        insert_data(Annotation.statement_about_resource(validated_annotation))

    return validated_annotation


def motivation_equals(annotation, motivation):
    return annotation['oa']['motivatedBy'] == motivation.value


def add_resource_uri(validated_annotation):
    uri = generate_uri(validated_annotation['oa']['hasBody']['instanceOf'], validated_annotation['oa']['hasBody']['label'])
    if uri is not None:
        validated_annotation['oa']['hasBody']['references'] = uri

    return validated_annotation


def add_creator(validated_annotation, mail):
    if 'neonion' in validated_annotation:
        validated_annotation['neonion']['creator'] = mail

    # add user to annotation
    if 'oa' in validated_annotation and 'annotatedBy' in validated_annotation['oa']:
        validated_annotation['oa']['annotatedBy']['@id'] = generate_uri(neonion.USER, mail)
        validated_annotation['oa']['annotatedBy']['mbox'] = { '@id': 'mailto:' + mail }

    return validated_annotation