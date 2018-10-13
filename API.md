# Preparations

Run neonion followed the instructions in README, therefore here we assume that the django application runs on http://localhost:8000, Elasticsearch store runs on http://localhost:9200.

# APIs

All of the APIs in django are routed by django rest_framework.
Currently, the APIs only support for getting data. They are not supporting create, update, delete data. It is currently not possible to get data by some kind of parameters (e.g. id(s), key(s)) either. They simple returns all the data at the specific kinds the endpoint.

## Annotation

### Get all annotations from (1) elasticsearch store

**URL**: `http://localhost:9200/neonion/_search`

**Method**: `GET`

**Return**: a JSON containing all the annotations

Sample JSON response:
By running `curl http://localhost:9200/neonion/_search` in command line,

```json
{
	"took": 94,
	"timed_out": false,
	"_shards": {
		"total": 5,
		"successful": 5,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": 2,
		"max_score": 1,
		"hits": [
			{...},
			{
				"_index": "neonion",
				"_type": "annotation",
				"_id": "65d54678ced911e8bd1e0242ac120003",
				"_score": 1,
				"_source": {
					"updated": "2018-10-13T11:16:14.651621",
					"created": "2018-10-13T11:16:14.651621",
					"quote": "cratic Nation",
					"uri": "ac93538cc28a11e4b948c42c0303b893",
					"oa": {
						"annotatedBy": {
							"mbox": {
								"@id": "mailto:neonion-admin@fu-berlin.de"
							},
							"@id": "http://neonion.org/user/a1b94e3b42e25e09bdd55788304ce428",
							"@type": "foaf:person"
						},
						"motivatedBy": "oa:highlighting",
						"annotatedAt": "2018-10-13T11:16:14.539Z",
						"hasTarget": {
							"@id": "urn:uuid:65d585f2ced911e8bd1e0242ac120003",
							"hasSelector": {
								"conformsTo": "http://tools.ietf.org/rfc/rfc3778",
								"@id": "urn:uuid:65d5f492ced911e8bd1e0242ac120003",
								"@type": "oa:FragmentSelector",
								"value":
									"#page=1&highlight=0.07797897196261683,1,0.002242152466367713,0.998704534130543"
							},
							"@type": "oa:SpecificResource",
							"hasSource": {
								"@id": "http://neonion.org/document/ac93538cc28a11e4b948c42c0303b893",
								"@type": "dctypes:Text"
							}
						},
						"@context": ["http://neonion.org/ns/neonion-context.jsonld"],
						"@id": "http://neonion.org/annotation/65d58476ced911e8bd1e0242ac120003",
						"@type": "oa:Annotation"
					},
					"id": "65d54678ced911e8bd1e0242ac120003",
					"ranges": [
						{
							"start": "/div[1]/p[1]",
							"end": "/div[1]/p[1]",
							"startOffset": 154,
							"endOffset": 167
						}
					],
					"text": "",
					"neonion": {
						"context": {
							"normalizedHighlights": [
								{
									"width": 0.16369742990654207,
									"top": 0.002242152466367713,
									"height": 0.0009466865969108122,
									"left": 0.07797897196261683
								}
							],
							"pageIdx": 0,
							"surrounding": {
								"right": "al Committee (DNC) headquarters at the Watergate office complex in",
								"left": "in the 1970s as a result of the June 17, 1972, break-in at the Demo"
							}
						},
						"creator": "neonion-admin@fu-berlin.de"
					},
					"permissions": {
						"read": ["neonion-admin@fu-berlin.de"],
						"admin": ["neonion-admin@fu-berlin.de"],
						"update": ["neonion-admin@fu-berlin.de"],
						"delete": ["neonion-admin@fu-berlin.de"]
					}
				}
			}
		]
	}
}
```

### Get all annotaions from (2) django application

**URL**: `http://localhost:8000/store/search`

**Method**: `GET`

**Return**: a JSON containing all the annotations

Sample JSON response:

