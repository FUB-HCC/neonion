from downloader import download_wd_dump
from extractor import extract_from_wd_dump
from importer import import_json_into_es

download_wd_dump()
extract_from_wd_dump()
import_json_into_es()