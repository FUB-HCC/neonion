# Outline

* Our branch model for the repo
* How does neonion work?
* How does neonion handle data?
* How to add/change endpoints for the API?

## Our branch model

##### What is the "master" and "develop" branch for?

Currently, the "develop" branch has the most up-to-date features.
We plan to merge the "develop" branch to the "master" branch.

In the future:

* The "master" branch will be the branch for use
* The "develop" branch will be the staging branch for new features

Note: the "docker" and "documentation" branch are working-in-progress branches for dockerizing the application and for documentation work.

## How does neonion work?

neonion is a web application for the collaborative annotation of text documents.
Currently annotations supported by neonion are highlighting, commenting, and semantic tagging.
The semantic tagging capabilities of neonion feature a flexible knowledge model based on an extensible vocabulary, e.g. concepts and properties.
The user interface provides a document tool which allows for upload and management of text files. User and group management and a permission system for "public", "group” and "private" contexts are included. Users can work collaboratively in teams and share documents and annotations. (See also our publications about neoinon: [Generating Structured Data by Nontechnical Experts in Research Settings](https://www.degruyter.com/view/j/icom.2018.17.issue-1/icom-2018-0005/icom-2018-0005.xml?intcmp=trendmd), [Enabling Structured Data Generation by Nontechnical Experts](https://dl.gi.de/bitstream/handle/20.500.12116/3264/2017_MCI_231.pdf?sequence=1&isAllowed=y))

neonion is separated into a front-end and a back-end part.
Technologies involved in the front-end are AngularJS, and Annotator.js, and in the back-end are Python2.7 with Django 1.8. Databases used are sqlite and Elasticsearch 6.0.

#### AngularJS and Annotator.js

The front-end is a browser-based web application, consisting of a view made up of HTML and CSS, and the controlling code written in JavaScript based on [AngularJS](https://angularjs.org/). The component responsible for the actual annotation interface is based on an existing software library [Annotator](https://github.com/openannotation/annotator/). It provides a general infrastructure to create annotations on top of HTML markup. The software is open-source and also extensible via plugins. The neonion front-end deploys a custom written Annotator plugin to handle annotation semantics and to communicate with the annotation store in the back-end.

#### Django

The back-end of neonion is a server application which uses APIs to communicate with the front-end. It is built upon [Django](https://www.djangoproject.com/) 1.8, a high-level Web framework written in the Python programming language.
Django cares for the JSON HTTP interfaces, the mapping of URIs to handler components and the storage of documents and user, group and permission data, and semantic annotations model (concepts and properties) in sqlite database.

#### Elasticsearch

The actual semantic annotation data is being handed over by Django to [Elasticsearch](https://www.elastic.co/), a NOSQL database application specialized in the storage, indexing, search and retrieval of schema-free JSON data sets. We are using Elasticsearch 6.0.
Elasticsearch is written in the Java programming language. It allows for very fast and efficient persistent saving and loading of annotations, which are being represented as JSON data sets following the W3C [Open Annotation Data Model specification](http://www.openannotation.org/spec/core/).

## How does neonion handle data?

* document
* account
* vocabulary
* annotation

## How to add/change endpoints for the API?
