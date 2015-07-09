neonionApp.factory('DocumentService', ['$resource',
    function ($resource) {
        return $resource('/api/documents/:docId',
            {docId: '@id'},
            {});
    }]);