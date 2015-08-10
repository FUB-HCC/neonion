/**
 * Service for on page search
 */
neonionApp.factory('CommonService', ['UserService',
        function (UserService) {
            "use strict";

            var factory = {
                query: "",
                enabled: false
            };

            factory.getCurrentUser = function (onFulfilled) {
                return UserService.current(onFulfilled);
            };

            return factory;
        }]
);