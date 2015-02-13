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

neonionApp.controller('AnnotationStoreCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/store/annotations').success(function(data) {
        $scope.annotations = data;
        var occurrences = {};

        data.forEach(function(a) {
            var annotation = a.quote;
            // var type = a.typeof;
            var date = a.created;
            var key = a.quote;
            var doc = a.uri;

            if (!(key in occurrences)) {
                occurrences[key] = {ann: annotation, count:  1, last: date, docs: new Array()};
            } else {
                occurrences[key].count++;
                var parsedDate = Date.parse(date);
                var parsedOld = Date.parse(occurrences[key].last);
                if (parsedDate > parsedOld) {
                    occurrences[key].last = date;
                }
            }
            var dings = occurrences[key].docs;

            if (((occurrences[key].docs).indexOf(doc)) == -1) {
                occurrences[key].docs.push(doc);
            }
        });
        $scope.occurrences = occurrences;
    });
}]);

neonionApp.controller('AnnotationStoreCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/store/annotations').success(function(data) {
        $scope.annotations = data;
        var occurrences = {};

        data.forEach(function(a) {
            var annotation = a.quote;
            // var type = a.typeof;
            var date = a.created;
            var key = a.quote;
            var doc = a.uri;

            if (!(key in occurrences)) {
                occurrences[key] = {ann: annotation, count:  1, last: date, docs: new Array()};
            } else {
                occurrences[key].count++;
                var parsedDate = Date.parse(date);
                var parsedOld = Date.parse(occurrences[key].last);
                if (parsedDate > parsedOld) {
                    occurrences[key].last = date;
                }
            }
            var dings = occurrences[key].docs;

            if (((occurrences[key].docs).indexOf(doc)) == -1) {
                occurrences[key].docs.push(doc);
            }
        });
        $scope.occurrences = occurrences;
    });
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
        }];
}]);