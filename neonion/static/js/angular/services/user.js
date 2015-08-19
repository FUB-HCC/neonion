/**
 * Service for accounts
 */
neonionApp.factory('UserService', ['$resource',
    function ($resource) {
        return $resource('/api/users/:id',
            {id: '@id'},
            {
                'update': {method: 'PUT'},
                'current': {
                    method: 'GET',
                    params: {},
                    cache: true,
                    isArray: false,
                    url: '/api/users/current'
                }
            }
        );
    }]);