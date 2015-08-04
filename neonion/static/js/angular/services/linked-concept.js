neonionApp.factory('LinkedConceptService', ['$resource',
        function ($resource) {
            return $resource('/api/linkedconcepts/:linkedConceptId',
                {linkedConceptId: '@id'},
                {
                    'update': {method: 'PUT'},
                }
            );
        }]
);