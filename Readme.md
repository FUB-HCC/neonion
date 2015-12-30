# neonion

neonion is a user-centered, web application for the collaborative annotation of texts developed at the Human-Centered Computing group at Freie Universität Berlin.

neonion supports semantic annotations and open standards but does not presuppose any knowledge about the technologies involved. It is the perfect fit for people who want their annotations to be exchangeable between different tools and projects. Moreover, your annotations can be connected to the linked data cloud.

The usage of neonion is explained in the [user's manual](http://fub-hcc.github.io/neonion/).


## Prerequisites

For neonion you need Python with Django installed. 
In addition, a set of tools and services is needed:

* [Python](https://www.python.org) (Python 2 >=2.7) with `pip` and `virtualenv`
* [ElasticSearch](https://www.elastic.co) (>=1.0.0)
* [Annotator Store](https://github.com/openannotation/annotator-store)
* **Optional** 
  * [Sesame](http://rdf4j.org) (>=2.7)

If you want to use ports other than the default ports you can change the environment settings under `settings/`.

## Getting started

Create a virtualenv and install the dependencies for neonion:

```
virtualenv -p /usr/bin/python2.7 pyenv
source pyenv/bin/activate
pip install -r neonion/requirements.txt
```
Setup neonion and startup the server:

```
source pyenv/bin/activate
cd neonion
python manage.py migrate
python manage.py loaddata fixtures/*
python manage.py runserver
```
You should now see something like:

```
Django version 1.7, using settings 'settings.development'
Starting development server at http://127.0.0.1:8000/
```
Open your browser and navigate to [http://127.0.0.1:8000](http://127.0.0.1:8000).
By default there are two predefined accounts `neonion-admin@fu-berlin.de` and `neonion-test@fu-berlin.de`. Both have the default password `neonion` but different rights.

## Import the knowledge base from Wikidata

When neonion is running you can import the provided person data with:

```
source pyenv/bin/activate
cd neonion
python common/knowledge/wikidata/wd_import.py -f elasticsearch/wikidata/
```
## License

GPL2: [http://www.gnu.org/licenses/gpl-2.0.html](http://www.gnu.org/licenses/gpl-2.0.html)
