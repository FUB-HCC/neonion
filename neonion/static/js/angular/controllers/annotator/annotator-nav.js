/**
 * AnnotatorMenu controller
 */
neonionApp.controller('AnnotatorMenuCtrl', ['$scope', '$window', '$cookies', 'cookieKeys', 'AnnotatorService',
    function ($scope, $window, $cookies, cookieKeys, AnnotatorService) {
        "use strict";

        $scope.annotatorService = AnnotatorService;
        $scope.active = -1;
        $scope.mode = {
            commenting: {
                shortCut: "A",
                value: Annotator.Plugin.Neonion.prototype.annotationModes.commenting
            },
            highlighting: {
                shortCut: "S",
                value: Annotator.Plugin.Neonion.prototype.annotationModes.highlighting
            },
            conceptTagging: {
                shortCut: "D",
                value: Annotator.Plugin.Neonion.prototype.annotationModes.conceptTagging
            }
        };
        $scope.shortCutModifier = {
            default: {
                modifierText: "Ctrl+Alt+"
            }
        }

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
        }

        /**
         * Scrolls the view port to the last annotation.
         */
        $scope.scrollToLastAnnotation = function () {
            var annotation = AnnotatorService.getLastAnnotation();
            if (annotation) {
                AnnotatorService.scrollToAnnotation(annotation);
            }
        };

        $scope.toggleSubMenu = function (index) {
            if (index == $scope.active) {
                $scope.closeSubMenus();
            } else {
                $scope.active = index;
            }
        };

        $scope.closeSubMenus = function () {
            $scope.active = -1;
        }

        $scope.getAnnotationMode = function () {
            if (Annotator && Annotator._instances.length >= 1) {
                return Annotator._instances[0].plugins.Neonion.annotationMode();
            }
            else {
                return 1;
            }
        }

        $scope.setAnnotationMode = function (mode) {
            $cookies.put(cookieKeys.annotationMode, mode);
            Annotator._instances[0].plugins.Neonion.annotationMode(mode);
            $scope.closeSubMenus();
        };

        $scope.toggleContributor = function (contributor) {
            var annotations = AnnotatorService.getUserAnnotations(contributor.user);
            if (!contributor.showAnnotation) {
                annotations.forEach(function (item) {
                    AnnotatorService.showAnnotation(item);
                    AnnotatorService.colorizeAnnotation(item);
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

        // for closing the submenu if clicked anywere except the menu itself
        angular.element(document).ready(function () {
            $(document).mouseup(function (e) {
                var navigation = $(".nav-vertical");
                if (!navigation.is(e.target) && navigation.has(e.target).length === 0) {
                    $scope.closeSubMenus();
                    $scope.$apply();
                }
            });

            // attach key listener
            var unbindKeyHandler = angular.element($window).on('keydown', $scope.handleKeyDown);
            // unbind on destroy
            $scope.$on('$destroy', unbindKeyHandler);
        });

    }]);