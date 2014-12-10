# coding=utf-8

import requests
import re

from common.cms import ContentSystem


class Euler(ContentSystem):
    def __init__(self, cms_url):
        self.url = cms_url
        super(Euler, self).__init__()

    def list(self):
        doc_list = []
        doc_list.append({"name": "Jahrbuch der MPG 1974", "urn": "Jahrbuch_der_MPG-1974"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1964-1965",
                         "urn": "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1964-1965"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1958-1960",
                         "urn": "Tätigkeitsberichte_der_MPG___Tätigkeitsbericht_der_MPG_1958-1960"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1972-1973",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1972-1973"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1968-1969",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1968-1969"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1966-1967",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1966-1967"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1964-1965",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1964-1965"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1962-1963",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1962-1963"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1961-1962",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1961-1962"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1960-1961",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1960-1961"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1958-1960",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1958-1960"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1956-1958",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1956-1958"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1954-1956",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1954-1956"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1952-1954 Teil 1",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil1"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1952-1954 Teil 2",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1952-1954_Teil2"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1951-1952",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1951-1952"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1946-51 Teil 1",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil1"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1946-51 Teil 2",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil2"})
        doc_list.append({"name": "Tätigkeitsbericht der MPG 1946-51 Teil 3",
                         "urn": "Tätigkeitsberichte_der_MPG___MPG_Tätigkeitsbericht_1946-51_Teil3"})

        return doc_list

    def search(self, search_term):
        raise NotImplementedError('Search in Euler is not implemented yet')

    def get_meta(self, doc_urn):
        raise NotImplementedError('Get meta from document is not implemented yet')

    def get_document(self, doc_urn):
        # import document from euler
        doc_pages = []
        pn = 1

        while True:
            try:
                cms_url = self.url + u'/hocr?document={0}&pn={1}'.format(doc_urn, pn)
                pn += 1
                response = requests.get(cms_url)
                if response.status_code == 200:
                    doc_pages.append(response.text)
                else:
                    break
            except Exception as e:
                print(e)
                break

        if len(doc_pages) > 0:
            doc_title = " ".join(doc_urn.split("_"))
            # strip markup
            doc_pages = map(Euler.post_process_content, doc_pages)
            return {
                'urn': doc_urn,
                'title': doc_title,
                'content': ''.join(doc_pages)
            }
        else:
            return {'urn': '', 'title': '', 'content': ''}

    @staticmethod
    def post_process_content(row):
        row = re.sub(r'\n', '', row)
        row = re.sub(r'<\/*span[^>]*?>', '', row)
        return row