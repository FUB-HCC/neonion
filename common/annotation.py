from django.core.exceptions import ValidationError
from common.uri import generate_uri
from exceptions import NoConceptAnnotationError
from common.sparql import insert_data
from common.statements import Annotation
from common.exceptions import InvalidResourceTypeError
from common.vocab import OpenAnnotation
from django.utils.deconstruct import deconstructible
from django.utils.translation import ugettext_lazy as _


@deconstructible
class SemanticAnnotationValidator(object):
    message = _('Ensure this annotation has semantic content.'),
    code = 'invalid'

    def __init__(self, message=None):
        if message:
            self.message = message

    def __call__(self, annotation):
        if not ('oa' in annotation and 'hasBody' in annotation['oa']):
            raise ValidationError(self.message, code=self.code, params=annotation)

    def __eq__(self, other):
        return (
            isinstance(other, self.__class__)
            and (self.message == other.message)
            and (self.code == other.code)
        )


def pre_process_annotation(annotation):
    try:
        if get_body_type(annotation) == OpenAnnotation.TagTypes.semanticTag.value:
            try:
                add_resource_uri(annotation)
            except InvalidResourceTypeError:
                pass
    except ValidationError:
        pass


def post_process_annotation(annotation):
    # extract data from annotation and insert in triple store
    try:
        # print(Annotation.create_annotation_statement(annotation))
        # insert_data(Annotation.create_annotation_statement(annotation))
        if get_body_type(annotation) == OpenAnnotation.TagTypes.semanticTag.value:
            insert_data(Annotation.statement_about_resource(annotation))
    except Exception as e:
        print(e.message)


def get_body_type(annotation):
    if SemanticAnnotationValidator(annotation) and 'type' in annotation['oa']['hasBody']:
        return annotation['oa']['hasBody']['type']
    else:
        return None


def get_motivation(annotation):
    if SemanticAnnotationValidator(annotation) and 'motivation' in annotation['oa']:
        return annotation['oa']['motivation']
    else:
        return None


def add_resource_uri(annotation):
    if 'rdf' in annotation:
        if 'uri' not in annotation['rdf']:
            uri = generate_uri(annotation['rdf']['typeof'], annotation['rdf']['label'])
            if uri is not None:
                annotation['rdf']['uri'] = uri
    else:
        raise NoConceptAnnotationError(annotation)

    return annotation
