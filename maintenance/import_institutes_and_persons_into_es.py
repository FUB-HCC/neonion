import json
from datetime import datetime
from pyelasticsearch import ElasticSearch
es = ElasticSearch('http://localhost:9200/')


done = 0
institutes = []
for line in open('institutes.json'):
  line = line.strip()
  institute = json.loads( line )
  institute['uri'] = 'http://wikidata.org/wiki/'+institute['id']

  institutes.append( institute )
  done += 1

  if( done % 5000 == 0 ):
    es.bulk_index( 'institutes', 'institute', institutes, id_field='id' )
    institutes = []


  if done%10000 == 0:
    print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))

if len(institutes) > 0:
    es.bulk_index( 'institutes', 'institute', institutes, id_field='id' )
print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))


done = 0
persons = []
for line in open('persons.json'):
  line = line.strip()
  person = json.loads( line )
  person['uri'] = 'http://wikidata.org/wiki/'+person['id']

  persons.append( person )
  done += 1

  if( done % 5000 == 0 ):
    es.bulk_index( 'persons', 'person', persons, id_field='id' )
    persons = []


  if done%10000 == 0:
    print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))

if len(persons) > 0:
    es.bulk_index( 'persons', 'person', persons, id_field='id' )
print(  datetime.now().strftime("%H:%M:%S"),format(done,',d'))

