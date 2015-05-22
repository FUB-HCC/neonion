/*jshint jquery:true */

neonionApp.controller('MainCtrl', ['$scope', '$http', 'SearchService', 'AccountService', function ($scope, $http, SearchService, AccountService) {
    "use strict";
    $scope.search = SearchService;

    // get current user
    AccountService.getCurrentUser().then(function (result) {
        $scope.user = result.data;
    });

}]);

/**
 * Accounts management controller
 */
neonionApp.controller('AccountsCtrl', ['$scope', '$http', 'AccountService', function ($scope, $http, AccountService) {
    "use strict";

    $scope.users = [];

    AccountService.getAccounts().then(function (result) {
        $scope.users = result.data;
    });

    $scope.updateUser = function (user, field, value) {
        if (user.hasOwnProperty(field) && user[field] != value) {
            user[field] = value;
            AccountService.updateUser(user);
        }
    };

    $scope.deleteUser = function (user) {
        AccountService.deleteUser(user).then(function (result) {
            var idx = $scope.users.indexOf(user);
            $scope.users.splice(idx, 1);
        });
    };

}]);

/**
 * Group management controller
 */
neonionApp.controller('GroupsCtrl', ['$scope', '$http', 'GroupService', 'AccountService', 'DocumentService',
    function ($scope, $http, GroupService, AccountService, DocumentService) {
        "use strict";

        $scope.groups = [];
        $scope.users = [];
        $scope.documents = [];
        $scope.form = {
            groupName: "",
            selectedGroup: -1
        };

        GroupService.getGroups().then(function (result) {
            $scope.groups = result.data;
        });

        AccountService.getAccounts().then(function (result) {
            $scope.users = result.data;
        });

        DocumentService.getDocuments().then(function (result) {
            $scope.documents = result.data;
        });

        $scope.showMembership = function (group) {
            if ($scope.form.selectedGroup == group.id) {
                $scope.form.selectedGroup = -1;
            }
            else {
                $scope.form.selectedGroup = group.id;
            }
        };

        $scope.createGroup = function () {
            if ($scope.form.groupName.length > 0) {
                var group = {
                    name: $scope.form.groupName
                };
                GroupService.createGroup(group).then(function (result) {
                    $scope.groups.push(result.data);
                });
                $scope.form.groupName = "";
            }
        };

        $scope.deleteGroup = function (group) {
            GroupService.deleteGroup(group).then(function (result) {
                var idx = $scope.groups.indexOf(group);
                $scope.groups.splice(idx, 1);
            });
        };

        $scope.toggleMembership = function (group, user) {
            if (group.members.indexOf(user.id) === -1) {
                $scope.addGroupMember(group, user);
            }
            else {
                $scope.removeGroupMember(group, user);
            }
        };

        $scope.toggleDocumentAssignment = function (group, document) {
            if (group.documents.indexOf(document.id) === -1) {
                $scope.addDocument(group, document);
            }
            else {
                $scope.removeDocument(group, document);
            }
        };

        $scope.addGroupMember = function (group, user) {
            GroupService.addGroupMember(group, user).then(function (result) {
                group.members.push(user.id);
            });
        };

        $scope.removeGroupMember = function (group, user) {
            GroupService.removeGroupMember(group, user).then(function (result) {
                var idx = group.members.indexOf(user.id);
                if (idx > -1) {
                    group.members.splice(idx, 1);
                }
            });
        };

        $scope.addDocument = function (group, document) {
            GroupService.addGroupDocument(group, document).then(function (result) {
                group.documents.push(document.id);
            });
        };

        $scope.removeDocument = function (group, document) {
            GroupService.removeGroupDocument(group, document).then(function (result) {
                var idx = group.documents.indexOf(document.id);
                if (idx > -1) {
                    group.documents.splice(idx, 1);
                }
            });
        };

    }]);

/**
 * Workspace controller
 */
