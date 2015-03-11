var neonionApp = angular.module('neonionApp', [])
.config(['$httpProvider', function($httpProvider) { // provider-injector
    "use strict";
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]
)
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