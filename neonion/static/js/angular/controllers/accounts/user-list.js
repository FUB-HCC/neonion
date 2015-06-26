/**
 * Accounts management controller
 */
neonionApp.controller('UserListCtrl', ['$scope', '$http', 'UserService', function ($scope, $http, UserService) {
    "use strict";

    $scope.users = [];

    UserService.getAccounts().then(function (result) {
        $scope.users = result.data;
    });

    $scope.updateUser = function (user, field, value) {
        if (user.hasOwnProperty(field) && user[field] != value) {
            user[field] = value;
            UserService.updateUser(user);
        }
    };

    $scope.deleteUser = function (user) {
        UserService.deleteUser(user).then(function (result) {
            var idx = $scope.users.indexOf(user);
            $scope.users.splice(idx, 1);
        });
    };

}]);