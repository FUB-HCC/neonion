neonionApp.factory('DocumentService', ['$resource',
    function ($resource) {
        return $resource('/api/documents/:id',
            {id: '@id'},
            {
                'queryTitles': {
                    method: 'GET',
                    params: {},
                    cache: true,
                    transformResponse: function (data, header) {
                        var jsonData = angular.fromJson(data);
                        var names = {};
                        angular.forEach(jsonData, function (item) {
                            names[item.id] = item.title;
                        });
                        return names;
                    }
                },
                'save': {method: 'POST', url:'/api/documents/'},
                'update': {method: 'PUT'}
            });
    }]
);