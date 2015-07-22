neonionApp.controller('AnnotationSetListCtrl', ['$scope', '$http', '$sce', 'AnnotationSetService', 'ConceptService',
    function ($scope, $http, $sce, AnnotationSetService, ConceptService) {
    "use strict";

    $scope.locales = {
        // TODO localize
        create : "New Annotation Set"
    };
    $scope.resources = AnnotationSetService.query();
    $scope.concepts = ConceptService.query();

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
        if ($scope.concepts) {
            var conceptNames = $scope.concepts.filter(
                function (item) {
                    return resource.concepts.indexOf(item.id) != -1;
                }
            ).map(
                function (item) {
                    return item.label;
                }
            );

            return $sce.trustAsHtml(conceptNames.join(" | "));
        }
        return "";
    }

}]);