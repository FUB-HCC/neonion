neonionApp.controller('PropertyListCtrl', ['$scope', '$http', '$sce', 'PropertyService',
    function ($scope, $http, $sce, PropertyService) {
    "use strict";

    $scope.locales = {
        // TODO localize
        create : "New Property"
    };
    $scope.resources = PropertyService.query();

    $scope.getItemHeader = function(resource) {
        return $sce.trustAsHtml(resource.label);
    }

    $scope.getItemSubHeader = function(resource) {
        return "";
    }

    $scope.getItemDescription = function(resource) {
        return $sce.trustAsHtml(resource.comment);
    }

}]);