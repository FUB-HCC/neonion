neonionApp.controller('AnnotationSetListCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/annotationsets').success(function (data) {
        $scope.annotationsets = data;
    });

}]);