var neonionApp = angular.module('neonionApp', [])
.config(['$httpProvider', '$locationProvider',
    function($httpProvider, $locationProvider) {
        "use strict";
        $locationProvider.html5Mode(false);
        // CSRF settings
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }
])
.filter('escape', function() {
    return window.encodeURIComponent;
});
