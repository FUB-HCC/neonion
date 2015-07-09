/**
 * Workspace controller
 */
neonionApp.controller('WorkspaceCtrl', ['$scope', '$http', 'UserService', 'WorkspaceService', 'CommonService',
    function ($scope, $http, UserService, WorkspaceService, CommonService) {
        "use strict";

        CommonService.enabled = true;
        $scope.search = CommonService;

        $scope.allowRemove = false;
        $scope.allowImport = false;
        $scope.showWorkspaceName = false;

        $scope.initPrivateWorkspace = function () {
            $scope.allowRemove = true;
            $scope.allowImport = true;
            UserService.getCurrentUser().then(function (result) {
                $scope.user = result.data;
                $scope.workspaces = [{id: $scope.user.email, name: 'Private', documents: result.data.owned_documents}];
            });
        };

        $scope.initPublicWorkspace = function () {
            UserService.getCurrentUser().then(function (result) {
                var user = result.data;
                UserService.getEntitledDocuments(user).then(function (result) {
                    // filter for group public
                    $scope.workspaces = result.data.filter(function (element) {
                        return element.id == 1;
                    });
                });
            });
        };

        $scope.initGroupWorkspace = function () {
            $scope.showWorkspaceName = true;
            UserService.getCurrentUser().then(function (result) {
                var user = result.data;
                UserService.getEntitledDocuments(user).then(function (result) {
                    $scope.workspaces = result.data.filter(function (element) {
                        return element.id != 1;
                    });
                });
            });
        };

        $scope.removeDocument = function (workspace, document) {
            // allow remove on private workspace
            if (workspace.id == $scope.user.email) {
                WorkspaceService.removeDocument($scope.user, document.id).then(function (result) {
                    var idx = workspace.documents.indexOf(document);
                    workspace.documents.splice(idx, 1);
                });
            }
        };

        $scope.filterDocuments = function (document) {
            if ($scope.search.query.length > 0) {
                // do something with $scope.search.query
                return document.title.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
            }
            return true;
        };

    }]);