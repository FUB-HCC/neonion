neonionApp.factory('WorkspaceService', ['$http', function ($http) {
    "use strict";
    var factory = {};

    factory.addDocument = function (user, docID) {
        return $http.post("api/users/" + user.id + "/add_document", {doc_id: docID});
    };

    factory.removeDocument = function (user, docID) {
        return $http.post("api/users/" + user.id + "/hide_document", {doc_id: docID});
    };

    return factory;
}]);