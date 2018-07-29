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
The user interface provides a document tool which allows for upload and management of text files. User and group management and a permission system for "public", "group” and "private" contexts are included. Users can work collaboratively in teams and share documents and annotations. (See also our publications about neoinon: [Breitenfeld2018],[Breitenfeld2017])

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

There are mainly four kinds of data in neonion: document, account (user, group and permission), vocabulary (concepts and properties used by semantic annotations) and annotation. The document, account, and vocabulary data are stored in django built-in sqlite database named `db.sqlite3` located in the project root directory. The annotation data are stored in Elasticsearch annotations stored accessible at `http://localhost:9200/neonion/_search` (if you setup by following the [Readme.md](Readme.md)).
For each kind of data, we briefly describe where and how the data is stored.

#### document

Document data is stored in sqlite database. The tables are `documents_document` and `documents_file`. Correspondingly in `./documents/models.py`, there are `Document` and `File`. A `File` contains the raw data of the file. A `Document` is used in annotating and contains meta data about the `File` attached, e.g. title, creator, contributor, language, concept set (see also "vocabulary" section), etc.

#### account

Account data is stored in sqlite database. The tables are `accounts_*`. Correspondingly in `./accounts/models.py`, there are `User` and `WorkingGroup`.

A User can own a WorkingGroup. A User can have one or more documents.
A WorkingGroup can have many users as members. The member relationship is defined as `Membership`. A WorkingGroup is tied to a ConceptSet (see "vocabulary" section). This means that a WorkingGroup (their members) can decide and agree on what vocabulary they want to use for annotating.

#### vocabulary: semantic anotation model

Vocabulary are concepts and properties that are used in semantic annotation, e.g. semantic tagging and semantic linking ([Breitenfeld2018], [Breitenfeld2017]).
Vocabulary data is stored in sqlite database. The table are `annotationsets_*`.
Correspondingly in in `./annotationsets/models.py`, there are `Concept`, `Property`, `ConceptSet`, `LinkedConcept`, etc.

A `Concept` can have many `Property`s. A `Property` has a range that can be many `Concept`s.
In this way, we can express a triple structure: "Subject - Predicate — Object" (SPO). A resource (subject) has a property (predicate) with a value (object). A resource can be identified by semantic tagging.

A `ConcetSet` has one or many concepts associated. This is related to a WorkingGroup such that each group can have its own concepts and properties by that members can use to annotate collaboratively.

A `LinkedConcept` is a concept in then external ontology. At the moment, neonion only support the concept "Person" in Wikidata.

#### annotation

Annotations are highlight, comment and semantic annotation.
The annotation data is stored in Elasticsearch annotation store.

## How to add a new type of document/annotation?

## How to add/change endpoints for the API?

[breitenfeld2018]: https://www.degruyter.com/view/j/icom.2018.17.issue-1/icom-2018-0005/icom-2018-0005.xml?intcmp=trendmd
[breitenfeld2017]: https://dl.gi.de/bitstream/handle/20.500.12116/3264/2017_MCI_231.pdf?sequence=1&isAllowed=y
