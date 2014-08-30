import json
import gzip
import glob
import os
from datetime import datetime
from optparse import OptionParser

parser = OptionParser()
# parser.add_option( '-i', '--inputfile',  dest='inputfile', help='Wikidata JSON-Dump from http://dumps.wikimedia.org/other/wikidata/' )
parser.add_option( '-i', '--inputfolder',  dest='inputfolder', help='Folder containing wikidata JSON-Dumps from http://dumps.wikimedia.org/other/wikidata/', default='dumps' )
parser.add_option( '-o', '--outputfolder', dest='outputfolder', help='outfolder', default='extracted_data' )

(options, args) = parser.parse_args()


def extract_from_wd_dump():
    latest_dump = latest_dump_from_folder( options.inputfolder )

    if not os.path.exists( options.outputfolder ):
        print( 80*'=' )
        print( 'create outputfolder')
        print( 80*'='+'\n' )
        os.makedirs( options.outputfolder )

    persons_filename = os.path.join( options.outputfolder, 'persons.json' )
    person_file = open( persons_filename, 'w' )

    institutes_filename = os.path.join( options.outputfolder, 'institutes.json' )
    institute_file = open( institutes_filename, 'w' )

    print( 80*'=' )
    print( 'inputfolder:         {}'.format(options.inputfolder) )
    print( 'outputfolder:        {}'.format(options.outputfolder) )
    print( 80*'=' )
    print( 'latest_dump:         {}'.format(latest_dump) )
    print( 'persons_filename:    {}'.format(persons_filename) )
    print( 'institutes_filename: {}'.format(institutes_filename) )
    print( 80*'='+'\n' )

    done = 0
    human = 0
    nr_of_mpis = 0

    for wd_item in get_wikidata_items( os.path.join( options.inputfolder, latest_dump ) ):
        is_human = False
        is_mpi = False
        item     = {}
        label    = None
        aliases  = set()
        descr    = None

        birth    = None
        gnd      = []
        viaf     = []

        if wd_item['type'] == 'item':
            if not 'labels' in wd_item:
                items_without_any_label_file.write( wd_item['id']+'\n' )
                items_without_any_label_file.flush()


            if 'claims' in wd_item:
                if 'P31' in wd_item['claims']:
                    for claim in wd_item['claims']['P31']:
                        if claim['mainsnak']['snaktype'] == 'value':
                            if claim['mainsnak']['datavalue']['value']['numeric-id'] == 5:
                                is_human = True
                                human += 1
                            elif claim['mainsnak']['datavalue']['value']['numeric-id'] == 15916302:
                                is_mpi = True
                                nr_of_mpis += 1


                    if is_human:
                        if 'labels' in wd_item:
                            if 'de' in wd_item['labels']:
                                label = wd_item['labels']['de']['value']
                            elif 'en' in wd_item['labels']:
                                label = wd_item['labels']['en']['value']
                            else:
                                label = next( iter( wd_item['labels'].values() ) )['value']

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
                                label = next( iter( wd_item['labels'].values() ) )['value']

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

        if is_human:
            item['id'] = wd_item['id']
            item['label'] = label
            item['descr'] = descr
            item['birth'] = birth
            item['gnd'] = gnd
            item['viaf'] = viaf
            item['aliases'] = list(aliases)
            person_file.write( json.dumps( item )+'\n' )

        elif is_mpi:
            item['id'] = wd_item['id']
            item['label'] = label
            item['descr'] = descr
            item['gnd'] = gnd
            item['aliases'] = list(aliases)
            institute_file.write( json.dumps( item )+'\n' )

        done +=1
        if done % 10000 == 0:
            print(  '{} total: {} human: {} mpis: {}'.format(
                        datetime.now().strftime('%H:%M:%S'),
                        format(done, ',d'),
                        format(human, ',d'),
                        format(nr_of_mpis, ',d'),
                    )
            )




if __name__ == '__main__':
    extract_from_wd_dump()
