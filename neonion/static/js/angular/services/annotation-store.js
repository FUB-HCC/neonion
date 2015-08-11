neonionApp.factory('AnnotationStoreService', ['$resource',
        function ($resource) {
            return $resource('/api/store/annotations/:id',
                {id: '@id', limit: 999999},
                {
                    'queryPrivate': {
                        method: 'GET',
                        params: {private: true, limit: 999999},
                        isArray: true
                    },
                    'search': {
                        method: 'GET',
                        params: {limit: 999999},
                        isArray: true,
                        url: '/api/store/search',
                        transformResponse: function (data, headersGetter) {
                            return angular.fromJson(data)['rows'];
                        }
                    }
                }
            );
        }]
);