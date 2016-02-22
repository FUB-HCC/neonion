/*jshint jquery:true */

/**
 * Annotator controller
 */
neonionApp.controller('AnnotatorCtrl', ['$scope', '$cookies', '$location', '$sce', 'cookieKeys',
    'UserService', 'AnnotatorService', 'DocumentService', 'GroupService', 'ConceptSetService',
    function ($scope, $cookies, $location, $sce, cookieKeys, UserService, AnnotatorService, 
            DocumentService, GroupService, ConceptSetService) {
        "use strict";

        $scope.getDocument = function () {
            if ($scope.hasOwnProperty("documentId")) {
                return DocumentService.get({id: $scope.documentId}, function (document) {
                    $scope.document = document;
                }).$promise;
            }
            return Promise.resolve(true);
        };

        $scope.getGroup = function() {
            if ($scope.hasOwnProperty("groupId")) {
                return GroupService.get({id: $scope.groupId}, function (group) {
                    $scope.group = group;
                }).$promise;
            }
            return Promise.resolve(true);
        };

        $scope.getConceptSet = function () {
            if ($scope.group) {
                return ConceptSetService.getDeep({id: $scope.group.concept_set}, 
                function (conceptSet) {
                    $scope.conceptSet = conceptSet
                }).$promise;                
            }
            return Promise.resolve(true);
        };

        $scope.getDocumentUrl = function() {
            if ($scope.document) {
                return "/documents/viewer/" + $scope.document.attached_file.id;
            }
            return "";
        };

        $scope.getAnnotationModeCookie = function () {
            var value = $cookies.get(cookieKeys.annotationMode);
            return value ? parseInt($cookies.get(cookieKeys.annotationMode)) : 1;
        };

        $scope.setupAnnotator = function () {
            UserService.current(function (user) {
                $scope.agent = {
                    id: user.id,
                    email: user.email
                };
            }).$promise
                .then(function () {
                    angular.element("#document-body").annotator()
                        // add store plugin
                        .annotator('addPlugin', 'Store', {
                            prefix: '/api/store/' + $scope.groupId + '/' + $scope.documentId,
                            showViewPermissionsCheckbox: false,
                            showEditPermissionsCheckbox: false,
                            annotationData: {
                                uri: $scope.documentId
                            },
                            loadFromSearch: {'limit': 0}
                        })
                        // add neonion plugin
                        .annotator('addPlugin', 'Neonion', {
                            uri: $scope.documentId,
                            workspace: $scope.groupId,
                            annotationMode: $scope.getAnnotationModeCookie()
                        });

                    // get annotator instance and subscribe to events
                    $scope.annotator = angular.element("#document-body").data("annotator");
                    AnnotatorService.annotator($scope.annotator);
                    $scope.annotator
                        .subscribe("annotationCreated", $scope.handleAnnotationEvent)
                        .subscribe("annotationUpdated", $scope.handleAnnotationEvent)
                        .subscribe("annotationDeleted", $scope.handleAnnotationEvent)
                        .subscribe('annotationsLoaded', function (annotations) {
                            $scope.$apply(function () {
                                AnnotatorService.refreshContributors();
                                // colorize each annotation
                                annotations.forEach(AnnotatorService.colorizeAnnotationByMotivation);
                            });

                            // go to annotation given by hash
                            var queryParams = $location.search();
                            if (queryParams.hasOwnProperty("annotationId")) {
                                AnnotatorService.scrollToAnnotation(queryParams.annotationId);
                            }
                        });
                })
                .then($scope.getGroup)
                .then($scope.getConceptSet)
                .then(function() {
                    $scope.annotator.plugins.Neonion.conceptSet($scope.conceptSet.concepts);
                });
        };

        $scope.handleAnnotationEvent = function (annotation) {
            $scope.$apply(function () {
                AnnotatorService.refreshContributors();
                AnnotatorService.colorizeAnnotationByMotivation(annotation);
            });
        };

        var unbindRenderTemplateLoaded = $scope.$on('renderTemplateLoaded', function (event) {

        });

        var unbindPageRendered = $scope.$on('pageRendered', function (event, pageNum) {
            // debug output
            console.log("Finished rendering of page " + pageNum);
        });

        var unbindAllPagesRendered = $scope.$on('allPagesRendered', function (event) {
            $scope.setupAnnotator();
        });

        // unbind events
        $scope.$on('$destroy', unbindRenderTemplateLoaded);
        $scope.$on('$destroy', unbindPageRendered);
        $scope.$on('$destroy', unbindAllPagesRendered);

        $scope.$on('$destroy', function () {
            // TODO release resources, cancel request...
            //console.log("Destroy annotator");
        });

        $scope.getDocument();

    }]);

