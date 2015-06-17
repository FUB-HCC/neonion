/**
 * Accounts management controller
 */
neonionApp.controller('AccountsCtrl', ['$scope', '$http', 'AccountService', function ($scope, $http, AccountService) {
    "use strict";

    $scope.users = [];

    AccountService.getAccounts().then(function (result) {
        $scope.users = result.data;
    });

    $scope.updateUser = function (user, field, value) {
        if (user.hasOwnProperty(field) && user[field] != value) {
            user[field] = value;
            AccountService.updateUser(user);
        }
    };

    $scope.deleteUser = function (user) {
        AccountService.deleteUser(user).then(function (result) {
            var idx = $scope.users.indexOf(user);
            $scope.users.splice(idx, 1);
        });
    };

}]);