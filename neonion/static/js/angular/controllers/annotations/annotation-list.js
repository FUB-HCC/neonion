neonionApp.controller('AnnotationListCtrl', ['$scope', '$http', 'CommonService', 'DocumentService',
    'User1Service', 'Group1Service', 'AnnotationStoreService',
    function ($scope, $http, CommonService, DocumentService, UserService, GroupService, AnnotationStoreService) {
        "use strict";

        CommonService.enabled = true;
        $scope.search = CommonService;

        $scope.getQueryParams = function () {
            return {
                'oa.annotatedBy.email': $scope.user.email
            };
        }

        $scope.groupNames = GroupService.queryGroupNames();
        $scope.documentTitles = DocumentService.queryTitles(function () {
            $scope.user = UserService.current(function () {
                AnnotationStoreService.search(
                    $scope.getQueryParams(),
                    function (annotations) {
                        console.log(annotations);
                        $scope.annotations = annotations.filter(function (item) {
                            return $scope.documentTitles.hasOwnProperty(item.uri);
                        });
                    });
            });
        });

        $scope.toConceptName = function (conceptUri) {
            return conceptUri.split('/').pop();
        }

        $scope.filterAnnotations = function (annotation) {
            if ($scope.search.query.length > 0) {
                return annotation.quote.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
            }
            return true;
        };
    }]);