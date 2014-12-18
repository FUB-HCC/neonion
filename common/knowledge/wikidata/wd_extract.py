from argparse import ArgumentParser
import logging
from os import listdir, path, makedirs
from gzip import open as gzopen
from bz2 import BZ2File
from json import loads, dumps


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

    # convert type dictionary
    wd_types = dict()
    for key in types.keys():
        value = int(types[key].split('/')[-1][1:])
        wd_types[value] = {'type': key,
                           'filename': path.join(outputfolder, '{}.json.bz2'.format(key)),
                           'number': 0}

    if not path.exists(outputfolder):
        logger.info('create outputfolder')
        makedirs(outputfolder)

    # open outputfiles
    for wd_type in wd_types:
        wd_types[wd_type]['file'] = BZ2File(wd_types[wd_type]['filename'], 'wb')

    done = 0

    for wd_item in get_wikidata_items(path.join(inputfolder, latest_dump), logger):

        wd_type = None

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

                                wd_type = claim['mainsnak']['datavalue']['value']['numeric-id']
                                wd_types[wd_type]['number'] += 1

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

                            elif claim['mainsnak']['datavalue']['value']['numeric-id'] == 15916302:
                                is_mpi = True

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
            item['birth'] = birth
            item['gnd'] = gnd
            item['viaf'] = viaf
            item['aliases'] = list(aliases)

        elif is_mpi:
            item['gnd'] = gnd
            item['aliases'] = list(aliases)
            item['historic_names'] = historic_names

        # write to file
        if not wd_type is None:
            item['id'] = wd_item['id']
            item['label'] = label
            item['descr'] = descr

            wd_types[wd_type]['file'].write(dumps(item) + '\n')

        done += 1
        # if done % 100000 == 0:
        # logger.info('done: {}'.format(done))
        #     for key in wd_types:
        #         logger.info('{}: {}'.format(wd_types[key]['type'], format(wd_types[key]['number']), ',d'))
        #     logger.warning('end testing')
        #     return

        if done % 250000 == 0:
            logger.info('done: {:,d}'.format(done))
            for key in wd_types:
                logger.info('{}: {:,d}'.format(wd_types[key]['type'], wd_types[key]['number']))


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-i", "--inputfolder", default='dumps', help="folder where the wikidata dumps are stored")
    parser.add_argument("-o", "--outputfolder", default='extracted_data',
                        help="folder where the json output will be stored")
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

    extract_from_wd_dump({'person': 'http://www.wikidata.org/entity/Q5',
                          'institute': 'http://www.wikidata.org/entity/Q15916302',
                          # 'ship': 'http://www.wikidata.org/entity/Q660668'
                         }, args.inputfolder, args.outputfolder, logging.getLogger('extract'))