neonionApp.factory('ConceptSetService', ['$resource',
        function ($resource) {
            return $resource('/api/conceptsets/:id',
                {id: '@id'},
                {
                    'update': {method: 'PUT'},
                    'getDeep': {method: 'GET', isArray: false, params: {deep: true}}
                }
            );
        }]
);