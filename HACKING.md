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

#### account and permission

Account data is stored in sqlite database. The tables are `accounts_*`. Correspondingly in `./accounts/models.py`, there are `User` and `WorkingGroup`.

A User can own a WorkingGroup. A User can have one or more documents.

A WorkingGroup can have many users as members. The member relationship is defined as `Membership`. A WorkingGroup is tied to a `ConceptSet` (see "vocabulary" section). This means that a WorkingGroup (their members) can decide and agree on what vocabulary they want to use for annotating.
A WorkingGroup also have a set of `Document`s that only the group members can access.

#### vocabulary: semantic annotation model

Vocabulary are concepts and properties that are used in semantic annotation, e.g. semantic tagging and semantic linking ([Breitenfeld2018], [Breitenfeld2017]).
Vocabulary data is stored in sqlite database. The table are `annotationsets_*`.
Correspondingly in in `./annotationsets/models.py`, there are `Concept`, `Property`, `ConceptSet`, `LinkedConcept`, etc.

A `Concept` can have many `Property`s. A `Property` has a range that can be many `Concept`s.
In this way, we can express a triple structure: "Subject - Predicate — Object" (SPO) for describing a relationship between a subject and an object.
(To understand the design of our semantic annotation model, please see our publications for more details)

A `ConcetSet` has one or many concepts associated. This is tied to a WorkingGroup such that each group can have its own concepts and properties by that members can use to annotate collaboratively.

A `LinkedConcept` is a concept in then external ontology. At the moment, neonion only support the concept "Person" in Wikidata.

#### annotation

Annotations are highlight, comment and semantic annotation.
While semantic annotation model is stored in a sqlite database, the actual annotation data is stored in Elasticsearch annotation store.
The annotation extensively uses the functionality provided by the Annotator.js core.

