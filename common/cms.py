from abc import abstractmethod

def instantiate_provider(class_path):
    # instantiate CMS provider
    modulepath, classname = class_path.rsplit('.', 1)
    module = __import__(modulepath, fromlist=[classname])
    return getattr(module, classname)()

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
