neonionApp.factory('LinkedConceptService', ['$resource',
        function ($resource) {
            return $resource('/api/linkedconcepts/:id',
                {id: '@id'},
                {
                    'update': {method: 'PUT'},
                }
            );
        }]
);