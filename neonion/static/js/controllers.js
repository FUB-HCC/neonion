var neonionApp = angular.module('neonionApp', []);

neonionApp.controller('WorkspaceDocumentCtrl', ['$scope', '$http', 'WorkspaceService', function ($scope, $http, WorkspaceService) {
    "use strict";

    $http.get('api/workspace/documents/').success(function(data) {
        $scope.documents = data;
    });

    $scope.removeDocument = function (document) {
        var idx = $scope.documents.indexOf(document);
        // TODO add prompt
        WorkspaceService.removeDocument(document.urn);
        $scope.documents.splice(idx, 1);
    };
}])

neonionApp.config(['$httpProvider', function($httpProvider) { // provider-injector
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

neonionApp.factory('WorkspaceService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.removeDocument = function(urn) {
        $http.delete("api/workspace/documents/" + urn + "/", {}).success(function(data) {

        });
    }

    return factory;
}]);