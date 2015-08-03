neonionApp.controller('AnnotationOccurrenceListCtrl', ['$scope', '$http', '$location',
    'DocumentService', 'AnnotationStoreService',
    function ($scope, $http, $location, DocumentService, AnnotationStoreService) {
        "use strict";

        $scope.documentTitles = DocumentService.queryTitles(function () {
            $scope.getOccurrenceOfConcept();
        });

        $scope.getOccurrenceOfConcept = function () {
            AnnotationStoreService.search(
                $location.search(),
                function (annotations) {
                    $scope.annotations = annotations.filter(function(item) {
                        return $scope.documentTitles.hasOwnProperty(item.uri);
                    });
                });
        };
    }]);