neonionApp.controller('WorkspaceCtrl', ['$scope', '$http', 'AccountService', 'WorkspaceService', 'SearchService',
    function ($scope, $http, AccountService, WorkspaceService, SearchService) {
        "use strict";

        SearchService.enabled = true;
        $scope.search = SearchService;

        $scope.allowRemove = false;
        $scope.allowImport = false;
        $scope.showWorkspaceName = false;

        $scope.initPrivateWorkspace = function () {
            $scope.allowRemove = true;
            $scope.allowImport = true;
            AccountService.getCurrentUser().then(function (result) {
                $scope.user = result.data;
                $scope.workspaces = [{id: $scope.user.email, name: 'Private', documents: result.data.owned_documents}];
            });
        };

        $scope.initPublicWorkspace = function () {
            AccountService.getCurrentUser().then(function (result) {
                var user = result.data;
                AccountService.getEntitledDocuments(user).then(function (result) {
                    // filter for group public
                    $scope.workspaces = result.data.filter(function (element) {
                        return element.id == 1;
                    });
                });
            });
        };

        $scope.initGroupWorkspace = function () {
            $scope.showWorkspaceName = true;
            AccountService.getCurrentUser().then(function (result) {
                var user = result.data;
                AccountService.getEntitledDocuments(user).then(function (result) {
                    $scope.workspaces = result.data.filter(function (element) {
                        return element.id != 1;
                    });
                });
            });
        };

        $scope.removeDocument = function (workspace, document) {
            // allow remove on private workspace
            if (workspace.id == $scope.user.email) {
                WorkspaceService.removeDocument($scope.user, document.id).then(function (result) {
                    var idx = workspace.documents.indexOf(document);
                    workspace.documents.splice(idx, 1);
                });
            }
        };

        $scope.filterDocuments = function (document) {
            if ($scope.search.query.length > 0) {
                // do something with $scope.search.query
                return document.title.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
            }
            return true;
        };

    }]);

/**
 * Import controller
 */
neonionApp.controller('WorkspaceImportCtrl', ['$scope', '$http', 'DocumentService', function ($scope, $http, DocumentService) {
    "use strict";

    $http.get('/documents/cms/list').success(function (data) {
        $scope.documents = data;
    });

    $scope.init = function () {
        $("#document-import-list").selectable();
    };

    $scope.importDocuments = function () {
        var selectedDocs = [];
        $('#document-import-list>.ui-selected').each(function () {
            selectedDocs.push(this.id);
        });
        DocumentService.importDocuments(selectedDocs).then(function (data) {
            // return to home
            window.location = "/";
        });
    };

}]);

neonionApp.controller('AnnotationSetCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/annotationsets').success(function (data) {
        $scope.annotationsets = data;
    });

}]);

neonionApp.controller('AnnotationStoreCtrl', ['$scope', '$http', 'SearchService', function ($scope, $http, SearchService) {
    "use strict";

    SearchService.enabled = true;
    $scope.search = SearchService;

    $http.get('/api/store/filter').success(function (data) {
        var occurrences = {};
        var filterUserData = data.rows.filter($scope.isSemanticAnnotation);

        filterUserData.forEach(function (a) {
            var rdf = a.rdf;
            var key = a.quote + rdf;
            var ann = a.quote;
            var type = rdf.typeof;
            var date = a.created;
            var doc = a.uri;

            var typeParts = type.split('/');
            var concept = typeParts[typeParts.length - 1];

            if (!(key in occurrences)) {
                occurrences[key] = {ann: ann, count: 1, typeof: concept, last: date, docs: new Array()};
            } else {
                occurrences[key].count++;
                var parsedDate = Date.parse(date);
                var parsedOld = Date.parse(occurrences[key].last);
                if (parsedDate > parsedOld) {
                    occurrences[key].last = date;
                }
            }

            if (((occurrences[key].docs).indexOf(doc)) == -1) {
                occurrences[key].docs.push(doc);
            }
        });
        var keys = Object.keys(occurrences);
        $scope.occurrences = keys.map(function (k) {
            return occurrences[k];
        });
    });

    $scope.isSemanticAnnotation = function(annotation) {
        if (annotation.hasOwnProperty("rdf")) {
            return true;
        }
        return false;
    };

    $scope.filterAnnotations = function (occurrence) {
        if ($scope.search.query.length > 0) {
            return occurrence.ann.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
        }
        return true;
    };
}]);

