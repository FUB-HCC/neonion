from argparse import ArgumentParser

from json import loads
from datetime import datetime
from os import path
from pyelasticsearch import ElasticSearch

def import_json_into_es(inputfolder):
    institutes_filename = path.join(inputfolder, 'institutes.json')
    persons_filename = path.join(inputfolder, 'persons.json')

    es = ElasticSearch('http://localhost:9200/')

    done = 0
    institutes = []

    try:
        es.delete_index('wikidata')
        es.create_index('wikidata')
    except:
        print('cant delete wikidata index')

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
            print(  datetime.now().strftime("%H:%M:%S"), format(done, ',d'))

    if len(institutes) > 0:
        es.bulk_index('wikidata', 'institute', institutes, id_field='id')
    print(  datetime.now().strftime("%H:%M:%S"), format(done, ',d'))

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
            print(  datetime.now().strftime("%H:%M:%S"), format(done, ',d'))

    if len(persons) > 0:
        es.bulk_index('wikidata', 'person', persons, id_field='id')
    print(  datetime.now().strftime("%H:%M:%S"), format(done, ',d'))


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-f", "--folder", default='dumps', help="folder where the json output is stored")
    args = parser.parse_args()

    import_json_into_es(args.folder)