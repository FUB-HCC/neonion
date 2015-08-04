neonionApp.factory('PropertyService', ['$resource',
    function ($resource) {
        return $resource('/api/properties/:propertyId',
            {propertyId: '@id'},
            {
                'update': {method: 'PUT'},
            }
        );
    }]);