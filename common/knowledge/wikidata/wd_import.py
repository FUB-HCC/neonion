from argparse import ArgumentParser
import logging
from json import loads
from os import path
from bz2 import BZ2File
from pyelasticsearch import ElasticSearch


def import_json_into_es(types, inputfolder, logger):

    es = ElasticSearch('http://localhost:9200/')

    try:
        es.delete_index('wikidata')
        es.create_index('wikidata')
        logger.info('rebuild index [wikidata]')
    except:
        logger.warning('cant delete wikidata index')


    # convert type dictionary
    wd_types = dict()
    for key in types.keys():
        value = int(types[key].split('/')[-1][1:])
        wd_types[value] = {'type': key,
                           'filename': path.join(inputfolder, '{}.json'.format(key))}


    # import each given type
    for key in wd_types:
        logger.info(wd_types[key])

        done = 0
        items = []

        for line in BZ2File(wd_types[key]['filename'],'rb'):
            line = line.strip()
            item = loads(line)
            item['uri'] = 'http://wikidata.org/wiki/' + item['id']

            items.append(item)
            done += 1

            if ( done % 5000 == 0 ):
                es.bulk_index('wikidata', wd_types[key]['type'], items, id_field='id')
                items = []

            if done % len(wd_types) / 10 == 0: # log 10% steps
                logger.info('imported {}: {:,d} ({:,d})'.format(wd_types[key]['type'],done, 100*len(wd_types)/done ))

            # if done % 10000 == 0:
            #     logger.info('imported {}: {}'.format(wd_types[key]['type'],format(done, ',d')))

        if len(items) > 0:
            es.bulk_index('wikidata', wd_types[key]['type'], items, id_field='id')
        logger.info('imported {}: {}'.format(wd_types[key]['type'],format(done, ',d')))


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

    import_json_into_es(args.folder, logging.getLogger('import'))