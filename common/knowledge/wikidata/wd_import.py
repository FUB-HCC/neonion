from argparse import ArgumentParser
import logging
from json import loads
from datetime import datetime
from os import path
from pyelasticsearch import ElasticSearch


def import_json_into_es(inputfolder, logger):
    institutes_filename = path.join(inputfolder, 'institutes.json')
    persons_filename = path.join(inputfolder, 'persons.json')

    es = ElasticSearch('http://localhost:9200/')

    done = 0
    institutes = []

    try:
        es.delete_index('wikidata')
        es.create_index('wikidata')
        logger.info('rebuild index [wikidata]')
    except:
        logger.warning('cant delete wikidata index')

    for line in open(institutes_filename):
        line = line.strip()
        institute = loads(line)
        institute['uri'] = 'http://wikidata.org/wiki/' + institute['id']

        institutes.append(institute)
        done += 1

        if ( done % 5000 == 0 ):
            es.bulk_index('wikidata', 'institute', institutes, id_field='id')
            institutes = []

        if done % 10000 == 0:
            logger.info('institutes imported: {}'.format(format(done, ',d')))

    if len(institutes) > 0:
        es.bulk_index('wikidata', 'institute', institutes, id_field='id')
    logger.info('institutes imported: {}'.format(format(done, ',d')))

    done = 0
    persons = []

    for line in open(persons_filename):
        line = line.strip()
        person = loads(line)
        person['uri'] = 'http://wikidata.org/wiki/' + person['id']

        persons.append(person)
        done += 1

        if ( done % 5000 == 0 ):
            es.bulk_index('wikidata', 'person', persons, id_field='id')
            persons = []

        if done % 10000 == 0:
            logger.info('persons imported: {}'.format(format(done, ',d')))

    if len(persons) > 0:
        es.bulk_index('wikidata', 'person', persons, id_field='id')
    logger.info('persons imported: {}'.format(format(done, ',d')))


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