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
            if ($scope.hasOwnProperty("documentId")) {
                return DocumentService.get({id: $scope.documentId}, function (document) {
                    $scope.document = document;
                }).$promise;
            }
            else {
                return Promise.resolve(true);
            }
        };

        $scope.getGroup = function () {
            if ($scope.hasOwnProperty("groupId")) {
                var groupId = parseInt($scope.groupId);
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
            }
            else {
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