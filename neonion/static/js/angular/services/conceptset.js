neonionApp.factory('ConceptSetService', ['$resource',
        function ($resource) {

            factory = {};

            factory.resource = $resource('/api/conceptsets/:id',
                {id: '@id'},
                {
                    'save': {method: 'POST', url: '/api/conceptsets/'},
                    'update': {method: 'PUT'},
                    'getDeep': {method: 'GET', isArray: false, params: {deep: true}}
                }
            );

            factory.conceptSets = factory.resource.query(function(data){
               return data;
            });


            return factory;
        }
    ]
);