/*jshint jquery:true */

/**
 * ContextInfo controller
 */
neonionApp.controller('ContextInfoCtrl', ['$scope', '$http' ,'$location', 'CommonService', 'AnnotatorService', 'DocumentService', 'Group1Service',
    function ($scope, $http, $location, CommonService, AnnotatorService, DocumentService, Group1Service) {
        "use strict";

        CommonService.getCurrentUser(function(user) {
            $scope.user = user;
        })
        .$promise.then(function() {
            $scope.annotatorService = AnnotatorService;
            $scope.document = DocumentService.get({id : $location.search().docId });
            $scope.group = Group1Service.get({id : $location.search().workspace });
        });
}]);