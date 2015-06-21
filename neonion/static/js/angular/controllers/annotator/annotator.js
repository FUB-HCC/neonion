/*jshint jquery:true */

/**
 * Annotator controller
 */
neonionApp.controller('AnnotatorCtrl', ['$scope', '$http', '$location', '$sce', 'AccountService', 'AnnotatorService', 'DocumentService',
    function ($scope, $http, $location, $sce, AccountService, AnnotatorService, DocumentService) {
        "use strict";

        $scope.initialize = function (params) {
            $scope.params = params;

            DocumentService.getDocument(params.docID)
                .then(function (document) {
                    $scope.document = document.data;
                    if ($scope.document.hasOwnProperty("attached_file")) {
                        $scope.documentUrl = "/documents/viewer/" + $scope.document.attached_file.id;
                    }
                });
        };

        $scope.setupAnnotator = function (params) {
            AccountService.getCurrentUser()
                .then(function (user) {
                    params.agent = {
                        id: user.data.id,
                        email: user.data.email
                    };
                })
                .then(function () {
                    var queryParams = $location.search();

                    $("#document-body").annotator()
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
                            workspace: queryParams.workspace
                        })
                        // add NER plugin
                        .annotator('addPlugin', 'NER', {
                            uri: params.docID,
                            service: params.nerUrl,
                            auth: params.nerAuth
                        });


                    // get annotator instance and subscribe to events
                    $scope.annotator = $("#document-body").data("annotator");
                    AnnotatorService.annotator($scope.annotator);
                    $scope.annotator
                        .subscribe("annotationCreated", $scope.handleAnnotationEvent)
                        .subscribe("annotationUpdated", $scope.handleAnnotationEvent)
                        .subscribe("annotationDeleted", $scope.handleAnnotationEvent)
                        .subscribe('annotationsLoaded', function (annotations) {
                            $scope.$apply(function () {
                                AnnotatorService.refreshContributors();
                                // colorize each annotation
                                annotations.forEach(AnnotatorService.colorizeAnnotation);
                            });

                            // go to annotation given by hash
                            if (queryParams.hasOwnProperty("annotation")) {
                                $scope.scrollToAnnotation(queryParams.annotation);
                            }
                        });
                })
                .then($scope.loadAnnotationSet)
        };

        $scope.loadAnnotationSet = function () {
            $http.get('/api/annotationsets').success(function (data) {
                $scope.annotationsets = data;
                if ($scope.annotationsets.length > 0) {
                    var sets = {};
                    // TODO just take the first AS
                    $scope.annotationsets[0].concepts.forEach(function (item) {
                        sets[item.uri] = {
                            label: item.label
                        };
                    });

                    $scope.annotator.plugins.Neonion.annotationSets(sets);
                }
            });
        };

        $scope.handleAnnotationEvent = function (annotation) {
            $scope.$apply(function () {
                AnnotatorService.refreshContributors();
                AnnotatorService.colorizeAnnotation(annotation);
            });
        };
    }]);