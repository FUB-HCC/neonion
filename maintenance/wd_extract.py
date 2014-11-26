from argparse import ArgumentParser

from os import listdir,path, makedirs
from gzip import open as gzopen
from json import loads,dumps
from datetime import datetime

def latest_dump_from_folder(folder):
    files = listdir(folder)
    return sorted(list(files))[-1]  # map( strip_file_extension, files )

def get_wikidata_items(filename):
    count = 0
    for line in gzopen(filename):
        count += 1
        line = line.strip()
        wd = {}
        try:
            wd = loads(line[0:-2])
        except:
            # print( '-2', line[0:-2] )
            try:
                wd = loads(line[0:-1])
            except:
                # if len( line > 2 ):
                print( 'something went wrong parsing this line:' )
                print( '-1', line[0:-1] )
                continue
        yield wd

def extract_from_wd_dump(inputfolder, outputfolder):
    print('extract_from_wd_dump')

    latest_dump = latest_dump_from_folder(inputfolder)

    if not path.exists(outputfolder):
        print( 80 * '=' )
        print( 'create outputfolder')
        print( 80 * '=' + '\n' )
        makedirs(outputfolder)

    persons_filename = path.join(outputfolder, 'persons.json')
    person_file = open(persons_filename, 'w')

    institutes_filename = path.join(outputfolder, 'institutes.json')
    institute_file = open(institutes_filename, 'w')

    # person_statement_count = dict()
    # person_statement_count_filename = os.path.join(outputfolder, 'person_statement_count.json')
    # person_statement_count_file = open( person_statement_count_filename, 'w' )
    # db = dataset.connect('sqlite:///' + os.path.join(outputfolder, 'properties_20141009.db'))
    # for property in db['properties']:
    # print( property['entity'],property['label']  )
    # print( 80*'=' )
    # print( db['properties'].find_one(entity="P410")['label'] )
    # return


    print( 80 * '=' )
    print( 'inputfolder:         {}'.format(inputfolder) )
    print( 'outputfolder:        {}'.format(outputfolder) )
    print( 80 * '=' )
    print( 'latest_dump:         {}'.format(latest_dump) )
    print( 'persons_filename:    {}'.format(persons_filename) )
    print( 'institutes_filename: {}'.format(institutes_filename) )
    print( 80 * '=' + '\n' )

    done = 0
    human = 0
    nr_of_mpis = 0

    for wd_item in get_wikidata_items(path.join(inputfolder, latest_dump)):
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

        if wd_item['type'] == 'item':
            if not 'labels' in wd_item:
                pass
                # items_without_any_label_file.write( wd_item['id']+'\n' )
                # items_without_any_label_file.flush()

            if 'claims' in wd_item:
                if 'P31' in wd_item['claims']:
                    for claim in wd_item['claims']['P31']:  # instance of
                        if claim['mainsnak']['snaktype'] == 'value':
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
                                    print( '!!!MPG' )
                                    is_mpi = True

                    if is_human:
                        # # count statements
                        # for claim in wd_item['claims']:
                        # if claim not in person_statement_count:
                        #         person_statement_count[claim] = dict()
                        #         person_statement_count[claim]['count'] = 0
                        #         try:
                        #             person_statement_count[claim]['label'] = db['properties'].find_one(entity=claim)['label']
                        #         except:
                        #             person_statement_count[claim]['label'] = ''
                        #             # pass
                        #     person_statement_count[claim]['count'] += 1

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

                        if 'P569' in wd_item['claims']:
                            for claim in wd_item['claims']['P569']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    birth = claim['mainsnak']['datavalue']['value']['time'][8:18]

                        if 'P227' in wd_item['claims']:
                            for claim in wd_item['claims']['P227']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    gnd.append(claim['mainsnak']['datavalue']['value'])

                        if 'P214' in wd_item['claims']:
                            for claim in wd_item['claims']['P214']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    viaf.append(claim['mainsnak']['datavalue']['value'])

                    elif is_mpi:
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

                        # GND
                        if 'P227' in wd_item['claims']:
                            for claim in wd_item['claims']['P227']:
                                if claim['mainsnak']['snaktype'] == 'value':
                                    gnd.append(claim['mainsnak']['datavalue']['value'])

                        # historic names
                        if 'P1448' in wd_item['claims']:
                            # print( json.dumps( claim, indent=2 ) )
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
            print( item )
            institute_file.write(dumps(item) + '\n')

        done += 1
        if done % 250000 == 0:
            # person_statement_count_file = open(person_statement_count_filename, 'w')
            # person_statement_count_file.write(json.dumps(person_statement_count, indent=4))
            # person_statement_count_file.close()
            print(  '{} total: {} human: {} mpis: {}'.format(
                datetime.now().strftime('%H:%M:%S'),
                format(done, ',d'),
                format(human, ',d'),
                format(nr_of_mpis, ',d'),
            )
            )

            # person_statement_count_file = open(person_statement_count_filename, 'w')
            # person_statement_count_file.write(json.dumps(person_statement_count, indent=4))
            # person_statement_count_file.close()


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-i", "--inputfolder", default='dumps', help="folder where the wikidata dumps are stored")
    parser.add_argument("-o", "--outputfolder", default='extracted_data', help="folder where the json output will be stored")
    args = parser.parse_args()

    extract_from_wd_dump(args.inputfolder, args.outputfolder)