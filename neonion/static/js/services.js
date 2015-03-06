/**
 * Service for accounts
 */
neonionApp.factory('AccountService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.getAccounts = function() {
        return $http.get('/api/users');
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

    factory.getWorkspace = function() {
        return $http.get('/api/workspace');
    };

    factory.addDocument = function () {
        return $http.post("api/workspace/documents/" + pk, {});
    };

    factory.removeDocument = function(pk) {
        return $http.delete("api/workspace/documents/" + pk, {});
    };

    return factory;
}]);

neonionApp.factory('DocumentService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.importDocuments = function(arr) {
        return $http.post("/documents/cms/import", { documents : arr });
    };

    return factory;
}]);