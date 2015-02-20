neonionApp.controller('WorkspaceDocumentCtrl', ['$scope', '$http', 'WorkspaceService', function ($scope, $http, WorkspaceService) {
    "use strict";

    $http.get('/api/workspace/documents/').success(function(data) {
        $scope.documents = data;
    });

    $scope.removeDocument = function (document) {
        var idx = $scope.documents.indexOf(document);
        // TODO add prompt
        WorkspaceService.removeDocument(document.urn);
        $scope.documents.splice(idx, 1);
    };
}]);

neonionApp.controller('WorkspaceImportCtrl', ['$scope', '$http', 'DocumentService', function ($scope, $http, DocumentService) {
    "use strict";

    $http.get('/documents/cms/list').success(function(data) {
        $scope.documents = data;
    });

    $scope.init = function () {
        $("#document-import-list").selectable();
    };

    $scope.importDocuments = function () {
        var selectedDocs = [];
        $('#document-import-list>.ui-selected').each(function() {
            selectedDocs.push(this.id);
        });
        DocumentService.importDocuments(selectedDocs);
    };

}]);

neonionApp.controller('AnnotationSetCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/annotationsets').success(function(data) {
        $scope.annotationsets = data;
    });

}]);

neonionApp.controller('AnnotationStoreCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/store/filter').success(function(data) {
        var occurrences = {};
        var filterUserData = data.rows;

        filterUserData.forEach(function(a) {
            var rdf = a.rdf;
            var key = a.quote + rdf;
            var ann = a.quote;
            var type = rdf.typeof;
            var date = a.created;
            var doc = a.uri;

            if (!(key in occurrences)) {
                occurrences[key] = {ann: ann, count:  1, typeof: type, last: date, docs: new Array()};
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
        $scope.occurrences = occurrences;
        console.log(occurrences);
    });
}]);

neonionApp.controller('AnnOccurCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/store/filter').success(function (data) {
        var ann_occur = {};
        var filterUserData = data.rows;

        filterUserData.forEach(function(a) {
            // context variable here
            var key = a.id;
            var date = a.created;

            ann_occur[key] = {created: date};

            $http.get('/api/documents').success(function (data) {
                data.forEach(function(a) {
                    var title = a.title;
                    ann_occur[key].title = title;
                });
            });
        });
        $scope.ann_occur = ann_occur;
    });


}]);

neonionApp.controller('AnnDocsCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/documents').success(function (data) {
        var ann_docs = {};

        data.forEach(function(a) {
            var urn = a.urn;
            var title = a.title;

            if (!(urn in ann_docs)) {
                ann_docs[urn] = {urn: urn, title: title};
            }
        });
        $scope.ann_docs = ann_docs;
    });
}]);

neonionApp.controller('AnnotatorCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $scope.setupAnnotator = function(urn, userId) {
        $("#document-body").annotator()
        .annotator('addPlugin', 'Neonion', {
            whoamiUrl: "/accounts/me"
        })
        .annotator('addPlugin', 'Store', {
            prefix: '/api/store',
            annotationData: {'uri': urn},
            // filter annotations by creator
            loadFromSearch: {
                'uri': urn,
                'creator.email': userId,
                'limit': 999999
            }
        });

        $scope.annotator = $("#document-body").data("annotator");
        $scope.loadAnnotationSet();

        /*annotator.subscribe("annotationCreated", function (annotation) {
        notifyEndpoint(annotation);
        //annotationChanged(annotation);
        });*/

        // TODO raise refresh list when store plugin has finished async request
        /*window.setTimeout(function() {
        refreshContributors();
        var users = Annotator.Plugin.Neonion.prototype.getContributors();
        users.forEach(function(user) {
        var annotations = Annotator.Plugin.Neonion.prototype.getUserAnnotations(user);
        annotations.forEach(function(ann){
        colorizeAnnotation(ann);
        });
        });
        }, 1000);*/
    };

    $scope.loadAnnotationSet = function() {
        $http.get('/api/annotationsets').success(function (data) {
            $scope.annotationsets = data;
            if ($scope.annotationsets.length > 0) {
                var sets = {};
                $scope.annotationsets[0].concepts.forEach(function (item) {
                    if (item.uri == 'http://neonion.org/concept/person') {
                        sets[item.uri] = {
                            label: item.label,
                            create: Annotator.Plugin.Neonion.prototype.create.createPerson,
                            search: Annotator.Plugin.Neonion.prototype.search.searchPerson,
                            formatter: Annotator.Plugin.Neonion.prototype.formatter.formatPerson,
                            decorator: Annotator.Plugin.Neonion.prototype.decorator.decoratePerson
                        };
                    }
                    else if (item.uri == 'http://neonion.org/concept/institute') {
                        sets[item.uri] = {
                            label: item.label,
                            create: Annotator.Plugin.Neonion.prototype.create.createInstitute,
                            search: Annotator.Plugin.Neonion.prototype.search.searchInstitute,
                            formatter: Annotator.Plugin.Neonion.prototype.formatter.formatInstitute,
                            decorator: Annotator.Plugin.Neonion.prototype.decorator.decorateInstitute
                        };
                    }
                });

                $scope.annotator.plugins.Neonion.setCompositor(sets);
            }
        });
    };

}]);

neonionApp.controller('NamedEntityCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $scope.models = [
        {
            identifier: 'Standard',
            stanfordModel: 'dewac_175m_600',
            predictorNumberOfComponents: '?',
            predictorNumberOfIterations: '(10^6) / n',
            predictorLossFunction: 'log',
            predictorAlpha: '?',
            numberOfHiddenLayerComponents: 4,
            predictorInitialize: 'Standard',
            learnNetworkInitialize: 'Standard',
            predictorLearn: false,
            learnNetworkLearn: false
        }
    ];
}]);