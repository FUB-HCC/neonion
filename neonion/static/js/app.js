var neonionApp = angular.module('neonionApp', ['ngRoute', 'ngAnimate'])
.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {
        "use strict";

        $routeProvider
        .when('/', {
            templateUrl: 'static/partials/document_grid.html',
            controller: 'WorkspaceCtrl'
        })
        .when('/public', {
            templateUrl: 'static/partials/document_grid.html',
            controller: 'WorkspaceCtrl'
        })
        .when('/groups', {
            templateUrl: 'static/partials/document_grid.html',
            controller: 'WorkspaceCtrl'
        });

        //$locationProvider.html5Mode(true);

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
