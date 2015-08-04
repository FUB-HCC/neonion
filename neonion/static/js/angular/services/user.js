/**
 * Service for accounts
 */
neonionApp.factory('UserService', ['$resource',
    function ($resource) {
        return $resource('/api/users/:userId',
            {userId: '@id'},
            {
                'update': {method: 'PUT'},
                'current': {
                    method: 'GET',
                    params: {},
                    isArray: false,
                    url: '/api/users/current'
                }
            }
        );
    }]);