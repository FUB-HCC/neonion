neonionApp.factory('ConceptService', ['$resource',
        function ($resource) {
            return $resource('/api/concepts/:id',
                {id: '@id'},
                {
                    'save': {method: 'POST', url: '/api/concepts/'},
                    'update': {method: 'PUT'},
                }
            );
        }]
);