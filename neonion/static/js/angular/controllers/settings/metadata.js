neonionApp.controller('MetaDataCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";
    $scope.primaryMetaData = ['Title', 'Creator', 'Type'];

    $scope.secondaryMetaData = ['Contributor', 'Coverage', 'Date', 'Description',
        'Format', 'Identifier', 'Language', 'Publisher', 'Relation',
        'Rights', 'Source', 'Subject'];

    $scope.metaDataValues = {};

    var metaData = $scope.primaryMetaData.concat($scope.secondaryMetaData);

    var definitions = {
        'Title': 'A name given to the resource.',
        'Creator': 'An entity primarily responsible for making the resource.',
        'Type': 'The nature or genre of the resource.',
        'Contributor': 'An entity responsible for making contributions to the resource.',
        'Coverage': 'The spatial or temporal topic of the resource, the spatial applicability of the resource, or the jurisdiction under which the resource is relevant.',
        'Date': 'A point or period of time associated with an event in the lifecycle of the resource.',
        'Description': 'An account of the resource.',
        'Format': 'The file format, physical medium, or dimensions of the resource.',
        'Identifier': 'An unambiguous reference to the resource within a given context.',
        'Language': 'A language of the resource.',
        'Publisher': 'An entity responsible for making the resource available.',
        'Relation': 'A related resource.',
        'Rights': 'Information about rights held in and over the resource.',
        'Source': 'A related resource from which the described resource is derived.',
        'Subject': 'The topic of the resource.'
    };

    metaData.forEach(function (entry) {
        $scope.metaDataValues[entry] = {};
        $scope.metaDataValues[entry].value = "";
        $scope.metaDataValues[entry].checked = false;
        $scope.metaDataValues[entry].definition = definitions[entry];
    });

    $scope.fileLoad = function ($files) {
        /* TODO */
    }
}]);