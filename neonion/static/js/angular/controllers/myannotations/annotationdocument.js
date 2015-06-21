neonionApp.controller('AnnDocsCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    "use strict";
    var ann_docs = {};
    var url = $location.absUrl().split('/');
    var quote = url[url.length - 1];

    $http.get('/api/documents').success(function (data2) {
        data2.forEach(function (b) {
            var urn = b.id;
            var title = b.title;

            $http.get('/api/store/filter?quote=' + quote).success(function (data) {
                var filterUserData = data.rows;

                filterUserData.forEach(function (a) {
                    if (decodeURI(quote) === a.quote) {
                        if (!(urn in ann_docs) && urn == a.uri) {
                            ann_docs[urn] = {urn: urn, title: title};
                        }
                    }
                });
            });
        });
    });
    $scope.ann_docs = ann_docs;
}]);