neonionApp.controller('OrphanedAnnotationListCtrl', ['$scope', '$sce', 'DocumentService', 'AnnotationStoreService',
        function ($scope, $sce, DocumentService, AnnotationStoreService) {
            "use strict";

            $scope.stepSize = 25;
            $scope.resources = [];

            $scope.queryDocuments = function () {
                return DocumentService.queryTitles(function (data) {
                    $scope.documentTitles = data;
                }).$promise;
            };

            $scope.getQueryParams = function (pageNum) {
                return {
                    offset: pageNum * $scope.stepSize,
                    limit: $scope.stepSize
                };
            }

            $scope.queryOrphanedAnnotations = function (documentTitles, pageNum) {
                pageNum = pageNum | 0;
                return AnnotationStoreService.search($scope.getQueryParams(pageNum), function (data) {
                    if (data.length > 0) {
                        var orphanedAnnotations = data.filter(function (annotation) {
                            return !documentTitles.hasOwnProperty(annotation.uri);
                        });
                        $scope.resources = $scope.resources.concat(orphanedAnnotations);

                        // get next annotations
                        $scope.queryOrphanedAnnotations(documentTitles, pageNum + 1);
                    }
                }).$promise;
            };

            $scope.deleteAnnotation = function (annotation) {
                return annotation.$delete(function () {
                    var annotationIdx = $scope.resources.indexOf(annotation);
                    $scope.resources.splice(annotationIdx, 1);
                }).$promise;
            }

            $scope.deleteAnnotations = function (annotations) {
                annotations.forEach(function (annotation) {
                    $scope.deleteAnnotation(annotation);
                });
            }

            // execute promise chain
            $scope.queryDocuments()
                .then($scope.queryOrphanedAnnotations);

        }]
);