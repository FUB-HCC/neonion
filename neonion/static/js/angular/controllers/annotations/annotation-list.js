neonionApp.controller('AnnotationListCtrl', ['$scope', 'CommonService', 'DocumentService',
    'Group1Service', 'AnnotationStoreService',
    function ($scope, CommonService, DocumentService, GroupService, AnnotationStoreService) {
        "use strict";

        CommonService.enabled = true;
        $scope.search = CommonService;

        $scope.getQueryParams = function () {
            return {
                'oa.annotatedBy.email': $scope.user.email
            };
        }

        $scope.queryGroupNames = function () {
            return GroupService.queryGroupNames(function (data) {
                $scope.groupNames = data;
            }).$promise;
        };

        $scope.queryDocumentTitles = function () {
            return DocumentService.queryTitles(function (data) {
                $scope.documentTitles = data;
            }).$promise;
        };

        $scope.queryCurrentUser = function () {
            return CommonService.getCurrentUser(function (data) {
                $scope.user = data;
            }).$promise;
        };

        $scope.queryAnnotations = function () {
            return AnnotationStoreService.search($scope.getQueryParams(), function (annotations) {
                $scope.annotations = annotations.filter(function (item) {
                    return $scope.documentTitles.hasOwnProperty(item.uri);
                });
            }).$promise;
        };

        $scope.toConceptName = function (conceptUri) {
            return conceptUri.split('/').pop();
        }

        $scope.filterCommentAnnotations = function (annotation) {
            if ($scope.search.query.length > 0) {
                var show = false;
                show |= annotation.quote.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
                show |= annotation.text.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
                return show;
            }
            return true;
        };

        $scope.filterConceptAnnotations = function (annotation) {
            if ($scope.search.query.length > 0) {
                var show = false;
                show |= annotation.rdf.label.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
                show |= annotation.rdf.typeof.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1
                return show;
            }
            return true;
        };

        // execute promise chain
        $scope.queryGroupNames()
            .then($scope.queryDocumentTitles)
            .then($scope.queryCurrentUser)
            .then($scope.queryAnnotations);
    }
]);