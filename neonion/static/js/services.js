/**
 * Service for on page search
 */
neonionApp.factory('SearchService', function () {
    "use strict";
    return {
        query : "",
        enabled : false
    };
});

/**
 * Service for accounts
 */
neonionApp.factory('AccountService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.getCurrentUser = function() {
        return $http.get('/api/users/current');
    };

    factory.getAccounts = function() {
        return $http.get('/api/users');
    };

    factory.getEntitledDocuments = function(user) {
        return $http.get('/api/users/' + user.id + "/entitled_documents");
    };

    factory.createUser = function(user) {
        return $http.post("/api/users", user);
    };

    factory.updateUser = function(user) {
        return $http.put("/api/users/" + user.id, user);
    };

    factory.deleteUser = function(user) {
        return $http.delete("/api/users/" + user.id, user);
    };

    return factory;
}]);

/**
 * Service for groups
 */
neonionApp.factory('GroupService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.getGroups = function() {
        return $http.get('/api/groups');
    };

    factory.createGroup = function(group) {
        return $http.post("/api/groups/create_group", group);
    };

    factory.deleteGroup = function(group) {
        return $http.delete("/api/groups/" + group.id + "/delete_group", group);
    };

    factory.addGroupMember = function(group, user) {
        return $http.post("/api/groups/" + group.id + "/add_member", user);
    };

    factory.removeGroupMember = function(group, user) {
        return $http.post("/api/groups/" + group.id + "/remove_member", user);
    };

    factory.addGroupDocument = function(group, document) {
        return $http.post("/api/groups/" + group.id + "/add_document", document);
    };

    factory.removeGroupDocument = function(group, document) {
        return $http.post("/api/groups/" + group.id + "/remove_document", document);
    };

    return factory;
}]);

neonionApp.factory('WorkspaceService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.addDocument = function (user, docID) {
        return $http.post("api/users/" + user.id + "/add_document", { doc_id : docID });
    };

    factory.removeDocument = function(user, docID) {
        return $http.post("api/users/" + user.id + "/hide_document", { doc_id : docID });
    };

    return factory;
}]);

neonionApp.factory('DocumentService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.getDocument = function(docID) {
        return $http.get('/api/documents/' + docID);
    };

    factory.getFile = function(document) {
        return $http.get('/documents/viewer/' + document.attached_file.id);
    };

    factory.getDocuments = function() {
        return $http.get('/api/documents');
    };

    factory.importDocuments = function(arr) {
        return $http.post("/documents/cms/import", { documents : arr });
    };

    return factory;
}]);