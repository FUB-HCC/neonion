import requests, os
from bs4 import BeautifulSoup
from datetime import datetime
from optparse import OptionParser

parser = OptionParser()

parser.add_option( '-o', '--outputfolder', dest='outputfolder', help='outfolder', default='dumps' )
(options, args) = parser.parse_args()
if not options.outputfolder:
    parser.error('outputfolder not given')

outputfolder = options.outputfolder

url = 'https://dumps.wikimedia.org/other/wikidata/{}'


def download_file( url ):
    local_filename = os.path.join( outputfolder, url.split( '/' )[-1] )

    r = requests.get( url, stream=True )
    download_size = int(r.headers['Content-Length'])

    # check if file is already downloaded
    if os.path.isfile( local_filename ):
        local_size = os.path.getsize( local_filename )
        if local_size == download_size:
            print('skip')
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
    return local_filename

if __name__ == '__main__':
    resp = requests.get( url.format('') )
    soup = BeautifulSoup( resp.text )
    all_dumps = set()
    for a in soup.find_all('a'):
        href = a.attrs['href'].strip()
        if not href == '../':
            all_dumps.add( href )

    latest_dump = sorted(all_dumps)[-1]
    download_file( url.format( latest_dump ) )