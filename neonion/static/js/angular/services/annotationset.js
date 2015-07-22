neonionApp.factory('AnnotationSetService', ['$resource',
    function ($resource) {
        return $resource('/api/annotationsets/:annotationSetId',
            {annotationSetId: '@id'},
            {});
    }]);