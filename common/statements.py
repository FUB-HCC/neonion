from exceptions import NoConceptAnnotationError
from common.vocab import OpenAnnotation, neonion

DEFAULT_PREFIXES = '''PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>
PREFIX owl:<http://www.w3.org/2002/07/owl#>
PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX sesame:<http://www.openrdf.org/schema/sesame#>
PREFIX fn:<http://www.w3.org/2005/xpath-functions#>
PREFIX oa:<http://www.w3.org/ns/oa#>
PREFIX cnt:<http://www.w3.org/2011/content#>
PREFIX dc:<http://purl.org/dc/elements/1.1/>
PREFIX dcterms:<http://purl.org/dc/terms/>
PREFIX dctypes:<http://purl.org/dc/dcmitype/>
PREFIX foaf:<http://xmlns.com/foaf/0.1/>
PREFIX prov:<http://www.w3.org/ns/prov#>
PREFIX skos:<http://www.w3.org/2004/02/skos/core#>
PREFIX trig:<http://www.w3.org/2004/03/trix/rdfg-1/>
'''


class Annotation:

    @staticmethod
    def create_annotation_statement(annotation):
        if 'oa' in annotation:
            oa = annotation['oa']
            target = oa['hasTarget']
            body = oa['hasBody']
            annBy = oa['annotatedBy']

            # add preamble
            query = DEFAULT_PREFIXES + u'\nINSERT DATA {\n'

            # http://www.w3.org/TR/sparql11-update/#updateLanguage
            query += u'GRAPH <{}>'.format(neonion.ANNOTATION_STORE_GRAPH)
            query += u' {\n'

            # general statement about annotation according to OA
            # add target property
            query += u'\n"{}" oa:hasTarget <{}>;'.format(annotation['uri'], target['type'])

            # add body property if existing
            if 'hasBody' in annotation['oa']:

                # add body property
                query += u'\noa:hasBody "{}";'.format(body['type'])

                # for semantic annotation
                if body['type'] == OpenAnnotation.TagTypes.semanticTag.value:
                    query += Annotation.substatement_body_semantic_tag(annotation)

                # for free text annotation
                elif body['type'] == OpenAnnotation.TagTypes.tag.value:
                    query += Annotation.substatement_body_tag(annotation)

            # free text specific
            if 'rdf' not in annotation:
                query += u'\noa:motivatedBy "{}";'.format('oa:commenting')
                query += u'\nrdfs:comment "{}";'.format(annotation['text'])
            else:
                # add identifying/commenting motivation property
                query += u'\noa:motivatedBy "{}";'.format(oa['motivatedBy'])

            # add origin (creator)
            query += u'\noa:annotatedBy "{}".'.format(annBy['email'])

            # add type of annotatedBy
            query += u'\n"{}" rdf:type "{}";'.format(annBy['email'], annBy['type'])

            # add id of annotatedBy
            query += u'\nfoaf:openid "{}";'.format(annBy['id'])

            # add email of annotatedBy
            query += u'\nfoaf:mbox "{}"'.format(annBy['email'])

            # end of statement
            query += u'.\n}\n}'

            return query
        else:
            raise NoConceptAnnotationError(annotation)

    @staticmethod
    def delete_annotation_statement(annotation):
        # TODO formulate statement
        if 'oa' in annotation:
            return ''
        else:
            raise NoConceptAnnotationError(annotation)

    @staticmethod
    def substatement_body_tag(annotation):
        # TODO serialize free text
        if 'oa' in annotation:
            return ''
        else:
            raise NoConceptAnnotationError(annotation)

    @staticmethod
    def substatement_body_semantic_tag(annotation):
        # TODO serialize something
        if 'oa' in annotation:
            return ''
        else:
            raise NoConceptAnnotationError(annotation)

    @staticmethod
    def statement_about_resource(annotation):
        if 'oa' in annotation and 'rdf' in annotation:
            rdf = annotation['rdf']

            # add prefixes and insert preamble
            query = DEFAULT_PREFIXES + u'\nINSERT DATA {'
            # add type property
            query += u'\n<{}> rdf:type <{}>;'.format(rdf['uri'], rdf['typeof'])
            # add label property
            query += u'\nrdfs:label "{}";'.format(rdf['label'])

            if 'sameAs' in rdf:
                # add sameAs relation
                query += u'\nowl:sameAs <{}>;'.format(rdf['sameAs'])

            # add end of statement
            query += u'.\n}'

            return query
        else:
            raise NoConceptAnnotationError(annotation)

def metadata_statement(document):
    document_uri = "http://neonion.org/document/" + document.id

    # add prefixes and insert preamble
    query = DEFAULT_PREFIXES + u'\nINSERT DATA {'
    # add title property
    query += u'\n"{}" dc:title "{}";'.format(document_uri, document.title)
    # add creator property
    query += u'\ndc:creator "{}";'.format(document.creator)
    # add type property
    query += u'\ndc:type "{}";'.format(document.type)
    # add end of statement
    query += u'.\n}'

    return query
