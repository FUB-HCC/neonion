/**
 * Group management controller
 */
neonionApp.controller('GroupListCtrl', ['$scope', 'GroupService', 'UserService', 
    'MembershipService', 'DocumentService', 'ConceptSetService',
        function ($scope, GroupService, UserService, MembershipService, DocumentService, ConceptSetService) {
            "use strict";

            $scope.form = {
                groupName: "",
                selectedGroup: -1
            };

            $scope.queryUsers = function () {
                return UserService.query(function (data) {
                    $scope.users = data;
                }).$promise;
            };

            $scope.queryGroups = function () {
                return GroupService.query(function (data) {
                    $scope.groups = data;
                }).$promise;
            };

            $scope.queryDocuments = function () {
                return DocumentService.query(function (data) {
                    $scope.documents = data;
                }).$promise;
            }

            $scope.queryMemberships = function () {
                return MembershipService.query(function (data) {
                    $scope.memberships = data;
                }).$promise;
            }

            $scope.queryConceptSets = function () {
                return ConceptSetService.query(function (data) {
                    $scope.conceptSets = data;
                }).$promise;
            }

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
                    var groupParams = {
                        name: $scope.form.groupName
                    };
                    $scope.form.groupName = "";
                    var newGroup = new GroupService(groupParams);
                    return newGroup.$save(function (data) {
                        // add created group to list
                        $scope.groups.push(data);
                    }).$promise;
                }
            };

            $scope.deleteGroup = function (group) {
                return group.$delete(function () {
                    // remove deleted group from list
                    var groupIdx = $scope.groups.indexOf(group);
                    $scope.groups.splice(groupIdx, 1);
                }).$promise;
            };

            $scope.userEntitled = function (group, user) {
                return group.members.indexOf(user.id) > -1;
            }

            $scope.documentEntitled = function (group, document) {
                return group.documents.indexOf(document.id) > -1;
            }

            $scope.toggleMembership = function (group, user) {
                if (!$scope.userEntitled(group, user)) {
                    $scope.addGroupMember(group, user);
                }
                else {
                    $scope.removeGroupMember(group, user);
                }
            };

            $scope.toggleDocumentAssignment = function (group, document) {
                if (!$scope.documentEntitled(group, document)) {
                    $scope.addDocument(group, document);
                }
                else {
                    $scope.removeDocument(group, document);
                }
            };

            $scope.addGroupMember = function (group, user) {
                // create a new membership to enroll user in group
                var newMembership = new MembershipService({user: user.id, group: group.id});
                return newMembership.$save(function(data) {
                    // add to local member list of group
                    group.members.push(user.id);
                    // add created membership to list
                    $scope.memberships.push(data);
                }).$promise;
            };

            $scope.removeGroupMember = function (group, user) {
                // find the membership of the user and delete it
                for(var i = 0; i < $scope.memberships.length; i++) {
                    if ($scope.memberships[i].user == user.id && $scope.memberships[i].group == group.id) {
                        return $scope.memberships[i].$delete(function() {
                            // remove from local member list of group
                            var userIdx = group.members.indexOf(user.id);
                            group.members.splice(userIdx, 1);
                            // remove membership from list
                            var membershipIdx = $scope.memberships.indexOf($scope.memberships[i]);
                            $scope.memberships.splice(membershipIdx, 1);
                        }).$promise;
                    }
                }
            };

            $scope.addDocument = function (group, document) {
                group.documents.push(document.id);
                return $scope.updateGroup(group);
            };

            $scope.removeDocument = function (group, document) {
                var docIdx = group.documents.indexOf(document.id);
                group.documents.splice(docIdx, 1);
                return $scope.updateGroup(group);
            };

            $scope.updateGroup = function(group) {
                return group.$update().$promise;
            }

            // execute promise chain
            $scope.queryUsers()
                .then($scope.queryConceptSets)
                .then($scope.queryDocuments)
                .then($scope.queryMemberships)
                .then($scope.queryGroups);

        }]
);