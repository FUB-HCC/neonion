/**
 * User list controller
 */
neonionApp.controller('UserListCtrl', ['$scope', 'UserService',
    function ($scope, UserService) {
    "use strict";

    $scope.users = UserService.query();

    $scope.update = function (user, field, value) {
        if (user.hasOwnProperty(field) && user[field] != value) {
            user[field] = value;
            user.$update();
        }
    };

    $scope.delete = function (user) {
        user.$delete().then(function () {
            var idx = $scope.users.indexOf(user);
            $scope.users.splice(idx, 1);
        });
    };

}]);