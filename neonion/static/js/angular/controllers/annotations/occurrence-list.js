neonionApp.controller('AnnotationOccurrenceListCtrl', ['$scope', '$location',
    'DocumentService', 'AnnotationStoreService',
    function ($scope, $location, DocumentService, AnnotationStoreService) {
        "use strict";

        $scope.queryDocumentTitles = function () {
            return DocumentService.queryTitles(function (titles) {
                $scope.documentTitles = titles;
            }).$promise;
        }

        $scope.queryAnnotations = function() {
            // TODO consider query params to dispatch annotation retrieval method
            // case query parm contains 'rdf.uri'
            return $scope.getAnnotationsOfConcept();
        }

        $scope.getAnnotationsOfConcept = function () {
            return AnnotationStoreService.search($location.search(), function (annotations) {
                $scope.annotations = annotations.filter(function (item) {
                    return $scope.documentTitles.hasOwnProperty(item.uri);
                });
            }).$promise;
        };

        // execute promise chain
        $scope.queryDocumentTitles()
            .then($scope.queryAnnotations);

    }
]);