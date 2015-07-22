neonionApp.controller('ConceptListCtrl', ['$scope', '$http', '$sce', 'ConceptService', 'PropertyService',
    function ($scope, $http, $sce, ConceptService, PropertyService) {
    "use strict";

    $scope.locales = {
        // TODO localize
        create : "New Concept"
    };
    $scope.resources = ConceptService.query();
    $scope.properties = PropertyService.query();

    $scope.getItemHeader = function(resource) {
        return $sce.trustAsHtml(resource.label);
    }

    $scope.getItemSubHeader = function(resource) {
        return "";
    }

    $scope.getItemDescription = function(resource) {
        return $sce.trustAsHtml(resource.comment);
    }

    $scope.getItemFooter = function(resource) {
        if ($scope.properties) {
            var propertyNames = $scope.properties.filter(
                function (item) {
                    return resource.properties.indexOf(item.id) != -1;
                }
            ).map(
                function (item) {
                    return item.label;
                }
            );

            return $sce.trustAsHtml(propertyNames.join(" | "));
        }
        return "";
    }

}]);