neonionApp.controller('AnnotationStoreCtrl', ['$scope', '$http', 'SearchService', function ($scope, $http, SearchService) {
    "use strict";

    SearchService.enabled = true;
    $scope.search = SearchService;

    $http.get('/api/store/filter').success(function (data) {
        var occurrences = {};
        var filterUserData = data.rows.filter($scope.isSemanticAnnotation);

        filterUserData.forEach(function (a) {
            var rdf = a.rdf;
            var key = a.quote + rdf;
            var ann = a.quote;
            var type = rdf.typeof;
            var date = a.created;
            var doc = a.uri;

            var typeParts = type.split('/');
            var concept = typeParts[typeParts.length - 1];

            if (!(key in occurrences)) {
                occurrences[key] = {ann: ann, count: 1, typeof: concept, last: date, docs: new Array()};
            } else {
                occurrences[key].count++;
                var parsedDate = Date.parse(date);
                var parsedOld = Date.parse(occurrences[key].last);
                if (parsedDate > parsedOld) {
                    occurrences[key].last = date;
                }
            }

            if (((occurrences[key].docs).indexOf(doc)) == -1) {
                occurrences[key].docs.push(doc);
            }
        });
        var keys = Object.keys(occurrences);
        $scope.occurrences = keys.map(function (k) {
            return occurrences[k];
        });
    });

    $scope.isSemanticAnnotation = function (annotation) {
        if (annotation.hasOwnProperty("rdf")) {
            return true;
        }
        return false;
    };

    $scope.filterAnnotations = function (occurrence) {
        if ($scope.search.query.length > 0) {
            return occurrence.ann.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
        }
        return true;
    };
}]);