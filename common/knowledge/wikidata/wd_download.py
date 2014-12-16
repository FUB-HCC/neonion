from argparse import ArgumentParser
import logging
import config
from requests import get
from os import path, makedirs
from bs4 import BeautifulSoup
from datetime import datetime


def download_file(url, outputfolder, logger):
    logger.info('download actual dump')
    filename = url.split('/')[-1]
    local_filename = path.join(outputfolder, filename)

    r = get(url, stream=True)
    download_size = int(r.headers['Content-Length'])

    # check if file is already downloaded
    if path.isfile(local_filename):
        local_size = path.getsize(local_filename)
        if local_size == download_size:
            logger.info('skip: ' + filename)
            return local_filename

    logger.info('{} ({} Bytes)'.format(url, format(int(r.headers['Content-Length']), ',d')))
    with open(local_filename, 'wb') as f:
        # size_to_log = 250 * 1048576  # x MB
        size_to_log = 1 * 1048576  # x MB
        downloaded = 0
        last_time = datetime.now()
        for chunk in r.iter_content(chunk_size=1024):
            if chunk:  # filter out keep-alive new chunks
                downloaded += 1024
                if downloaded % (size_to_log) == 0:
                    actual_time = datetime.now()
                    delta = actual_time - last_time
                    logger.info(
                        '{done} MB ({done_percent:.{digits}f}%, {speed:.{digits}f} KB/s)'
                        .format(
                            done=downloaded / (1048576),
                            done_percent=100 * float(downloaded) / download_size,
                            speed=(size_to_log / (delta.seconds + delta.microseconds / 1E6)) / 1024,
                            digits=2,
                        )
                    )
                    last_time = actual_time
                f.write(chunk)
                f.flush()
    logger.info('finished downloading')
    return local_filename


def download_wd_dump(outputfolder, logger):
    if not path.exists(outputfolder):
        logger.info('create outputfolder')
        makedirs(outputfolder)

    resp = get(config.wd_url.format(''))
    soup = BeautifulSoup(resp.text)
    all_dumps = set()
    for a in soup.find_all('a'):
        href = a.attrs['href'].strip()
        if not href == '../':
            all_dumps.add(href)

    latest_dump = sorted(all_dumps)[-1]
    download_file(config.wd_url.format(latest_dump), outputfolder, logger)


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("-f", "--folder", default='dumps',
                        help="folder where the wikidata dumps are getting downloaded to")
    args = parser.parse_args()

    # set up logging to file
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                        datefmt='%m-%d %H:%M',
                        filename='wd_download.log',
                        filemode='a')

    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(name)-12s %(levelname)-8s %(message)s', "%H:%M:%S")
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

    download_wd_dump(args.folder, logging.getLogger('download'))