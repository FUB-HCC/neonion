/*jshint jquery:true */

/**
 * ContextInfo controller
 */
neonionApp.controller('ContextInfoCtrl', ['$scope', '$http' ,'$location', 'AnnotatorService', 'DocumentService', 'Group1Service',
    function ($scope, $http, $location, AnnotatorService, DocumentService, Group1Service) {
        "use strict";

        $scope.annotatorService = AnnotatorService;
        $scope.document = DocumentService.get({docId : $location.search().docId });
        $scope.group = Group1Service.get({groupId : $location.search().workspace });

}]);