neonionApp.controller('AnnOccurCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    "use strict";

    var docs = {};
    var ann_occur = {};
    var url = $location.absUrl().split('/');
    var quote = url[url.length - 1];

    $scope.getOccurrences = function () {
        $http.get('/api/store/filter?quote=' + quote).success(function (data) {
            var filterUserData = data.rows;

            filterUserData.forEach(function (a) {
                if (decodeURI(quote) === a.quote) {
                    var key = a.id;
                    var ann = a.quote;
                    var date = a.created;
                    var context = a.context;
                    var contextRight = context.right;
                    var contextLeft = context.left;

                    var urns = Object.keys(docs);

                    urns.forEach(function (c) {
                        if (c == a.uri) {
                            ann_occur[key] = {}
                            ann_occur[key].title = docs[a.uri];
                            ann_occur[key].created = date;
                            ann_occur[key].ann = ann;
                            ann_occur[key].contextRight = contextRight;
                            ann_occur[key].contextLeft = contextLeft;
                        }
                        ;
                    });
                }
            });
        });
        $scope.ann_occur = ann_occur;
    };

    $http.get('/api/documents').success(function (data) {
        data.forEach(function (a) {
            var title = a.title;
            var urn = a.id;
            docs[urn] = title;
        });
        $scope.getOccurrences();
    });
}]);

neonionApp.controller('AnnDocsCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    "use strict";
    var ann_docs = {};
    var url = $location.absUrl().split('/');
    var quote = url[url.length - 1];

    $http.get('/api/documents').success(function (data2) {
        data2.forEach(function (b) {
            var urn = b.id;
            var title = b.title;

            $http.get('/api/store/filter?quote=' + quote).success(function (data) {
                var filterUserData = data.rows;

                filterUserData.forEach(function (a) {
                    if (decodeURI(quote) === a.quote) {
                        if (!(urn in ann_docs) && urn == a.uri) {
                            ann_docs[urn] = {urn: urn, title: title};
                        }
                    }
                });
            });
        });
    });
    $scope.ann_docs = ann_docs;
}]);

/**
 * Annotator controller
 */
