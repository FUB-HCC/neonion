neonionApp.controller('AnnOccurCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    "use strict";

    var docs = {};
    var ann_occur = {};
    var url = $location.absUrl().split('/');
    var quote = url[url.length - 1];

    $scope.getOccurrences = function () {
        $http.get('/api/store/filter?quote=' + quote).success(function (data) {
            var filterUserData = data.rows;

            filterUserData.forEach(function (a) {
                if (decodeURI(quote) === a.quote) {
                    var key = a.id;
                    var ann = a.quote;
                    var date = a.created;
                    var context = a.context;
                    var contextRight = context.right;
                    var contextLeft = context.left;

                    var urns = Object.keys(docs);

                    urns.forEach(function (c) {
                        if (c == a.uri) {
                            ann_occur[key] = {}
                            ann_occur[key].title = docs[a.uri];
                            ann_occur[key].created = date;
                            ann_occur[key].ann = ann;
                            ann_occur[key].contextRight = contextRight + " [...]";
                            ann_occur[key].contextLeft = "[...] " + contextLeft;
                        }
                        ;
                    });
                }
            });
        });
        $scope.ann_occur = ann_occur;
    };

    $http.get('/api/documents').success(function (data) {
        data.forEach(function (a) {
            var title = a.title;
            var urn = a.id;
            docs[urn] = title;
        });
        $scope.getOccurrences();
    });
}]);