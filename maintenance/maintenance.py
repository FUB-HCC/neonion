import config
import wd_download
import wd_extract
import wd_import

if __name__ == '__main__':
    wd_download.download_wd_dump(config.dumps_folder)
    wd_extract.extract_from_wd_dump(config.dumps_folder, config.extract_folder)
    wd_import.import_json_into_es(config.extract_folder)
