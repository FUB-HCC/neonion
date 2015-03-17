var neonionApp = angular.module('neonionApp', ['ngAnimate'])
.config(['$httpProvider', '$locationProvider',
    function($httpProvider, $locationProvider) {
        "use strict";
        $locationProvider.html5Mode(false);
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
