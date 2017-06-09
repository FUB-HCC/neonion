neonionApp.factory('AnnotationStoreService', ['$resource',
        function ($resource) {
            return $resource('/store/annotations/:id',
                {id: '@id', limit: 999999},
                {
                    'search': {
                        method: 'GET',
                        params: {limit: 999999},
                        isArray: true,
                        cache: true,
                        url: '/store/search',
                        transformResponse: function (data, headersGetter) {
                            return angular.fromJson(data)['rows'];
                        }
                    }
                }
            );
        }]
);