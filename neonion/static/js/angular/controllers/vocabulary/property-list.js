neonionApp.controller('PropertyListCtrl', ['$scope', '$sce', 'CommonService', 'PropertyService',
        function ($scope, $sce, CommonService, PropertyService) {
            "use strict";

            $scope.listModeEnabled = true;
            $scope.style = {
                compact: true,
                allowCreate : true,
                detailTemplateUrl : "/static/partials/vocabulary/property-detail.html"
            };
            $scope.locales = {
                // TODO localize
                create: "Create Property"
            };

            $scope.queryProperties = function () {
                return PropertyService.query(function (data) {
                    $scope.resources = data;
                }).$promise;
            };

            $scope.createItem = function() {
                $scope.listModeEnabled = false;
                $scope.$broadcast("createEvent")
            };

            $scope.editItem = function(item) {
                $scope.listModeEnabled = false;
                $scope.$broadcast("editEvent", item)
            };

            $scope.getItemHeader = function (resource) {
                return $sce.trustAsHtml(resource.label);
            };

            $scope.getItemDescription = function (resource) {
                return $sce.trustAsHtml(resource.comment);
            };

            $scope.filterResources = function (resource) {
                if (CommonService.filter.query.length > 0) {
                    return resource.label.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                }
                return true;
            };

            var unbindReturnEvent = $scope.$on('returnEvent', function () {
                $scope.queryProperties();
                $scope.listModeEnabled = true;
            });
            $scope.$on('$destroy', unbindReturnEvent);

            // execute promise chain
            $scope.queryProperties();

        }]
);