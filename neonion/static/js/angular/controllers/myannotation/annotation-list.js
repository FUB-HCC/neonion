neonionApp.controller('MyAnnotationListCtrl', ['$scope', '$http', 'CommonService', 'DocumentService', 'GroupService',
    function ($scope, $http, CommonService, DocumentService, GroupService) {
    "use strict";

    CommonService.enabled = true;
    $scope.search = CommonService;

    $http.get('/api/store/filter').success(function (data) {

        // make all freetext annotations available
        var annosSortedByDoc = {};
        var freetextData = data.rows.filter($scope.isFreetextAnnotation);

        // get all titles
        DocumentService.query(function(documents) {

            var documentList = {}
            documents.forEach(function(doc) {
                documentList[doc.id] = doc.title;
            });
            $scope.documents = documentList;
        });

        // get all groups
        GroupService.getGroups().then(function (result) {

            var groupListe = {}
            result.data.forEach(function(group) {
                groupListe[group.id] = group.name;
            });
            $scope.groups = groupListe;
        });

        // create an object for each document: id, visibilty and list of annotations
        // and fill the list of annotations
        freetextData.forEach(function(anno) {
            var key = anno.uri + " " + anno.permissions.read;
            if (!(key in annosSortedByDoc)) {
                annosSortedByDoc[key] = {
                    id: anno.uri,
                    visibility: anno.permissions.read[0],
                    annotations: {}
                };
            }

            annosSortedByDoc[key].annotations[anno.id] = {
                context: anno.quote,
                contextLeft: anno.context.left,
                contextRight: anno.context.right,
                annotation: anno.text,
                date: new Date(Date.parse(anno.created)).toLocaleString()
            }
        });
        $scope.freetextAnnotations = annosSortedByDoc;


        // make all semantic annotations available
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

    $scope.isFreetextAnnotation = function (annotation) {
        if (annotation.hasOwnProperty("rdf")) {
            return false;
        }
        return true;
    };

    $scope.filterAnnotations = function (occurrence) {
        if ($scope.search.query.length > 0) {
            return occurrence.ann.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
        }
        return true;
    };
}]);