/**
 * Main controller for the whole application
 */
neonionApp.controller('MainCtrl', ['$scope', '$http', 'CommonService', 'UserService',
    function ($scope, $http, CommonService, UserService) {
    "use strict";
    $scope.search = CommonService;

    // get current user
    UserService.getCurrentUser().then(function (result) {
        $scope.user = result.data;
    });

}]);