neonionApp.factory('ConceptSetService', ['$resource',
    function ($resource) {
        return $resource('/api/conceptsets/:conceptSetId',
            {conceptSetId: '@id'},
            {});
    }]);