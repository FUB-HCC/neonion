import os, requests
from bs4 import BeautifulSoup
from optparse import OptionParser
from helper import download_file


url = 'https://dumps.wikimedia.org/other/wikidata/{}'


def download_wd_dump():
    parser = OptionParser()

    parser.add_option( '-o', '--outputfolder', dest='outputfolder', help='outfolder', default='dumps' )
    (options, args) = parser.parse_args()
    if not options.outputfolder:
        parser.error('outputfolder not given')

    outputfolder = options.outputfolder
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

if __name__ == '__main__':
    download_wd_dump()