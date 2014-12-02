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

    def search(self, search_term, search_type, size=10):
        query = {
            'query': {
                'filtered': {
                    'query': {
                        'fuzzy_like_this': {
                            'like_text': search_term,
                            'fields': ['label', 'alias'],
                            'fuzziness': 0.1,
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
        url = self.elastic_search_url + '/' + \
            self.index + '/_search?size=' + str(size) + '&pretty=true&source={}'.format(json.dumps(query))
        return requests.get(url).json()