neonionApp.controller('AnnotatorCtrl', ['$scope', '$http', '$location', '$sce', 'AccountService', 'AnnotatorService', 'DocumentService',
    function ($scope, $http, $location, $sce, AccountService, AnnotatorService, DocumentService) {
        "use strict";

        $scope.initialize = function (params) {
            $scope.params = params;

            DocumentService.getDocument(params.docID)
                .then(function (document) {
                    $scope.document = document.data;
                    if ($scope.document.hasOwnProperty("attached_file")) {
                        $scope.documentUrl = "/documents/viewer/" + $scope.document.attached_file.id;
                    }
                });
        };

        $scope.setupAnnotator = function (params) {
            AccountService.getCurrentUser()
                .then(function (user) {
                    params.agent = {
                        id: user.data.id,
                        email: user.data.email
                    };
                })
                .then(function() {
                    var queryParams = $location.search();

                    $("#document-body").annotator()
                        // add store plugin
                        .annotator('addPlugin', 'Store', {
                            prefix: '/api/store',
                            showViewPermissionsCheckbox: false,
                            showEditPermissionsCheckbox: false,
                            annotationData: {
                                uri: params.docID
                            },
                            loadFromSearch: {'limit': 0}
                        })
                        // add neonion plugin
                        .annotator('addPlugin', 'Neonion', {
                            uri: params.docID,
                            agent: params.agent,
                            workspace: queryParams.workspace
                        })
                        // add NER plugin
                        .annotator('addPlugin', 'NER', {
                            uri: params.docID,
                            service: params.nerUrl,
                            auth: params.nerAuth
                        });


                    // get annotator instance and subscribe to events
                    $scope.annotator = $("#document-body").data("annotator");
                    AnnotatorService.annotator($scope.annotator);
                    $scope.annotator
                        .subscribe("annotationCreated", $scope.handleAnnotationEvent)
                        .subscribe("annotationUpdated", $scope.handleAnnotationEvent)
                        .subscribe("annotationDeleted", $scope.handleAnnotationEvent)
                        .subscribe('annotationsLoaded', function (annotations) {
                            $scope.$apply(function () {
                                AnnotatorService.refreshContributors();
                                // colorize each annotation
                                annotations.forEach(AnnotatorService.colorizeAnnotation);
                            });

                            // go to annotation given by hash
                            if (queryParams.hasOwnProperty("annotation")) {
                                $scope.scrollToAnnotation(queryParams.annotation);
                            }
                        });
                })
                .then($scope.loadAnnotationSet)
        };

        $scope.loadAnnotationSet = function () {
            $http.get('/api/annotationsets').success(function (data) {
                $scope.annotationsets = data;
                if ($scope.annotationsets.length > 0) {
                    var sets = {};
                    // TODO just take the first AS
                    $scope.annotationsets[0].concepts.forEach(function (item) {
                        sets[item.uri] = {
                            label: item.label
                        };
                    });

                    $scope.annotator.plugins.Neonion.annotationSets(sets);
                }
            });
        };

        $scope.handleAnnotationEvent = function (annotation) {
            $scope.$apply(function () {
                AnnotatorService.refreshContributors();
                AnnotatorService.colorizeAnnotation(annotation);
            });
        };
    }]);

/**
 * SPARQL query form controller
 */
neonionApp.controller('QueryCtrl', ['$scope', function ($scope) {
    "use strict";

    $scope.form = {
        prefixes: "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        query: "SELECT * {\n" +
        "\t?uri rdf:type <http://neonion.org/concept/person> .\n" +
        "\t?uri rdfs:label ?name\n" +
        "}\nLIMIT 50"
    };

    $scope.endpoint = "endpoint/query";

    $scope.executeQuery = function () {
        var q = new sgvizler.Query();
        q.query($scope.form.query).
            endpointURL($scope.endpoint).
            endpointOutputFormat("json").
            chartFunction("google.visualization.Table").
            draw("query-result");
    };

}]);

/**
 * NER model controller
 */
neonionApp.controller('NamedEntityCtrl', ['$scope', function ($scope) {
    "use strict";

    $scope.models = [
        {
            identifier: "Standard",
            parameters: [
                {label: "Name", type: "string", restriction: "must be unique", default: "Standard", updatable: false},
                {
                    label: "Stanford Model",
                    type: "string",
                    restriction: "available model in classifiers",
                    default: "dewac_175m_600",
                    updatable: true
                },
                {
                    label: "Learn-network: number of hidden layer components",
                    type: "integer",
                    restriction: "",
                    default: 10,
                    updatable: false
                },
                {
                    label: "Learn-Network: Initialize",
                    type: "string",
                    restriction: "Random or Standard",
                    default: "Standard",
                    updatable: false
                },
                {label: "Predictor: Learn", type: "boolean", restriction: "", default: false, updatable: true},
                {label: "Learn-Network: Learn", type: "boolean", restriction: "", default: false, updatable: true},
                {
                    label: "Predictor: Inverse of Regularization Strength",
                    type: "float",
                    restriction: "> 0",
                    default: 1000,
                    updatable: false
                }
            ]
        }
    ];
}]);

neonionApp.controller('MetaDataCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";
    $scope.primaryMetaData = ['Title', 'Creator', 'Type'];

    $scope.secondaryMetaData = ['Contributor', 'Coverage', 'Date', 'Description',
        'Format', 'Identifier', 'Language', 'Publisher', 'Relation',
        'Rights', 'Source', 'Subject'];

    $scope.metaDataValues = {};

    var metaData = $scope.primaryMetaData.concat($scope.secondaryMetaData);

    var definitions = {
        'Title': 'A name given to the resource.',
        'Creator': 'An entity primarily responsible for making the resource.',
        'Type': 'The nature or genre of the resource.',
        'Contributor': 'An entity responsible for making contributions to the resource.',
        'Coverage': 'The spatial or temporal topic of the resource, the spatial applicability of the resource, or the jurisdiction under which the resource is relevant.',
        'Date': 'A point or period of time associated with an event in the lifecycle of the resource.',
        'Description': 'An account of the resource.',
        'Format': 'The file format, physical medium, or dimensions of the resource.',
        'Identifier': 'An unambiguous reference to the resource within a given context.',
        'Language': 'A language of the resource.',
        'Publisher': 'An entity responsible for making the resource available.',
        'Relation': 'A related resource.',
        'Rights': 'Information about rights held in and over the resource.',
        'Source': 'A related resource from which the described resource is derived.',
        'Subject': 'The topic of the resource.'
    };

    metaData.forEach(function (entry) {
        $scope.metaDataValues[entry] = {};
        $scope.metaDataValues[entry].value = "";
        $scope.metaDataValues[entry].checked = false;
        $scope.metaDataValues[entry].definition = definitions[entry];
    });

    $scope.fileLoad = function ($files) {
        /* TODO */
    }
}]);