```json
{
	"total": 1,
	"rows": [
		{
			"updated": "2018-09-12T14:47:14.497765",
			"created": "2018-09-12T14:47:14.497765",
			"quote": "John Fitzgerald Kennedy",
			"uri": "688cea47c27f11e494e4c42c0303b893",
			"oa": {
				"annotatedBy": {
					"@id": "http://neonion.org/user/a1b94e3b42e25e09bdd55788304ce428",
					"mbox": {
						"@id": "mailto:neonion-admin@fu-berlin.de"
					},
					"@type": "foaf:person"
				},
				"@type": "oa:Annotation",
				"annotatedAt": "2018-09-12T14:47:11.453Z",
				"hasTarget": {
					"hasSelector": {
						"conformsTo": "http://tools.ietf.org/rfc/rfc3778",
						"@id": "urn:uuid:bce52fe8b69a11e892310242ac120003",
						"@type": "oa:FragmentSelector",
						"value": "#page=1&highlight=0,1,0.00005985873338920148,1"
					},
					"@id": "urn:uuid:bce2979cb69a11e892310242ac120003",
					"@type": "oa:SpecificResource",
					"hasSource": {
						"@id": "http://neonion.org/document/688cea47c27f11e494e4c42c0303b893",
						"@type": "dctypes:Text"
					}
				},
				"@context": ["http://neonion.org/ns/neonion-context.jsonld"],
				"hasBody": {
					"identifiedAs": "http://www.wikidata.org/entity/Q9696",
					"label": "John F. Kennedy",
					"classifiedAs": "http://neonion.org/concept/person",
					"contextualizedAs": "http://neonion.org/person/60e1face379e5fce9aaa7af6b4de0196",
					"@id": "urn:uuid:bce291deb69a11e892310242ac120003",
					"@type": ["oa:SemanticTag", "neo:EntityMention"]
				},
				"@id": "http://neonion.org/annotation/bce28feab69a11e892310242ac120003",
				"motivatedBy": "oa:identifying"
			},
			"neonion": {
				"viewer": {
					"conceptLabel": "Person"
				},
				"context": {
					"normalizedHighlights": [
						{
							"width": 0.27128184157987156,
							"top": 0.00005985873338920148,
							"left": 0,
							"height": 0.0011373159343948283
						}
					],
					"pageIdx": 0,
					"surrounding": {
						"right": " (May 29, 1917 – November 22, 1963), commonly known as Jack Kennedy",
						"left": ""
					}
				},
				"creator": "neonion-admin@fu-berlin.de"
			},
			"ranges": [
				{
					"start": "/div[1]/p[1]/b[1]",
					"end": "/div[1]/p[1]/b[1]",
					"startOffset": 0,
					"endOffset": 23
				}
			],
			"text": "",
			"id": "bce0c8ccb69a11e892310242ac120003",
			"permissions": {
				"read": ["1"],
				"admin": ["neonion-admin@fu-berlin.de"],
				"update": ["1"],
				"delete": ["neonion-admin@fu-berlin.de"]
			}
		}
	]
}
```

## Document

### Get all documents

**URL**: `http://localhost:8000/api/documents`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of all uploaded documents

Sample JSON response:

```json
[
	{
		"id": "688cea47c27f11e494e4c42c0303b893",
		"uri": "http://neonion.org/document/688cea47c27f11e494e4c42c0303b893",
		"title": "John F. Kennedy - Wikipedia",
		"created": "2015-03-04T15:01:59.867000Z",
		"updated": "2015-03-04T15:01:59.867000Z",
		"workinggroup_set": [1],
		"concept_set": "default"
	}
]
```

## User and group

### Get all users

**URL**: `http://localhost:8000/api/users`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of all registered users

Sample JSON response:

```json
[
	{
		"id": 1,
		"email": "neonion-test@fu-berlin.de",
		"is_active": true,
		"is_staff": false,
		"is_superuser": false
	},
	{
		"id": 2,
		"email": "neonion-admin@fu-berlin.de",
		"is_active": true,
		"is_staff": false,
		"is_superuser": true
	}
]
```

### Get all groups

**URL**: `http://localhost:8000/api/groups`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of all created groups.
For each group, it has owner (user id), members (a list of user ids), documents that this group owns, and concept_set this group can use to annotation.

Sample JSON response:

```json
[
	{
		"id": 1,
		"name": "Public",
		"owner": 1,
		"members": [1, 2],
		"documents": [
			"4e41bee6c28111e4b236c42c0303b893",
			"688cea47c27f11e494e4c42c0303b893",
			"ac93538cc28a11e4b948c42c0303b893",
			"ba07e20ac28311e4a5bec42c0303b893"
		],
		"concept_set": "default"
	}
]
```

### Get all memberships

**URL**: `http://localhost:8000/api/memberships`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of all the memberships that are between user and group

Sample JSON response:

```json
[
	{
		"id": 1,
		"user": 1,
		"group": 1,
		"invite_reason": ""
	},
	{
		"id": 2,
		"user": 2,
		"group": 1,
		"invite_reason": ""
	}
]
```

## Vocabulary

### Get all concepts

**URL**: `http://localhost:8000/api/concepts`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of all created concepts

Sample JSON response:

```json
[
	{
		"id": "person",
		"uri": "http://neonion.org/concept/person",
		"label": "Person",
		"comment": "An individual human being",
		"properties": ["has_role", "member_of"],
		"linked_concepts": ["wikidata_person"]
	}
]
```

### Get all properties

**URL**: `http://localhost:8000/api/properties`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of all created properties

Sample JSON response:

```json
[
	{
		"id": "has_role",
		"uri": "http://neonion.org/property/has_role",
		"label": "has role",
		"comment": "",
		"inverse_property": null,
		"range": ["person_function"],
		"linked_properties": []
	}
]
```

### Get all linked concepts

**URL**: `http://localhost:8000/api/linkedconcepts`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of all concepts that links to linked data, e.g. wikidata

Sample JSON response:

```json
[
	{
		"id": "wikidata_person",
		"uri": "http://neonion.org/linkedconcept/wikidata_person",
		"label": "Person@Wikidata",
		"comment": "",
		"endpoint": "https://www.wikidata.org",
		"linked_type": "https://www.wikidata.org/wiki/Q5",
		"custom_query": null,
		"provider_class": "",
		"retrieved_at": null
	}
]
```

### Get all concept sets

**URL**: `http://localhost:8000/api/conceptsets`

**Method**: `GET`

**Return codes**: `200`: OK

**Content-Type**: application/json

**Return**: a list of concept sets

Sample JSON response:

```json
[
	{
		"id": "default",
		"uri": "http://neonion.org/conceptset/default",
		"label": "Default",
		"comment": "The default concept set for annotating documents",
		"concepts": ["consortium", "date", "institution", "person", "person_function"]
	}
]
```
