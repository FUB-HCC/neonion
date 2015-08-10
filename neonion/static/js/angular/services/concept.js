neonionApp.factory('ConceptService', ['$resource',
        function ($resource) {
            return $resource('/api/concepts/:id',
                {id: '@id'},
                {
                    'update': {method: 'PUT'},
                }
            );
        }]
);