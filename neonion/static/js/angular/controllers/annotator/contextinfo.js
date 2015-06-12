/*jshint jquery:true */

/**
 * ContextInfo controller
 */
neonionApp.controller('ContextInfoCtrl', ['$scope', '$http' ,'$location', 'AnnotatorService', 'DocumentService',
    function ($scope, $http, $location, AnnotatorService, DocumentService) {
        "use strict";

        $scope.annotatorService = AnnotatorService;

        $scope.getTitle = function() {
            if(AnnotatorService.annotator()) {
                var docID = AnnotatorService.annotator().plugins.Neonion.options.uri;
                return docID;
            }
        }

        $scope.getGroup = function() {
            return "TODO";
        }
}]);