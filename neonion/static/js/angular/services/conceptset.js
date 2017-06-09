neonionApp.factory('ConceptSetService', ['$resource',
        function ($resource) {
            return $resource('/api/conceptsets/:id',
                {id: '@id'},
                {
                    'save': {method: 'POST', url: '/api/conceptsets/'},
                    'update': {method: 'PUT'},
                    'getDeep': {method: 'GET', isArray: false, params: {deep: true}}
                }
            );
        }]
);