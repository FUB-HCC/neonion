import requests, os
from bs4 import BeautifulSoup
from optparse import OptionParser

parser = OptionParser()

parser.add_option( '-o', '--outputfolder', dest='outputfolder', help='outfolder', default='dumps' )
(options, args) = parser.parse_args()
if not options.outputfolder:
    parser.error('outputfolder not given')

url = 'https://dumps.wikimedia.org/other/wikidata/{}'

def download_file( url ):
    local_filename = os.path.join( options.outputfolder, url.split( '/' )[-1] )

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
        downloaded = 0
        for chunk in r.iter_content( chunk_size=1024 ):
            if chunk: # filter out keep-alive new chunks
                downloaded += 1024
                if downloaded % (500*1048576) == 0: # 500 MB
                    print( '{} MB ({}%)'.format( downloaded/(1048576), 100*float(downloaded)/download_size ) )
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