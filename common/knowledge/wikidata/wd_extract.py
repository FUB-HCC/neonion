from argparse import ArgumentParser
import logging
from os import listdir, path, makedirs
from gzip import open as gzopen
from json import loads, dumps
from datetime import datetime


def latest_dump_from_folder(folder):
    files = listdir(folder)
    return sorted(list(files))[-1]


def get_wikidata_items(filename, logger):
    count = 0
    for line in gzopen(filename):
        count += 1
        line = line.strip()
        wd = {}
        try:
            wd = loads(line[0:-2])
        except:
            try:
                wd = loads(line[0:-1])
            except:
                if len(line) > 2:  # first and last line are no valid json-objects
                    logger.warning('something went wrong parsing this line:\n{}'.format(line))
                    continue
        yield wd


def extract_from_wd_dump(types, inputfolder, outputfolder, logger):
    logger.info('start extraction from wd dump')

    latest_dump = latest_dump_from_folder(inputfolder)

    # convert type dictionary from {'http://wikidata.org/entity/Q123': 'name'} to {1234: 'name'}
    wd_types = dict()
    for key in types.keys():
        value = int(types[key].split('/')[-1][1:])
        wd_types[value] = key
    logger.info('types: {}'.format(wd_types))
    # logger.info('\'Q5\' in wd_types: {}'.format('Q5' in wd_types))



    if not path.exists(outputfolder):
        logger.info('create outputfolder')
        makedirs(outputfolder)

    persons_filename = path.join(outputfolder, 'persons.json')
    person_file = open(persons_filename, 'w')

    institutes_filename = path.join(outputfolder, 'institutes.json')
    institute_file = open(institutes_filename, 'w')

    done = 0
    human = 0
    nr_of_mpis = 0

    for wd_item in get_wikidata_items(path.join(inputfolder, latest_dump), logger):

        is_human = False
        is_mpi = False
        item = {}
        label = None
        aliases = set()
        historic_names = list()
        descr = None

        birth = None
        gnd = []
        viaf = []

        if 'type' in wd_item and wd_item['type'] == 'item':

            if not 'labels' in wd_item:
                pass

            if 'claims' in wd_item:

                if 'P31' in wd_item['claims']:

                    for claim in wd_item['claims']['P31']:  # instance of

                        if claim['mainsnak']['snaktype'] == 'value':

                            if claim['mainsnak']['datavalue']['value']['numeric-id'] in wd_types:
                                # type = wd_types[claim['mainsnak']['datavalue']['value']['numeric-id']]

                                if 'labels' in wd_item:
                                    if 'de' in wd_item['labels']:
                                        label = wd_item['labels']['de']['value']
                                    elif 'en' in wd_item['labels']:
                                        label = wd_item['labels']['en']['value']
                                    else:
                                        label = next(iter(wd_item['labels'].values()))['value']

                                if 'descriptions' in wd_item:
                                    if 'de' in wd_item['descriptions']:
                                        descr = wd_item['descriptions']['de']['value']
                                    elif 'en' in wd_item['descriptions']:
                                        descr = wd_item['descriptions']['en']['value']

                                if 'aliases' in wd_item:
                                    # for lang in wd_item['aliases']:
                                    for lang in ['de', 'en']:
                                        if lang in wd_item['aliases']:
                                            for alias in wd_item['aliases'][lang]:
                                                aliases.add(alias['value'])

                            if claim['mainsnak']['datavalue']['value']['numeric-id'] == 5:
                                is_human = True
                                human += 1

                            elif claim['mainsnak']['datavalue']['value']['numeric-id'] == 15916302:
                                is_mpi = True
                                nr_of_mpis += 1

                    # Max-Planck-Gesellschaft
                    if 'P527' in wd_item['claims']:  # has part
                        for claim in wd_item['claims']['P527']:
                            if claim['mainsnak']['snaktype'] == 'value':
                                if claim['mainsnak']['datavalue']['value']['numeric-id'] == 15916302:
                                    is_mpi = True

                    if is_human:

                        # birthdate
                        if 'P569' in wd_item['claims']:
                            for claim in wd_item['claims']['P569']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    birth = claim['mainsnak']['datavalue']['value']['time'][8:18]

                        # gnd identifier
                        if 'P227' in wd_item['claims']:
                            for claim in wd_item['claims']['P227']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    gnd.append(claim['mainsnak']['datavalue']['value'])

                        # viaf identifier
                        if 'P214' in wd_item['claims']:
                            for claim in wd_item['claims']['P214']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    viaf.append(claim['mainsnak']['datavalue']['value'])

                    elif is_mpi:

                        # GND
                        if 'P227' in wd_item['claims']:
                            for claim in wd_item['claims']['P227']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    gnd.append(claim['mainsnak']['datavalue']['value'])

                        # historic names
                        if 'P1448' in wd_item['claims']:
                            # logger.info( json.dumps( claim, indent=2 ) )
                            for claim in wd_item['claims']['P1448']:
                                hist_name = dict()
                                hist_name['name'] = claim['mainsnak']['datavalue']['value']['text']
                                if 'qualifiers' in claim:
                                    # from (P580)
                                    if 'P580' in claim['qualifiers']:
                                        hist_name['valid_from'] = claim['qualifiers']['P580'][0]['datavalue']['value']['time'][8:12]
                                    # to (P582)
                                    if 'P582' in claim['qualifiers']:
                                        hist_name['valid_to'] = claim['qualifiers']['P582'][0]['datavalue']['value']['time'][8:12]
                                historic_names.append(hist_name)

        if is_human:
            item['id'] = wd_item['id']
            item['label'] = label
            item['descr'] = descr
            item['birth'] = birth
            item['gnd'] = gnd
            item['viaf'] = viaf
            item['aliases'] = list(aliases)
            person_file.write(dumps(item) + '\n')

        elif is_mpi:
            item['id'] = wd_item['id']
            item['label'] = label
            item['descr'] = descr
            item['gnd'] = gnd
            item['aliases'] = list(aliases)
            item['historic_names'] = historic_names
            institute_file.write(dumps(item) + '\n')

        done += 1
        # if done % 1000 == 0:
        #     logger.warning('end testing')
        #     return

        if done % 250000 == 0:
            logger.info('{} total: {} human: {} mpis: {}'.format(
                datetime.now().strftime('%H:%M:%S'),
                format(done, ',d'),
                format(human, ',d'),
                format(nr_of_mpis, ',d'),
            )
            )


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-i", "--inputfolder", default='dumps', help="folder where the wikidata dumps are stored")
    parser.add_argument("-o", "--outputfolder", default='extracted_data',help="folder where the json output will be stored")
    args = parser.parse_args()

    # set up logging to file
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                        datefmt='%m-%d %H:%M',
                        filename='wikidata_extract.log',
                        filemode='a')

    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(name)-12s %(levelname)-8s %(message)s', "%H:%M:%S")
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

    extract_from_wd_dump(args.inputfolder, args.outputfolder, logging.getLogger('extract'))