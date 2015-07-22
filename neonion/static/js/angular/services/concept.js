neonionApp.factory('ConceptService', ['$resource',
    function ($resource) {
        return $resource('/api/concepts/:conceptId',
            {conceptId: '@id'},
            {});
    }]);