With respect to the data storage, Annotator.js introduces an own annotation format.
However, at the time of developing neonion, the format is not compliant with the [Open Annotation](http://www.openannotation.org/spec/core/) (OA) data model yet.

It was necessary to design a solution so that the default format and the OA extension can coexist.
The data structure was embed the entire OA annotation as sub-field in the annotation object.
Following the recommendation of the OA community, the embedded annotation is stored as JSON-LD (JavaScript Object Notation for Linked Data). For example, relationship annotations were named as Linked Annotations in neonion due to the motivation oa:linking.

The schema can be found in the endpoint by default:

* http://localhost:9200/neonion

The annotation data can be found in the endpoints by default:

* from ElasticSearch store:
  http://localhost:9200/neonion/_search
* from neonion endpoint:
  http://localhost:8000/store/search

The fields related to OA in an annotation mainly contains the following parts:

* `oa`:
  * `motivatedBy`: possible values are for example, `oa:highlighting` for highlight annotation, `oa:classifying` for identifying (classifying) annotation with a concept, `oa:identifying` for identifying annotation with a concept that is in wikidata (an external knowledge base, a linked data cloud), `oa:linking` for linking relationship between annotations having `oa:classifying` or `oa:identifying` attribute.
  * `hasBody`: for enriching body
    * `@id`:
    * ...
  * `hasTarget`: for enriching target
    * `@id`:
    * `hasSource`:
    * `hasSelector`:
    * ...

You can find this information in `store/views.py`, in the class `AnnotationListView`.

The fields relate to `permission` are:
`read`, `update`, `delete`, `admin` for who and which group can access the annotation.

## How to add a new type of document?

Currently, neonion support file (pdf, txt, html) as document type. If you want to support image as document type for example, you may investigate in the following places.

* In `documents/views.py`, check the `upload_file` function. In the function, you can find where the document is getting created.
* In `documents/models.py`, check the `DocumentManager` class. Based on your desired file.content_type, you need to add corresponding parts for creating and handling it. If needed, adapt the `Document` and `File` class.
* In `documents/views.py`, check the `viewer` function. Based on what you had changed in the `File`, update the part of response, e.g. `str(f.raw_data)` correspondingly.

## How to add a new type of annotation?

Depends on what kinds of annotation you want to create, preferably using a suitable type recommended by [OA] and adapt it in `oa`. Assumingly we want to describe something, we can therefore use `oa:describing` as motiviation. We here briefly demonstate how to base on the existing Comment annotation type and extend it to a Describing type of annotation.
We show here some example code snippets.

* in `neonion/static/js/angular/controllers/annotator/annotator-nav.js`, add describing annotation mode:

```javascript
$scope.mode = {
	commenting: {
		shortCut: 'A',
		value: Annotator.Plugin.neonion.prototype.annotationModes.commenting
	},
	// ...
	describing: {
		shortCut: 'F',
		value: Annotator.Plugin.neonion.prototype.annotationModes.describing
	}
};
```

* in `neonion/static/js/angular/controllers/annotations/annotation-list.js`:

```javascript
$scope.filterDescribingAnnotations = function(annotation) {
	if (CommonService.filter.query.length > 0) {
		var show = $scope.filterCommonFields(annotation);
		show |= annotation.text.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
		return show;
	}
	return true;
};
```

* in `neonion/static/js/angular/filters.js`,

```javascript
.filter('filterByDescribingAnnotation', function () {
  return function (annotations) {
    if (!angular.isUndefined(annotations)) {
        return annotations.filter(function (value) {
            return (value['oa']['motivatedBy'] == "oa:describing");
        });
    }
    else {
        return [];
    }
  };
})
```

* in `neonion/static/js/annotator/annotator.neonion.js`,

```javascript
this.initEditorField = function() {
	$('.annotator-editor').append(this.templates.editorLine);
	// create a mapping from motivation to editor field
	var mapping = {};
	mapping[this.oa.motivation.commenting] = this.initCommentField();
	mapping[this.oa.motivation.describing] = this.initCommentField();
	return mapping;
};
```

```javascript
// ...

  annotationModes: {
    commenting: 1,
    // ...
    describing:5
  },
// ...
```

```javascript
// stub representing a description
    createDescribeAnnotationStub: function () {
      return $.extend(true, Annotator.Plugin.neonion.prototype.oa.stubs.createHighlightAnnotationStub(),
        {
          "motivatedBy": "oa:describing",
          "hasBody": {
              "@type": ["dctypes:Text", "cnt:ContentAsText"],
              "chars": ""
          }
        });
    },
// ...
```

```javascript
// prepare annotation according current annotation mode
switch (this.editorState.annotationMode) {
	case this.annotationModes.conceptTagging:
		// ...
		break;
	case this.annotationModes.describing:
		annotation['oa'] = this.oa.stubs.createDescribeAnnotationStub();
		break;
	case this.annotationModes.commenting:
		annotation['oa'] = this.oa.stubs.createCommentAnnotationStub();
		break;
	//...
}
```

```javascript
// annotation editor textarea
  annotationEditorShown: function (editor, annotation) {
      // ...
      switch (annotation['oa']['motivatedBy']) {
          case this.oa.motivation.commenting:
              // ...
              break
          case this.oa.motivation.describing:
              if (!annotation.hasOwnProperty("text")) {
                  $(field)
                      .find("textarea")
                      .val(annotation.quote)
                      .select();
              }
              break
        // ...
      }
  }
```

* in `neonion/static/partials/annotation-list.html`, add an additional tab called "Describing" in Annotation section for listing the created describing annotations.

```html
<li ng-class="{active:tab===4}">
  <a href="" ng-click="tab = 4">Describing</a>
</li>
```

```html
<div ng-switch-when="4">
  <ng-include src="'/static/partials/annotations/describing-list.html'"></ng-include>
</div>
```

* For the annotating page having a describing mode to switch on, in `neonion/static/partials/annotator/annotator-navigation.html`,

```html
<li class="dropdown-item" ng-click="setAnnotationMode(mode.describing.value)">
    <a>
        <i class="fa fa-check fa-fw" ng-class="{invisible: getAnnotationMode()!==mode.describing.value}"></i><span>Describing<small>{{ shortCutModifier.default.modifierText + mode.describing.shortCut }}</small></span>
        <div class="dropdown-item-color annotator-hl-describing"></div>
    </a>
</li>
<li class="dropdown-item" ng-click="setAnnotationMode(mode.commenting.value)">
```

* in `neonion/static/partials/annotations/describing-list.html`, copy the code in `neonion/static/partials/annotations/comment-list.html` and change parts for describing, e.g.

```html
...
<div ng-repeat="(documentKey, annotationByDocument) in annotations | filterByDescribingAnnotation | filter:filterDescribingAnnotations | groupBy: 'uri'">
...
</div>
...
```

* in `neonion/static/js/angular/services/annotator.js`, color for the describing annotation.

```javascript
switch (annotation['oa']['motivatedBy']) {
	// ...
	case Annotator.Plugin.neonion.prototype.oa.motivation.commenting:
		hlClass = 'annotator-hl-comment';
		break;
	case Annotator.Plugin.neonion.prototype.oa.motivation.describing:
		hlClass = 'annotator-hl-describing';
		break;
	// ...
}
```

* in `neonion/static/main.css`, for the new describing annotation styling and color,

```css
.annotator-hl-describing {
	background-color: rgba(103, 140, 120, 0.4);
}
```

_(for this exercise example, you can find the code in here [add-describing-annotation-type](https://github.com/mingtung/neonion/tree/add-describing-annotation-type))_

## How to add/change endpoints for the API?

[breitenfeld2018]: https://www.degruyter.com/view/j/icom.2018.17.issue-1/icom-2018-0005/icom-2018-0005.xml?intcmp=trendmd
[breitenfeld2017]: https://dl.gi.de/bitstream/handle/20.500.12116/3264/2017_MCI_231.pdf?sequence=1&isAllowed=y
