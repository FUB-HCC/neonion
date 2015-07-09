/**
 * Group management controller
 */
neonionApp.controller('GroupListCtrl', ['$scope', '$http', 'GroupService', 'UserService', 'DocumentService',
    function ($scope, $http, GroupService, UserService, DocumentService) {
        "use strict";

        $scope.groups = [];
        $scope.users = [];
        $scope.documents = [];
        $scope.form = {
            groupName: "",
            selectedGroup: -1
        };
        $scope.documents = DocumentService.query();

        GroupService.getGroups().then(function (result) {
            $scope.groups = result.data;
        });

        UserService.getAccounts().then(function (result) {
            $scope.users = result.data;
        });

        $scope.showMembership = function (group) {
            if ($scope.form.selectedGroup == group.id) {
                $scope.form.selectedGroup = -1;
            }
            else {
                $scope.form.selectedGroup = group.id;
            }
        };

        $scope.createGroup = function () {
            if ($scope.form.groupName.length > 0) {
                var group = {
                    name: $scope.form.groupName
                };
                GroupService.createGroup(group).then(function (result) {
                    $scope.groups.push(result.data);
                });
                $scope.form.groupName = "";
            }
        };

        $scope.deleteGroup = function (group) {
            GroupService.deleteGroup(group).then(function (result) {
                var idx = $scope.groups.indexOf(group);
                $scope.groups.splice(idx, 1);
            });
        };

        $scope.toggleMembership = function (group, user) {
            if (group.members.indexOf(user.id) === -1) {
                $scope.addGroupMember(group, user);
            }
            else {
                $scope.removeGroupMember(group, user);
            }
        };

        $scope.toggleDocumentAssignment = function (group, document) {
            if (group.documents.indexOf(document.id) === -1) {
                $scope.addDocument(group, document);
            }
            else {
                $scope.removeDocument(group, document);
            }
        };

        $scope.addGroupMember = function (group, user) {
            GroupService.addGroupMember(group, user).then(function (result) {
                group.members.push(user.id);
            });
        };

        $scope.removeGroupMember = function (group, user) {
            GroupService.removeGroupMember(group, user).then(function (result) {
                var idx = group.members.indexOf(user.id);
                if (idx > -1) {
                    group.members.splice(idx, 1);
                }
            });
        };

        $scope.addDocument = function (group, document) {
            GroupService.addGroupDocument(group, document).then(function (result) {
                group.documents.push(document.id);
            });
        };

        $scope.removeDocument = function (group, document) {
            GroupService.removeGroupDocument(group, document).then(function (result) {
                var idx = group.documents.indexOf(document.id);
                if (idx > -1) {
                    group.documents.splice(idx, 1);
                }
            });
        };
    }]);