neonionApp.factory('DocumentService', ['$http', function ($http) {
    "use strict";
    var factory = {};

    factory.getDocument = function (docID) {
        return $http.get('/api/documents/' + docID);
    };

    factory.getFile = function (document) {
        return $http.get('/documents/viewer/' + document.attached_file.id);
    };

    factory.getDocuments = function () {
        return $http.get('/api/documents');
    };

    factory.importDocuments = function (arr) {
        return $http.post("/documents/cms/import", {documents: arr});
    };

    return factory;
}]);