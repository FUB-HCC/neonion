/*jshint jquery:true */

/**
 * Annotator controller
 */
neonionApp.controller('AnnotatorCtrl', ['$scope', '$cookies', '$location', '$sce', 'cookieKeys',
    'UserService', 'AnnotatorService', 'DocumentService', 'ConceptSetService', 'ConceptService',
    function ($scope, $cookies, $location, $sce, cookieKeys, UserService, AnnotatorService, DocumentService,
              ConceptSetService, ConceptService) {
        "use strict";

        $scope.initialize = function (params) {
            $scope.params = params;

            ConceptService.query(function (data) {
                $scope.concepts = data;
            }).$promise
                .then(function () {
                    return DocumentService.get({id: params.docID}, function (document) {
                        $scope.document = document;
                        if ($scope.document.hasOwnProperty("attached_file")) {
                            $scope.documentUrl = "/documents/viewer/" + $scope.document.attached_file.id;
                        }
                    }).$promise;
                });
        };

        $scope.getAnnotationModeCookie = function() {
            var value = $cookies.get(cookieKeys.annotationMode);
            return value ? parseInt($cookies.get(cookieKeys.annotationMode)) : 1;
        }

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
                            annotationMode : $scope.getAnnotationModeCookie()
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
                                annotations.forEach(AnnotatorService.colorizeAnnotation);
                            });

                            // go to annotation given by hash
                            if (queryParams.hasOwnProperty("annotation")) {
                                $scope.scrollToAnnotation(queryParams.annotation);
                            }
                        });
                })
                .then($scope.loadConceptSet)
        };

        /**
         * Experimental
         */
        $scope.renderPDF = function () {
            //PDFJS.disableWorker = true;
            PDFJS.getDocument($scope.documentUrl).then(function (pdf) {
                //console.log(pdf, pdf.numPages);
                // Using promise to fetch the page
                var numPages = Math.min(pdf.numPages, 10); // for testing limit pages
                for (var i = 1; i <= numPages; i++) {
                    pdf.getPage(i).then($scope.renderPage);
                    // TODO render async
                }
            });
        };

        $scope.renderPage = function (page) {
            var scale = 1.5;
            var viewport = page.getViewport(scale);

            // Prepare canvas using PDF page dimensions
            var canvas = angular.element("<canvas/>");
            angular.element("#document-body").append(canvas);
            var context = canvas.get(0).getContext('2d');
            canvas.get(0).height = viewport.height;
            canvas.get(0).width = viewport.width;

            // Render PDF page into canvas context
            /*var canvasOffset = canvas.offset();
             var $textLayerDiv = angular.element("<div />")
             .addClass("textLayer")
             .css("height", viewport.height + "px")
             .css("width", viewport.width + "px")
             .offset({
             top: canvasOffset.top,
             left: canvasOffset.left
             });

             angular.element("#document-body").append($textLayerDiv);*/

            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);

            /*page.getTextContent().then(function (textContent) {
             //The second zero is an index identifying the page. It is set to page.number - 1.
             //var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0);
             var textLayer = new TextLayerBuilder({ textLayerDiv : $textLayerDiv.get(0), pageIndex : 0 });
             textLayer.setTextContent(textContent);
             //console.log(textContent);
             var renderContext = {
             canvasContext: context,
             textLayer: textLayer,
             viewport: viewport
             };

             page.render(renderContext);
             });*/
        }

        $scope.loadConceptSet = function () {
            $scope.conceptSet = ConceptSetService.get({id: "default"}, function () {
                var sets = {};
                $scope.concepts.filter(
                    function (item) {
                        return $scope.conceptSet.concepts.indexOf(item.id) != -1;
                    }
                ).forEach(
                    function (item) {
                        sets[item.uri] = item;
                    }
                );

                $scope.annotator.plugins.Neonion.annotationSets(sets);
            });
        };

        $scope.handleAnnotationEvent = function (annotation) {
            $scope.$apply(function () {
                AnnotatorService.refreshContributors();
                AnnotatorService.colorizeAnnotation(annotation);
            });
        };

        $scope.$on('$destroy', function () {
            // TODO release resources, cancel request...
            console.log("Destroy annotator");
        });

    }]);