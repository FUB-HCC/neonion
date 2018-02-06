/**
 * AnnotatorMenu controller
 */
neonionApp.controller('AnnotatorMenuCtrl', ['$scope', '$window', '$location', '$cookies',
    'cookieKeys', 'systemSettings', 'AnnotatorService', 'ConceptSetService',
    function ($scope, $window, $location, $cookies, cookieKeys, systemSettings, AnnotatorService, ConceptSetService) {
        "use strict";

        $scope.systemSettings = systemSettings;
        $scope.annotatorService = AnnotatorService;

        $scope.mode = {
            commenting: {
                shortCut: "A",
                value: Annotator.Plugin.neonion.prototype.annotationModes.commenting
            },
            highlighting: {
                shortCut: "S",
                value: Annotator.Plugin.neonion.prototype.annotationModes.highlighting
            },
            conceptTagging: {
                shortCut: "D",
                value: Annotator.Plugin.neonion.prototype.annotationModes.conceptTagging
            }
        };

        $scope.conceptSets = ConceptSetService.query();


        $scope.shortCutModifier = {
            default: {
                modifierText: "Ctrl+Alt+"
            }
        };

        $scope.handleKeyDown = function (event) {
            if (event.ctrlKey && event.altKey) {
                for (var key in $scope.mode) {
                    if ($scope.mode[key].shortCut == String.fromCharCode(event.keyCode)) {
                        $scope.setAnnotationMode($scope.mode[key].value);
                        $scope.$apply();
                        break;
                    }
                }
            }
        };

        /**
         * Handle home click.
         */
        $scope.home = function() {
            if ($location.search().return) {
                window.location = $location.search().return;
            }
            else {
                window.location = "/";
            }
        };

        /**
         * Scrolls the view port to the last annotation.
         */
        $scope.scrollToLastAnnotation = function () {
            var annotation = AnnotatorService.getLastAnnotation();
            if (annotation) {
                AnnotatorService.scrollToAnnotation(annotation);
            }
        };

        $scope.getAnnotationMode = function () {
            if (Annotator && Annotator._instances.length >= 1) {
                return Annotator._instances[0].plugins.neonion.annotationMode();
            }
            else {
                return 1;
            }
        };

        $scope.setAnnotationMode = function (mode) {
            $cookies.put(cookieKeys.annotationMode, mode);
            Annotator._instances[0].plugins.neonion.annotationMode(mode);
        };

        $scope.toggleContributor = function (contributor) {
            var annotations = AnnotatorService.getUserAnnotations(contributor.user);
            if (!contributor.showAnnotation) {
                annotations.forEach(function (item) {
                    AnnotatorService.showAnnotation(item);
                });
                contributor.showAnnotation = true;

            } else {
                annotations.forEach(AnnotatorService.hideAnnotation);
                contributor.showAnnotation = false;
            }
        };

        $scope.startNamedEntityRecognition = function () {
            var span = angular.element('#nav-annotate>span');
            if (!span.hasClass('fa-spin')) {
                span.addClass('fa-spin');
                AnnotatorService.annotator().plugins.NER.recognize({
                    success: function (data) {
                        span.removeClass('fa-spin');
                    },
                    error: function () {
                        span.removeClass('fa-spin');
                    }
                });
            }
        };

        $scope.return = function () {
            $scope.$emit("returnEvent");
        };

        $scope.getConceptSet = function () {
            var conceptSetId = $scope.document ? $scope.document.concept_set : 'default';

            return ConceptSetService.getDeep({id: conceptSetId},
                function (conceptSet) {
                    $scope.conceptSet = conceptSet
                }).$promise;
        };

        $scope.switchConceptSet = function(conceptSetId) {
            console.log('change concept set to '+conceptSetId);
            $scope.document.concept_set = conceptSetId;

            ConceptSetService.getDeep({id: conceptSetId},
                function (conceptSet) {
                    $scope.conceptSet = conceptSet
                }).$promise.then(function(data){
                    AnnotatorService.annotator().plugins.neonion.conceptSet($scope.conceptSet.concepts);
                    $scope.document.$update($scope.return);
            });
        }


        /**
         * Find the right method, call on correct element.
         */
        $scope.enableFullscreen = function () {
            var element = angular.element('annotate-space')
            if (element.requestFullscreen) {
                element.requestFullscreen();

            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();

            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();

            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };

    }]);
