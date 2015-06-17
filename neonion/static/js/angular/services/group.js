/**
 * Service for groups
 */
neonionApp.factory('GroupService', ['$http', function ($http) {
    "use strict";
    var factory = {};

    factory.getGroups = function () {
        return $http.get('/api/groups');
    };

    factory.createGroup = function (group) {
        return $http.post("/api/groups/create_group", group);
    };

    factory.deleteGroup = function (group) {
        return $http.delete("/api/groups/" + group.id + "/delete_group", group);
    };

    factory.addGroupMember = function (group, user) {
        return $http.post("/api/groups/" + group.id + "/add_member", user);
    };

    factory.removeGroupMember = function (group, user) {
        return $http.post("/api/groups/" + group.id + "/remove_member", user);
    };

    factory.addGroupDocument = function (group, document) {
        return $http.post("/api/groups/" + group.id + "/add_document", document);
    };

    factory.removeGroupDocument = function (group, document) {
        return $http.post("/api/groups/" + group.id + "/remove_document", document);
    };

    return factory;
}]);