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

neonionApp.factory('AccountService', ['$http', function($http) {
    "use strict";
    var factory = {};

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

neonionApp.factory('GroupService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.createGroup = function(group) {
        return $http.post("/api/groups", group);
    };

    factory.updateGroup = function(group) {
        return $http.put("/api/groups/" + group.id, group);
    };

    factory.deleteGroup = function(group) {
        return $http.delete("/api/groups/" + group.id, group);
    };

    return factory;
}]);

neonionApp.factory('WorkspaceService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.removeDocument = function(urn) {
        return $http.delete("api/workspace/documents/" + urn + "/", {});
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