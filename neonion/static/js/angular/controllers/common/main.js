/**
 * Main controller for the whole application
 */
neonionApp.controller('MainCtrl', ['$scope', '$http', 'SearchService', 'AccountService', function ($scope, $http, SearchService, AccountService) {
    "use strict";
    $scope.search = SearchService;

    // get current user
    AccountService.getCurrentUser().then(function (result) {
        $scope.user = result.data;
    });

}]);