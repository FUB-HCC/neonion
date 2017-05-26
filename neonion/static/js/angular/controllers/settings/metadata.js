neonionApp.controller('MetaDataCtrl', ['$scope',
    function ($scope) {
    "use strict";
    $(document).ready(function() {
        $(window).keydown(function(event){
        if (event.keyCode == 13) {
          event.preventDefault();           // prevent submitting form
          $("input[type=text]").blur();     // disable focus on input field on enter
          return false;
        }
      });
    });

    $scope.primaryMetaData = ['title', 'creator', 'type'];

    $scope.secondaryMetaData = ['contributor', 'coverage', 'date', 'description',
        'format', 'identifier', 'language', 'publisher', 'relation',
        'rights', 'source', 'subject'];

    $scope.metaDataValues = {};

    var metaData = $scope.primaryMetaData.concat($scope.secondaryMetaData);

    var definitions = {
        'title': 'A name given to the resource.',
        'creator': 'An entity primarily responsible for making the resource.',
        'type': 'The nature or genre of the resource.',
        'contributor': 'An entity responsible for making contributions to the resource.',
        'coverage': 'The spatial or temporal topic of the resource, the spatial applicability of the resource, or the jurisdiction under which the resource is relevant.',
        'date': 'A point or period of time associated with an event in the lifecycle of the resource.',
        'description': 'An account of the resource.',
        'format': 'The file format, physical medium, or dimensions of the resource.',
        'identifier': 'An unambiguous reference to the resource within a given context.',
        'language': 'A language of the resource.',
        'publisher': 'An entity responsible for making the resource available.',
        'relation': 'A related resource.',
        'rights': 'Information about rights held in and over the resource.',
        'source': 'A related resource from which the described resource is derived.',
        'subject': 'The topic of the resource.'
    };

    metaData.forEach(function (entry) {
        $scope.metaDataValues[entry] = {};
        $scope.metaDataValues[entry].value = formVar[entry];
        $scope.metaDataValues[entry].checked = false;
        $scope.metaDataValues[entry].definition = definitions[entry];
    });

    //Check fields for valid inputs
    //$scope.submit = function() {
    //    alter("HELLO")
    //    primaryMetaData.foreach(function(entry) {
    //        if($scope.metaDataValues[entry].value=="")
    //            alert("Mandatory fields empty")
    //    });
    //}

    $scope.fileLoad = function ($files) {
        /* TODO */
    }
}]);
