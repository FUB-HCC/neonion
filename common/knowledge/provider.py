import requests
import json

from abc import abstractmethod


class Provider(object):

    def __init__(self, elastic_search_url):
        self.elastic_search_url = elastic_search_url

    @abstractmethod
    def index(self):
        raise NotImplementedError('No index for elastic search provided')

    @abstractmethod
    def dump(self, types):
        pass

    @abstractmethod
    def create(self, uri):
        pass

    @abstractmethod
    def edit(self, uri):
        pass

    @abstractmethod
    def delete(self, uri):
        pass

    def search(self, search_term, search_type, index=None, size=50):
        if index is None:
            index = self.index()

        query = {
            'query': {
                'filtered': {
                    'query': {
                        'bool': {
                            'should': [
                                {
                                    'wildcard': {
                                        'label': u'*{}*'.format(search_term)
                                    }
                                },
                                {
                                    'wildcard': {
                                        'aliases': u'*{}*'.format(search_term)
                                    }
                                },
                                {
                                    'more_like_this': {
                                        'fields': ['label', 'aliases'],
                                        'like_text': search_term,
                                        'min_term_freq': 1,
                                        'min_doc_freq': 1,
                                        'max_query_terms': 12
                                    }
                                }
                            ]
                        }
                    },
                    'filter': {
                        'type': {
                            'value': search_type
                        }
                    }
                }
            }
        }

        url = self.elastic_search_url + '/' + index + '/_search?size='+str(size)+'&pretty=true&source={}'.format(json.dumps(query))
        response = requests.get(url)

        if response.status_code == 200:
            return map(lambda item: item['_source'], response.json()['hits']['hits'])
        else:
            return []
