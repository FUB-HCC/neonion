neonionApp.controller('AnnotationListCtrl', ['$scope', 'CommonService', 'DocumentService',
    'GroupService', 'AnnotationStoreService',
    function ($scope, CommonService, DocumentService, GroupService, AnnotationStoreService) {
        "use strict";

        $scope.pageNum = 0;
        $scope.stepSize = 50;
        $scope.annotations = [];

        $scope.exportProperties = {
            conceptFields: ['id', 'uri', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy', 'rdf.label', 'rdf.uri', 'rdf.typeof', 'rdf.sameAs'],
            commentFields: ['id', 'uri', 'quote', 'text', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy'],
            highlightFields: ['id', 'uri', 'quote', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy']
        };

        $scope.getQueryParams = function (pageNum) {
            return {
                'oa.annotatedBy.email': $scope.user.email,
                'offset': pageNum * $scope.stepSize,
                'limit': $scope.stepSize
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
            return AnnotationStoreService.search($scope.getQueryParams($scope.pageNum++), function (annotations) {
                if (annotations.length > 0) {
                    $scope.annotations = $scope.annotations.concat(annotations.filter(function (item) {
                        return $scope.documentTitles.hasOwnProperty(item.uri);
                    }));
                }
            }).$promise;
        };

        $scope.downloadComments = function (data, format) {
            $scope.download(data, $scope.exportProperties.commentFields, format);
        }

        $scope.downloadConceptTags = function (data, format) {
            $scope.download(data, $scope.exportProperties.conceptFields, format);
        }

        $scope.download = function (data, properties, format) {
            if (format.toLowerCase() === 'csv') {
                var data = $scope.exportCSV(data, properties);
                var fileName = 'annotations_' + new Date().getTime() + '.csv';
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('target', '_blank');
                link.setAttribute('download', fileName);
                link.click();
            }
        };

        $scope.toConceptName = function (conceptUri) {
            return conceptUri.split('/').pop();
        }

        $scope.filterCommentAnnotations = function (annotation) {
            if (CommonService.filter.query.length > 0) {
                var show = false;
                show |= annotation.quote.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                show |= annotation.text.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                return show;
            }
            return true;
        };

        $scope.filterConceptAnnotations = function (annotation) {
            if (CommonService.filter.query.length > 0) {
                var show = false;
                show |= annotation.rdf.label.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                show |= annotation.rdf.typeof.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1
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