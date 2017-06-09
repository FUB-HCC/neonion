neonionApp.factory('LinkedConceptService', ['$resource',
        function ($resource) {
            return $resource('/api/linkedconcepts/:id',
                {id: '@id'},
                {
                    'save': {method: 'POST', url: '/api/linkedconcepts/'},
                    'update': {method: 'PUT'},
                }
            );
        }]
);