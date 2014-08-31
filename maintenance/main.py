import os, requests, json, gzip
from bs4 import BeautifulSoup
from datetime import datetime
from pyelasticsearch import ElasticSearch

# DOWNLOAD
def download_file( url, outputfolder ):
    print( 80*'=' )
    local_filename = os.path.join( outputfolder, url.split( '/' )[-1] )

    r = requests.get( url, stream=True )
    download_size = int(r.headers['Content-Length'])

    # check if file is already downloaded
    if os.path.isfile( local_filename ):
        local_size = os.path.getsize( local_filename )
        if local_size == download_size:
            print('skip')
            print( 80*'='+'\n' )
            return local_filename

    print( '{} ({} Bytes)'.format( url, format(int(r.headers['Content-Length']),',d') ) )
    with open( local_filename, 'wb' ) as f:
        size_to_log = 250 * 1048576 # x MB
        downloaded = 0
        last_time = datetime.now()
        for chunk in r.iter_content( chunk_size=1024 ):
            if chunk: # filter out keep-alive new chunks
                downloaded += 1024
                if downloaded % (size_to_log) == 0:
                    actual_time = datetime.now()
                    delta = actual_time - last_time
                    print(
                        '{done} MB ({done_percent:.{digits}f}%, {speed:.{digits}f} KB/s)'
                        .format(
                            done         = downloaded/(1048576),
                            done_percent = 100 * float(downloaded) / download_size,
                            speed        = (size_to_log/(delta.seconds + delta.microseconds/1E6))/1024,
                            digits       = 2,
                            )
                    )
                    last_time = actual_time
                f.write( chunk )
                f.flush()
    print( 80*'='+'\n' )
    return local_filename

def latest_dump_from_folder( folder ):
    files = os.listdir( folder )
    return sorted( list( files ) )[-1] # map( strip_file_extension, files )

url = 'https://dumps.wikimedia.org/other/wikidata/{}'
def download_wd_dump():

    outputfolder = 'dumps'

    if not os.path.exists( outputfolder ):
        print( 80*'=' )
        print( 'create outputfolder')
        print( 80*'='+'\n' )

        os.makedirs( outputfolder )

    resp = requests.get( url.format('') )
    soup = BeautifulSoup( resp.text )
    all_dumps = set()
    for a in soup.find_all('a'):
        href = a.attrs['href'].strip()
        if not href == '../':
            all_dumps.add( href )

    latest_dump = sorted(all_dumps)[-1]
    download_file( url.format( latest_dump ), outputfolder )



# EXTRACT
def get_wikidata_items( filename ):
    for line in gzip.open( filename ):
        line = line.strip()
        wd = {}
        try:
            wd = json.loads( line[0:-2] )
        except:
            try:
                wd = json.loads( line[0:-1] )
            except:
                # if len( line > 2 ):
                print( 'something went wrong parsing this line:' )
                print( line )
                continue
        yield wd

def extract_from_wd_dump():
    inputfolder = 'dumps'
    outputfolder = 'extracted_data'
    latest_dump = latest_dump_from_folder( inputfolder )

    if not os.path.exists( outputfolder ):
        print( 80*'=' )
        print( 'create outputfolder')
        print( 80*'='+'\n' )
        os.makedirs( outputfolder )

    persons_filename = os.path.join( outputfolder, 'persons.json' )
    person_file = open( persons_filename, 'w' )

    institutes_filename = os.path.join( outputfolder, 'institutes.json' )
    institute_file = open( institutes_filename, 'w' )

    print( 80*'=' )
    print( 'inputfolder:         {}'.format(inputfolder) )
    print( 'outputfolder:        {}'.format(outputfolder) )
    print( 80*'=' )
    print( 'latest_dump:         {}'.format(latest_dump) )
    print( 'persons_filename:    {}'.format(persons_filename) )
    print( 'institutes_filename: {}'.format(institutes_filename) )
    print( 80*'='+'\n' )

    done = 0
    human = 0
    nr_of_mpis = 0

    for wd_item in get_wikidata_items( os.path.join( inputfolder, latest_dump ) ):
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
                pass
                # items_without_any_label_file.write( wd_item['id']+'\n' )
                # items_without_any_label_file.flush()


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
        if done % 250000 == 0:
            print(  '{} total: {} human: {} mpis: {}'.format(
                        datetime.now().strftime('%H:%M:%S'),
                        format(done, ',d'),
                        format(human, ',d'),
                        format(nr_of_mpis, ',d'),
                    )
            )


# IMPORT
def import_json_into_es():
    inputfolder = 'extracted_data'

    institutes_filename = os.path.join( inputfolder, 'institutes.json' )
    persons_filename = os.path.join( inputfolder, 'persons.json' )


    es = ElasticSearch('http://localhost:9200/')

    done = 0
    institutes = []

    try:    es.delete_index( 'institutes' )
    except: pass

    es.create_index( 'institutes' )
    for line in open( institutes_filename ):
        line = line.strip()
        institute = json.loads( line )
        institute['uri'] = 'http://wikidata.org/wiki/'+institute['id']

        institutes.append( institute )
        done += 1

        if( done % 5000 == 0 ):
            es.bulk_index( 'institutes', 'institute', institutes, id_field='id' )
            institutes = []


        if done%10000 == 0:
            print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))

    if len(institutes) > 0:
        es.bulk_index( 'institutes', 'institute', institutes, id_field='id' )
    print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))


    done = 0
    persons = []

    try:    es.delete_index('persons')
    except: pass

    es.create_index( 'persons' )
    for line in open( persons_filename ):
        line = line.strip()
        person = json.loads( line )
        person['uri'] = 'http://wikidata.org/wiki/'+person['id']

        persons.append( person )
        done += 1

        if( done % 5000 == 0 ):
            es.bulk_index( 'persons', 'person', persons, id_field='id' )
            persons = []


    if done%10000 == 0:
        print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))

    if len(persons) > 0:
        es.bulk_index( 'persons', 'person', persons, id_field='id' )
    print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))

if __name__ == '__main__':
    download_wd_dump()
    extract_from_wd_dump()
    import_json_into_es()
else:
    print( 'usage:' )
    print( '    main.download_wd_dump()      # downloads the latest wikidata dump file' )
    print( '    main.extract_from_wd_dump()  # extracts person and institute data from latest dump' )
    print( '    main.import_json_into_es()   # imports person and institute data into local elastcisearch (deletes and recreates index)' )

