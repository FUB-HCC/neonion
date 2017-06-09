neonionApp.factory('WorkspaceService', ['$http', function ($http) {
    "use strict";
    var factory = {};

    factory.addDocument = function (user, docID) {
        return $http.post("api/users/" + user.id + "/add_document", {doc_id: docID});
    };

    //TODO Create an Endpoint
    factory.modifyDocument = function(user, docID) {
        return $http.post("api/documents/" + docID + "/modify_document");
    }

    factory.removeDocument = function (user, docID) {
        return $http.post("api/users/" + user.id + "/hide_document", {doc_id: docID});
    };

    return factory;
}]);
