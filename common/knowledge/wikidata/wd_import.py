from argparse import ArgumentParser
import config
import logging
import calendar

from json import loads
from os import path
from bz2 import BZ2File
from elasticsearch import Elasticsearch, helpers
from elasticsearch.helpers import BulkIndexError


# create generator
def get_chunks(conn, entries, index, doc_type):
    for entry in entries:
        entry['_index'] = index
        entry['_type'] = doc_type
        yield entry


def bulk_entries(conn, es_index, doc_type, entries):
    try:
        helpers.bulk(conn, get_chunks(conn, entries, index, doc_type))
    except BulkIndexError:
        pass


def import_json_into_es(types, inputfolder, logger):
    """
    imports entitied from the *name.json.bz2* files (one entity per line) into local elasticsearch
    :param types: json string like {'person': 'http://www.wikidata.org/entity/Q5', 'name': 'Wikidata-URI'}
    :param inputfolder:
    :param logger:
    :return:
    """

    es = Elasticsearch(config.ELASTICSEARCH_URL)
    es_index = 'wikidata.org'

    try:
        es.indices.delete(es_index)
        es.indices.create(es_index)
        logger.info('rebuild index [wikidata]')
    except:
        logger.warning('cant delete wikidata index')

    # convert type dictionary
    wd_types = dict()
    for key in types.keys():
        value = int(types[key].split('/')[-1][1:])
        wd_types[value] = {'type': key,
                           'filename': path.join(inputfolder, '{}.json.bz2'.format(key))}

    # import each given type
    for key in wd_types:
        logger.info(wd_types[key])

        documents_per_chunk = 5000
        done = 0
        items = []

        data_file = BZ2File(wd_types[key]['filename'], 'rb')
        try:
            for line in data_file:
                line = line.strip()
                item = loads(line)
                item['uri'] = 'http://wikidata.org/wiki/' + item['id']

                if 'birth' in item and isinstance(item['birth'], basestring):
                    item['birth'] = item['birth'].replace('-00', '-01')
                    item['birth'] = item['birth'].replace('-02-30', '-02-29')
                    item['birth'] = item['birth'].replace('-02-31', '-02-29')
                    item['birth'] = item['birth'].replace('-04-31', '-04-30')
                    item['birth'] = item['birth'].replace('-06-31', '-06-30')
                    item['birth'] = item['birth'].replace('-09-31', '-09-30')
                    item['birth'] = item['birth'].replace('-11-31', '-11-30')

                    if item['birth'][-5:] == '02-29':
                        year = item['birth'][:4]
                        if not calendar.isleap(int(year)):
                            item['birth'] = year + '-02-28'

                    if item['birth'][-2:] == '-0':
                        del item['birth']

                items.append(item)
                done += 1

                if done % documents_per_chunk == 0:
                    bulk_entries(es, es_index, wd_types[key]['type'], items)
                    logger.info('imported {}: {}'.format(wd_types[key]['type'], format(done, ',d')))
                    del items[:]

            if len(items) > 0:
                bulk_entries(es, es_index, wd_types[key]['type'], items)
                logger.info('imported {}: {}'.format(wd_types[key]['type'], format(done, ',d')))
        finally:
            # release the file handler
            data_file.close()
            # refresh the index
            es.indices.refresh(es_index)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-f", "--folder", default='dumps', help="folder where the json output is stored")
    args = parser.parse_args()

    # set up logging to file
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                        datefmt='%m-%d %H:%M',
                        filename='wikidata_import.log',
                        filemode='a')

    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(name)-12s %(levelname)-8s %(message)s', "%H:%M:%S")
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)
    logging.getLogger('elasticsearch').propagate = False

    import_json_into_es({'person': 'http://www.wikidata.org/entity/Q5'}, args.folder, logging.getLogger('import'))
