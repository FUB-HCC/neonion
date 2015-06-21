/**
 * AnnotatorMenu controller
 */
neonionApp.controller('AnnotatorMenuCtrl', ['$scope', '$http', 'AnnotatorService', function ($scope, $http, AnnotatorService) {
    "use strict";

    $scope.annotatorService = AnnotatorService;
    $scope.active = -1;
    $scope.mode = {
        freetext: Annotator.Plugin.Neonion.prototype.annotationModes.freeTextAnnotation,
        semantic: Annotator.Plugin.Neonion.prototype.annotationModes.semanticAnnotation
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

    $scope.scrollToLastAnnotation = function () {
        var annotation = AnnotatorService.annotator().plugins.Neonion.getLastAnnotation();
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
        Annotator._instances[0].plugins.Neonion.annotationMode(mode);
        $scope.closeSubMenus();
    };

    $scope.toggleContributor = function (contributor) {
        var annotations = Annotator._instances[0].plugins.Neonion.getUserAnnotations(contributor.user);
        if (!contributor.showAnnotation) {
            annotations.forEach(function (item) {
                Annotator._instances[0].plugins.Neonion.showAnnotation(item);
                AnnotatorService.colorizeAnnotation(item);
            });
            contributor.showAnnotation = true;

        } else {
            annotations.forEach(Annotator._instances[0].plugins.Neonion.hideAnnotation);
            contributor.showAnnotation = false;
        }
    };

}]);