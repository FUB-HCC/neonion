var neonionApp = angular.module('neonionApp', [
    'ngResource', 'angular.filter'
])
.config(['$httpProvider', '$locationProvider',
    function($httpProvider, $locationProvider) {
        "use strict";
        //$locationProvider.html5Mode(false);
        // CSRF settings
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }
]);
