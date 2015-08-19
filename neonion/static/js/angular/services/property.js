neonionApp.factory('PropertyService', ['$resource',
    function ($resource) {
        return $resource('/api/properties/:id',
            {id: '@id'},
            {
                'save': {method: 'POST', url: '/api/properties/'},
                'update': {method: 'PUT'},
            }
        );
    }]);