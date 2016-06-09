/**
 * Main controller for the whole application
 */
neonionApp.controller('MainCtrl', ['$scope', 'CommonService',
    function ($scope, CommonService) {
    "use strict";
    $scope.common = CommonService;

    $scope.getCurrentUser = function () {
            return CommonService.getCurrentUser(function (user) {
                $scope.user = user;
            }).$promise;
        };

    $scope.getCurrentUser()
}]);