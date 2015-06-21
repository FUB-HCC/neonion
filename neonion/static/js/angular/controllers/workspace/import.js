/**
 * Import controller
 */
neonionApp.controller('WorkspaceImportCtrl', ['$scope', '$http', 'DocumentService', function ($scope, $http, DocumentService) {
    "use strict";

    $http.get('/documents/cms/list').success(function (data) {
        $scope.documents = data;
    });

    $scope.init = function () {
        $("#document-import-list").selectable();
    };

    $scope.importDocuments = function () {
        var selectedDocs = [];
        $('#document-import-list>.ui-selected').each(function () {
            selectedDocs.push(this.id);
        });
        DocumentService.importDocuments(selectedDocs).then(function (data) {
            // return to home
            window.location = "/";
        });
    };

}]);