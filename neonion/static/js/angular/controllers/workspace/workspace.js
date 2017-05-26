/**
 * Workspace controller
 */
neonionApp.controller('WorkspaceCtrl', ['$scope', '$http', 'UserService', 'WorkspaceService', 'CommonService',
    function ($scope, $http, UserService, WorkspaceService, CommonService) {
        "use strict";

        $scope.allowRemove = false;
        $scope.allowModify = false;
        $scope.allowImport = false;
        $scope.showWorkspaceName = false;

        $scope.getCurrentUser = function () {
            return CommonService.getCurrentUser(function (data) {
                $scope.user = data;
            }).$promise;
        };

        $scope.initPrivateWorkspace = function () {
            $scope.allowRemove = true;
            $scope.allowModify = true;
            $scope.allowImport = true;
            return $scope.getCurrentUser().then(function () {
                $scope.workspaces = [{id: $scope.user.email, name: 'Private', documents: $scope.user.owned_documents}];
            });
        };

        $scope.initPublicWorkspace = function () {
            return $scope.getCurrentUser()
                .then(function () {
                    // TODO make 'entitled_documents' service method
                    return $http.get("/api/users/" + $scope.user.id + "/entitled_documents").then(function (result) {
                        // filter for group public
                        $scope.workspaces = result.data.filter(function (element) {
                            return element.id == 1;
                        });
                    }).$promise;
                });
        };

        $scope.initGroupWorkspace = function () {
            $scope.showWorkspaceName = true;
            return $scope.getCurrentUser()
                .then(function () {
                    // TODO make 'entitled_documents' service method
                    return $http.get("/api/users/" + $scope.user.id + "/entitled_documents").then(function (result) {
                        $scope.workspaces = result.data.filter(function (element) {
                            return element.id != 1;
                        });
                    }).$promise;
                });
        };

        //Stub to modify document
        $scope.modifyDocument = function ($event, workspace, document) {
            $event.preventDefault();
            if (workspace.id == $scope.user.email) {
                location.href = "/modify/" + document.id;
                WorkspaceService.modifyDocument($scope.user, document.id).then(function (result) {
                    var idx = workspace.documents.indexOf(document);
                    workspace.documents.splice(idx, 1);
                });
            }
        }

        $scope.removeDocument = function ($event, workspace, document) {
            // allow remove on private workspace
            $event.preventDefault();
            if (workspace.id == $scope.user.email) {
                WorkspaceService.removeDocument($scope.user, document.id).then(function (result) {
                    var idx = workspace.documents.indexOf(document);
                    workspace.documents.splice(idx, 1);
                });
            }
        };

        $scope.filterDocuments = function (document) {
            if (CommonService.filter.query.length > 0) {
                // do something with CommonService.filter
                return document.title.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
            }
            return true;
        };

    }]);
