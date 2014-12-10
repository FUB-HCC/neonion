from abc import abstractmethod


class ContentSystem(object):

    def __init__(self):
        pass

    @abstractmethod
    def list(self):
        pass

    @abstractmethod
    def search(self, search_term):
        pass

    @abstractmethod
    def get_document(self, doc_urn):
        pass

    @abstractmethod
    def get_meta(self, doc_urn):
        pass
