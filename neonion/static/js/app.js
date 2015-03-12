var neonionApp = angular.module('neonionApp', ['ngRoute', 'ngAnimate'])
.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {
        "use strict";

        // CSRF settings
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }
])
.factory('Search', function () {
    "use strict";
    return {
        query : "",
        enabled : false
    };
})
.filter('escape', function() {
    return window.encodeURIComponent;
});
