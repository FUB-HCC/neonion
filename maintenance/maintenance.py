import config
import wd_download
import wd_extract
import wd_import
import logging
from os import path


if __name__ == '__main__':
    # set up logging to file
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(name)-12s %(levelname)-8s %(message)s',
                        datefmt='%m-%d %H:%M',
                        filename=path.join(config.root_folder, 'maintenance.log'),
                        filemode='a')

    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s %(name)-12s %(levelname)-8s %(message)s', "%H:%M:%S")
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

    wd_download.download_wd_dump(
        config.dumps_folder,
        logging.getLogger('download'))
    wd_extract.extract_from_wd_dump(
        config.dumps_folder,
        config.extract_folder,
        logging.getLogger('extract'))
    wd_import.import_json_into_es(
        config.extract_folder,
        logging.getLogger('import'))
