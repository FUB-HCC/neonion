#!/usr/bin/python

import re as _re
from datetime import datetime

import pywikibot as _wiki
print(_wiki.version.getversiondict())

from pywikibot import pagegenerators as pg

from SPARQLWrapper import SPARQLWrapper, JSON

__all__ = ['repo', 'sparql', 'item', 'prop', 'label', 'extract_id', 'query']

_sparqli = SPARQLWrapper('https://query.wikidata.org/bigdata/namespace/wdq/sparql')
_sparqli.setReturnFormat(JSON)

_site = _wiki.Site('wikidata', 'wikidata')
repo = _site.data_repository()

def create_item():
  """ returns a newly created item page """
  new_item = repo.editEntity(dict(), dict(), summary="created by script")
  if new_item.get('success'):
    qid = new_item.get('entity', {}).get('id')
    return item(qid)

def create_claim(pid, isReference=False):
  """ Pass property identifier string (P...) """
  return _wiki.Claim(repo, pid, isReference=isReference)

def add_source_url(claim, source):
  """ Adds given URL as a reference for specified claim and adds current date as reference as well. """
  source_claim = create_claim('P248' if type(source) == _wiki.page.ItemPage else 'P854', isReference=True)
  source_claim.setTarget(source)
  now = datetime.now()
  source_date = _wiki.WbTime(year=now.year, month=now.month, day=now.day)
  date_claim = create_claim('P813', isReference=True)
  date_claim.setTarget(source_date)
  claim.addSources([source_claim, date_claim], bot=True)

def create_date(date):
  """ give date in format: 'YYYY-MM-DD' """
  fields = date.split('-')
  if len(fields) == 3:
    kwargs = {key:int(fields[i]) for i,key in enumerate(['year','month','day'])}
    return _wiki.WbTime(**kwargs)
  return None

def create_monolingualtext(text, lang):
  """ returns a `WbMonolingualText` object with specified text and language
  @param lang language code (en, de, ...)"""
  return _wiki.WbMonolingualText(text, lang)

def extract_id(url):
  """ Extracts item or property ID from any string."""
  return _re.findall("[PpQq][1-9][0-9]*", url)[0]

def item(id):
  if not id.lower().startswith('q'):
    id = extract_id(id)
  return _wiki.ItemPage(repo, id)


def prop(id):
  if not id.lower().startswith('p'):
    id = extract_id(id)
  return _wiki.PropertyPage(repo, id)


def label(entity):
  labels = entity.get().get('labels', {})
  if 'en' in labels:
    return labels.get('en')
  else:
    for v in labels.values():
      return v

def sparql(query, limit=500):
  _sparqli.setQuery('select * where {{{}}} limit {}'.format(query, limit))
  results = _sparqli.query().convert()
  return results.get('results', {}).get('bindings', [])


def query(query):
    gen = pg.WikidataSPARQLPageGenerator('select ?item where {{{}}}'.format(query))
    return [q for q in gen]
