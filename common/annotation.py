from common.uri import generate_uri


def add_uri(annotation):
    if 'rdf' in annotation and 'uri' not in annotation['rdf']:
        uri = generate_uri(annotation['rdf']['typeof'], annotation['quote'])
        annotation['rdf']['uri'] = uri

    return annotation