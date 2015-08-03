/**
 * Service for accounts
 */
neonionApp.factory('UserService', ['$http', function ($http) {
    "use strict";
    var factory = {};

    factory.getCurrentUser = function () {
        return $http.get('/api/users/current');
    };

    factory.getAccounts = function () {
        return $http.get('/api/users');
    };

    factory.getEntitledDocuments = function (user) {
        return $http.get('/api/users/' + user.id + "/entitled_documents");
    };

    factory.createUser = function (user) {
        return $http.post("/api/users", user);
    };

    factory.updateUser = function (user) {
        return $http.put("/api/users/" + user.id, user);
    };

    factory.deleteUser = function (user) {
        return $http.delete("/api/users/" + user.id, user);
    };

    return factory;
}]);

neonionApp.factory('User1Service', ['$resource',
    function ($resource) {
        return $resource('/api/users/:userId',
            {userId: '@id'},
            {
                'current': {
                    method: 'GET',
                    params: {},
                    isArray: false,
                    url: '/api/users/current'
                }
            }
        );
    }]);