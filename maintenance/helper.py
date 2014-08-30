import requests, os
from datetime import datetime


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

def strip_file_extension( s ):
    return '.'.join( s.split( '.' )[:-2])

def latest_dump_from_folder( folder ):
    files = os.listdir( folder )
    return sorted( list( files ) )[-1] # map( strip_file_extension, files )

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
