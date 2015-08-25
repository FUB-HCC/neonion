var neonionApp = angular.module('neonionApp', [
    'ngResource', 'ngCookies', 'angular.filter', 'ngFileUpload'
])
    .config(['$httpProvider', '$locationProvider',
        function ($httpProvider, $locationProvider) {
            "use strict";
            //$locationProvider.html5Mode(false);
            // CSRF settings
            $httpProvider.defaults.xsrfCookieName = 'csrftoken';
            $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        }
    ])
    .constant("cookieKeys", {
        annotationMode: "neonion_annotationMode"
    }
)
