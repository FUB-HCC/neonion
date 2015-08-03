neonionApp.factory('DocumentService', ['$resource',
    function ($resource) {
        return $resource('/api/documents/:docId',
            {docId: '@id'},
            {
                'queryTitles': {
                    method: 'GET',
                    params: {},
                    transformResponse: function (data, header) {
                        var jsonData = angular.fromJson(data);
                        var names = {};
                        angular.forEach(jsonData, function (item) {
                            names[item.id] = item.title;
                        });
                        return names;
                    }
                }
            });
    }]);