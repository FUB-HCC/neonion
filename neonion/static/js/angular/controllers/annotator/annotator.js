/*jshint jquery:true */

/**
 * Annotator controller
 */
neonionApp.controller('AnnotatorCtrl', ['$scope', '$cookies', '$location', '$sce', 'cookieKeys',
    'UserService', 'AnnotatorService', 'DocumentService', 'ConceptSetService',
    function ($scope, $cookies, $location, $sce, cookieKeys, UserService, AnnotatorService, DocumentService,
              ConceptSetService) {
        "use strict";

        $scope.initialize = function (params) {
            $scope.params = params;

            DocumentService.get({id: params.docID}, function (document) {
                $scope.document = document;
                if ($scope.document.hasOwnProperty("attached_file")) {
                    $scope.documentUrl = "/documents/viewer/" + $scope.document.attached_file.id;
                }
            })


        };

        $scope.getAnnotationModeCookie = function () {
            var value = $cookies.get(cookieKeys.annotationMode);
            return value ? parseInt($cookies.get(cookieKeys.annotationMode)) : 1;
        };

        $scope.setupAnnotator = function (params) {
            UserService.current(function (user) {
                params.agent = {
                    id: user.id,
                    email: user.email
                };
            }).$promise
                .then(function () {
                    var queryParams = $location.search();

                    angular.element("#document-body").annotator()
                        // add store plugin
                        .annotator('addPlugin', 'Store', {
                            prefix: '/api/store',
                            showViewPermissionsCheckbox: false,
                            showEditPermissionsCheckbox: false,
                            annotationData: {
                                uri: params.docID
                            },
                            loadFromSearch: {'limit': 0}
                        })
                        // add neonion plugin
                        .annotator('addPlugin', 'Neonion', {
                            uri: params.docID,
                            agent: params.agent,
                            workspace: queryParams.workspace,
                            annotationMode: $scope.getAnnotationModeCookie()
                        })
                        // add NER plugin
                        .annotator('addPlugin', 'NER', {
                            uri: params.docID,
                            service: params.nerUrl,
                            auth: params.nerAuth
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
                            if (queryParams.hasOwnProperty("annotationId")) {
                                AnnotatorService.scrollToAnnotation(queryParams.annotationId);
                            }
                        });
                })
                .then($scope.getConceptSet)
        };

        $scope.getConceptSet = function () {
            return ConceptSetService.getDeep({id: "default"}, function (conceptSet) {
                $scope.annotator.plugins.Neonion.conceptSet(conceptSet.concepts);
            }).$promise;
        };

        $scope.handleAnnotationEvent = function (annotation) {
            $scope.$apply(function () {
                AnnotatorService.refreshContributors();
                AnnotatorService.colorizeAnnotationByMotivation(annotation);
            });
        };

        var unbindRenderTemplateLoaded = $scope.$on('renderTemplateLoaded', function () {
               $scope.$broadcast("loadDocument", $scope.documentUrl);
            });
            // unbind event
            $scope.$on('$destroy', unbindRenderTemplateLoaded);


        $scope.$on('$destroy', function () {
            // TODO release resources, cancel request...
            console.log("Destroy annotator");
        });

    }]);