from common.knowledge.provider import Provider
from os import path, makedirs
import config
import wd_download
import wd_extract
import wd_import
import logging


class Wikidata(Provider):
    def __init__(self, elastic_search_url, root_folder):
        self.elastic_search_url = elastic_search_url
        self.root_folder = root_folder
        self.dumps_folder = path.join(self.root_folder, 'dumps')
        self.extract_folder = path.join(self.root_folder, 'extracted_data')

        # set up logging to file
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                            datefmt='%m-%d %H:%M',
                            filename=path.join('wd_maintenance.log'),
                            filemode='a')

        logging.getLogger("requests").setLevel(logging.WARNING)  # suppress logging from requests package
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s %(name)-12s %(levelname)-8s %(message)s', "%H:%M:%S")
        console.setFormatter(formatter)
        logging.getLogger('').addHandler(console)

        if not path.exists(self.root_folder):
            logging.info('root folder not found --> mkdir {}'.format(path.abspath(self.root_folder)))
            makedirs(self.root_folder)

        if not path.exists(self.dumps_folder):
            logging.info('dump folder not found --> mkdir {}'.format(path.abspath(self.dumps_folder)))
            makedirs(self.dumps_folder)

        if not path.exists(self.extract_folder):
            logging.info('extract folder not found --> mkdir {}'.format(path.abspath(self.extract_folder)))
            makedirs(self.extract_folder)


    def index(self):
        return 'wikidata'

    def dump(self, types={'person': 'http://www.wikidata.org/entity/Q5',
                          'institute': 'http://www.wikidata.org/entity/Q15916302',
                          # 'ship': 'http://www.wikidata.org/entity/Q660668'
                         }):

        wd_download.download_wd_dump(
            self.dumps_folder,
            logging.getLogger('download'))

        wd_extract.extract_from_wd_dump(
            types,
            self.dumps_folder,
            self.extract_folder,
            logging.getLogger('extract'))

        wd_import.import_json_into_es(
            types,
            self.extract_folder,
            logging.getLogger('import'))

    def create(self, uri):
        pass

    def edit(self, uri):
        pass

    def delete(self, uri):
        pass

# from common.knowledge.wikidata.provider import Wikidata
# wd = Wikidata('foo.bar', '/web/neonion.imp.fu-berlin.de/wd_test')
# wd.dump()
