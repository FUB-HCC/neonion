/**
 * @deprecated Service for groups
 */
neonionApp.factory('GroupService', ['$resource',
    function ($resource) {
        return $resource('/api/groups/:id',
            {id: '@id'},
            {
                'update': {method: 'PUT'},
                'queryGroupNames': {
                    method: 'GET',
                    params: {},
                    cache: true,
                    transformResponse: function (data, header) {
                        var jsonData = angular.fromJson(data);
                        var names = {};
                        angular.forEach(jsonData, function (item) {
                            names[item.id] = item.name;
                        });
                        return names;
                    }
                }
            });
    }]);