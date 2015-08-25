/*jshint jquery:true */

/**
 * ContextInfo controller
 */
neonionApp.controller('ContextInfoCtrl', ['$scope', '$location', 'CommonService', 'AnnotatorService', 'DocumentService', 'GroupService',
    function ($scope, $location, CommonService, AnnotatorService, DocumentService, GroupService) {
        "use strict";

        $scope.getCurrentUser = function () {
            return CommonService.getCurrentUser(function (user) {
                $scope.user = user;
            }).$promise;
        };

        $scope.getDocument = function () {
            return DocumentService.get({id: $location.search().docId}, function (document) {
                $scope.document = document;
            }).$promise;
        };

        $scope.getGroup = function () {
            return GroupService.get({id: $location.search().workspace}, function (group) {
                $scope.group = group;
            }).$promise;
        };

        // execute promise chain
        $scope.getCurrentUser()
            .then($scope.getDocument)
            .then($scope.getGroup)
            .then(function () {
                $scope.annotatorService = AnnotatorService;
            });

    }]);