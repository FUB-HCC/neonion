neonionApp.factory('PropertyService', ['$resource',
    function ($resource) {
        return $resource('/api/properties/:id',
            {id: '@id'},
            {
                'update': {method: 'PUT'},
            }
        );
    }]);