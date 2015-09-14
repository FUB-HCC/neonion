/**
 * Main controller for the whole application
 */
neonionApp.controller('MainCtrl', ['$scope', 'CommonService',
    function ($scope, CommonService) {
    "use strict";
    $scope.common = CommonService;

    $scope.setUserContext = function() {
        UserService.current(function (user) {
                params.agent = {
                    id: user.id,
                    email: user.email
                };
        })
    }
}]);