/**
 * AnnotatorMenu controller
 */
neonionApp.controller('AnnotatorMenuCtrl', ['$scope', '$cookies', 'cookieKeys', 'AnnotatorService',
    function ($scope, $cookies, cookieKeys, AnnotatorService) {
    "use strict";

    $scope.annotatorService = AnnotatorService;
    $scope.active = -1;
    $scope.mode = {
        commenting: Annotator.Plugin.Neonion.prototype.annotationModes.commenting,
        conceptTagging: Annotator.Plugin.Neonion.prototype.annotationModes.conceptTagging
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
    });

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
    $scope.enableFullscreen = function() {
        var element = angular.element('annotate-space')
        if(element.requestFullscreen) {
            element.requestFullscreen();

        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();

        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();

        } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    };

}]);