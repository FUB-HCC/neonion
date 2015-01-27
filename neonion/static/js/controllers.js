var neonionApp = angular.module('neonionApp', []);

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

neonionApp.controller('AnnotationCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/store/annotations').success(function(data) {
        $scope.annotations = data;
    });

}]);

neonionApp.controller('ContentManagementCtrl', ['$scope', '$http', 'DocumentService', function ($scope, $http, DocumentService) {
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

neonionApp.config(['$httpProvider', function($httpProvider) { // provider-injector
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

neonionApp.factory('WorkspaceService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.removeDocument = function(urn) {
        $http.delete("api/workspace/documents/" + urn + "/", {}).success(function(data) {});
    };

    return factory;
}]);

neonionApp.factory('DocumentService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.importDocuments = function(arr) {
        $http.post("/documents/cms/import", { documents : arr }).success(function(data) {
            // return to home
            window.location = "/";
        });
    };

    return factory;
}]);