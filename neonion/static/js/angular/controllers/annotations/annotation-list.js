neonionApp.controller('AnnotationListCtrl', ['$scope', '$filter', 'CommonService', 'DocumentService',
    'GroupService', 'AnnotationStoreService',
    function ($scope, $filter, CommonService, DocumentService, GroupService, AnnotationStoreService) {
        "use strict";

        $scope.pageNum = 0;
        $scope.stepSize = 50;
        $scope.annotations = [];

        $scope.exportProperties = {
            conceptFields: ['id', 'uri', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy', 'rdf.label',
                'rdf.uri', 'rdf.conceptLabel', 'rdf.typeof', 'rdf.sameAs'],
            commentFields: ['id', 'uri', 'quote', 'text', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy'],
            highlightFields: ['id', 'uri', 'quote', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy'],
            linkedAnnotationFields : ['id', 'uri', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy',
                'oa.hasBody.rdf.subject', 'oa.hasBody.rdf.predicate', 'oa.hasBody.rdf.predicateLabel', 'oa.hasBody.rdf.object',
                'oa.hasTarget.source', 'oa.hasTarget.target'],
            fullKnowledge : ['id', 'uri', 'created', 'oa.annotatedBy.email', 'oa.motivatedBy',
                'rdf.label', 'rdf.uri', 'rdf.conceptLabel', 'rdf.typeof', 'rdf.sameAs',
                'oa.hasBody.rdf.subject', 'oa.hasBody.rdf.predicate', 'oa.hasBody.rdf.predicateLabel', 'oa.hasBody.rdf.object',
                'oa.hasTarget.source', 'oa.hasTarget.target']
        };

        $scope.getQueryParams = function (pageNum) {
            return {
                //'oa.annotatedBy.email': $scope.user.email,
                'offset': pageNum * $scope.stepSize,
                'limit': $scope.stepSize
            };
        };

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

        $scope.queryAnnotations = function (pageNum) {
            pageNum = pageNum | 0;
            return AnnotationStoreService.search($scope.getQueryParams(pageNum), function (annotations) {
                if (annotations.length > 0) {
                    $scope.annotations = $scope.annotations.concat(annotations.filter(function (item) {
                        return $scope.documentTitles.hasOwnProperty(item.uri);
                    }));
                    $scope.queryAnnotations(pageNum + 1);
                }
            }).$promise;
        };

        $scope.downloadComments = function (format) {
            var annotations = $filter('filterByCommentAnnotation')($scope.annotations)
                .filter($scope.filterCommentAnnotations);
            $scope.download(annotations, $scope.exportProperties.commentFields, format, "comments_");
        };

        $scope.downloadHighlights = function (format) {
            var annotations = $filter('filterByHighlightAnnotation')($scope.annotations)
                .filter($scope.filterHighlightAnnotation);
            $scope.download(annotations, $scope.exportProperties.highlightFields, format, "highlights_");
        };

        $scope.downloadConceptsAndStatements = function (format) {
            // filter for concept annotations
            var annotations = $filter('filterByConceptAnnotation')($scope.annotations)
                .filter($scope.filterConceptAnnotations);

            // filter for linked annotations - only export linked annotations that are relevent
            var linkedAnnotations = $filter('filterByLinkedAnnotation')($scope.annotations)
                // check if the subject is present in the array of annotations
                .filter(function (linkage) {
                    return annotations.some(function (annotation) {
                        return annotation.rdf.uri == linkage.oa.hasBody.rdf.subject;
                    })
                })
                // check if the objects is present in the array of annotations
                .filter(function (linkage) {
                    return annotations.some(function (annotation) {
                        return annotation.rdf.uri == linkage.oa.hasBody.rdf.object;
                    });
                });

            $scope.download(annotations.concat(linkedAnnotations), 
                $scope.exportProperties.fullKnowledge, format, "knowledge_");
        };

        $scope.download = function (data, properties, format, filePrefix) {
            filePrefix = filePrefix || 'annotations_';
            if (format.toLowerCase() === 'csv') {
                var data = $scope.exportCSV(data, properties);
                var fileName = filePrefix + new Date().getTime() + '.csv';
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('target', '_blank');
                link.setAttribute('download', fileName);
                link.click();
            }
        };

        $scope.filterCommonFields = function (annotation) {
            if (CommonService.filter.query.length > 0) {
                var show = false;
                // filter by user
                if (annotation.hasOwnProperty("oa")) {
                    show |= annotation.oa.annotatedBy.email.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                }
                // filter by document name
                if ($scope.documentTitles.hasOwnProperty(annotation.uri)) {
                    show |= $scope.documentTitles[annotation.uri].toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                }
                // filter by seletected text
                show |= annotation.quote.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                return show;
            }
            return true;
        }

        $scope.filterCommentAnnotations = function (annotation) {
            if (CommonService.filter.query.length > 0) {
                var show = $scope.filterCommonFields(annotation);
                show |= annotation.text.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                return show;
            }
            return true;
        };

        $scope.filterConceptAnnotations = function (annotation) {
            if (CommonService.filter.query.length > 0) {
                var show = $scope.filterCommonFields(annotation);
                if (annotation.hasOwnProperty("rdf")) {
                    show |= annotation.rdf.label.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                    show |= annotation.rdf.typeof.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1                   
                }
                return show;
            }
            return true;
        };

        $scope.filterHighlightAnnotation = function (annotation) {
            return $scope.filterCommonFields(annotation);
        };

        // execute promise chain
        $scope.queryGroupNames()
            .then($scope.queryDocumentTitles)
            .then($scope.queryCurrentUser)
            .then($scope.queryAnnotations);
    }
]);