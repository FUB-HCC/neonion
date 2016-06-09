/**
 * Service for memberships
 */
neonionApp.factory('MembershipService', ['$resource',
    function ($resource) {
        return $resource('/api/memberships/:id',
            {id: '@id'},
            {
                'update': {method: 'PUT'}
            }
        );
    }]);