/**
 * AnnotatorMenu controller
 */
neonionApp.controller('AnnotatorMenuCtrl', ['$scope', '$http', 'AnnotatorService', function ($scope, $http, AnnotatorService) {
    "use strict";

    $scope.annotatorService = AnnotatorService;
    $scope.active = -1;
    $scope.mode = {
        freetext: Annotator.Plugin.Neonion.prototype.annotationModes.freeTextAnnotation,
        semantic: Annotator.Plugin.Neonion.prototype.annotationModes.semanticAnnotation
      };

    // for closing the submenu if clicked anywere except the menu itself
    angular.element(document).ready(function () {
        $(document).mouseup(function (e) {
            var navigation = $(".nav-vertical");
            if ( !navigation.is(e.target) && navigation.has(e.target).length === 0) {
                $scope.closeSubMenus();
                $scope.$apply();
            }
        });
    });

    $scope.scrollToLastAnnotation = function () {
        var annotation = AnnotatorService.annotator().plugins.Neonion.getLastAnnotation();
        if (annotation) {
            AnnotatorService.scrollToAnnotation(annotation);
        }
    };

    $scope.toggleSubMenu = function (index) {
        if (index == $scope.active) {
            $scope.closeSubMenus();
        } else {
            $scope.active = index;
        }
    };

    $scope.closeSubMenus = function () {
        $scope.active = -1;
    }

    $scope.getAnnotationMode = function () {
        if(Annotator && Annotator._instances.length >= 1) {
            return Annotator._instances[0].plugins.Neonion.annotationMode();
        }
        else {
            return 1;
        }
    }

    $scope.setAnnotationMode = function (mode) {
        Annotator._instances[0].plugins.Neonion.annotationMode(mode);
        $scope.closeSubMenus();
    };

    $scope.toggleContributor = function (contributor) {
        var annotations = Annotator._instances[0].plugins.Neonion.getUserAnnotations(contributor.user);
        if (!contributor.showAnnotation) {
            annotations.forEach(function (item) {
                Annotator._instances[0].plugins.Neonion.showAnnotation(item);
                AnnotatorService.colorizeAnnotation(item);
            });
            contributor.showAnnotation = true;

        } else {
            annotations.forEach(Annotator._instances[0].plugins.Neonion.hideAnnotation);
            contributor.showAnnotation = false;
        }
    };

}]);