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
            var groupId = parseInt($location.search().workspace);
            if (!isNaN(groupId)) {
                // get the group object
                return GroupService.get({id: groupId}, function (group) {
                    $scope.isPrivate = false;
                    $scope.group = group;
                }).$promise;
            }
            else {
                $scope.isPrivate = true;
                // no http communication
                return Promise.resolve(true);
            }
        };

        // execute promise chain
        $scope.getCurrentUser()
            .then($scope.getDocument)
            .then($scope.getGroup)
            .then(function () {
                $scope.annotatorService = AnnotatorService;
            });

    }]);