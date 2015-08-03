neonionApp.factory('AnnotationStoreService', ['$resource',
    function ($resource) {
        return $resource('/api/store/annotations/:annotationId',
            {annotationId: '@id'},
            {
                'queryPrivate': {
                    method: 'GET',
                    params: {private: true},
                    isArray: true
                },
                'search': {
                    method: 'GET',
                    params: {},
                    isArray: true,
                    url: '/api/store/search',
                    transformResponse: function(data, headersGetter) {
                        return angular.fromJson(data)['rows'];
                    }
                }
            }
        );
    }]);