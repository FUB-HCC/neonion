angular.module('components', [])
    // directive for annotator
    .directive('annotator', function () {
        return {
            restrict: 'E',
            scope: {
                groupId: "@groupId",
                documentId: "@documentId"
            },
            controller: 'AnnotatorCtrl',
            templateUrl: '/static/partials/annotator/annotator.html'
        };
    })

    // directive for annotator context
    .directive('annotatorContext', function () {
        return {
            restrict: 'E',
            scope: {
                groupId: "@groupId",
                documentId: "@documentId"
            },
            controller: 'ContextInfoCtrl',
            templateUrl: '/static/partials/annotator/annotator-context.html'
        };
    })

    // directive to render a PDF document
    .directive('pdfRender', function () {
        return {
            restrict: 'E',
            scope: {
                path: "@path"
            },
            controller: 'AnnotatorPDFCtrl',
            template: '<div id="document-body"></div>'
        };
    })

    // directive to render a plain text document
    .directive('plainRender', function () {
        return {
            restrict: 'E',
            controller: function ($scope) {
                $scope.completed = function () {
                    $scope.$emit("allPagesRendered");
                };
                $scope.$emit("renderTemplateLoaded");
            },
            scope: {
                path: "@path"
            },
            template: '<div id="document-body">' +
            '<div ng-include="path" onload="completed()"></div>' +
            '</div>'
        };
    })

    // directive for filter field
    .directive('filter', function () {
        return {
            restrict: 'E',
            scope: false,
            template: '<input type="text" autocomplete="off" ng-model="common.filter.query"' +
            'placeholder="Type here to filter" class="form-control">'
        };
    })

    // directive for logged in user
    .directive('loggedUser', function () {
        return {
            restrict: 'E',
            scope: false,
            template: '<i class="fa fa-user"></i> {{ user.email }}'
        };
    });