/**
 * Common Service to share data across controllers
 */
neonionApp.factory('CommonService', ['UserService',
        function (UserService) {
            "use strict";

            var factory = {
                filter: {
                    query: ""
                },
                search: {
                    query: "",
                    enabled: false
                }
            };

            factory.getCurrentUser = function (onFulfilled) {
                return UserService.current(onFulfilled);
            };

            return factory;
        }]
);