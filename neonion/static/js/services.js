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