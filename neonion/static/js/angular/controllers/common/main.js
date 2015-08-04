/**
 * Main controller for the whole application
 */
neonionApp.controller('MainCtrl', ['$scope', 'CommonService',
    function ($scope, CommonService) {
    "use strict";
    $scope.search = CommonService;
}]);