neonionApp.controller('PropertyDetailCtrl', ['$scope', 'ConceptService', 'PropertyService',
        function ($scope, ConceptService, PropertyService) {
            "use strict";

            $scope.form = {
                multiselect: {
                    query: ""
                }
            };
            $scope.literals = {
                multiselect: {
                    assigned: "Assigned Concepts for Property Range",
                    placeholder: "Type here to filter for concepts"
                }
            }


            $scope.create = function () {
                $scope.property = new PropertyService({
                    label: "",
                    comment: ""
                });
                return $scope.property.$save().$promise;
            }

            $scope.saveChanges = function () {

            }

            $scope.update = function () {
                return $scope.property.$update().$promise;
            }

            $scope.getProperty = function (id) {
                return PropertyService.get({id: id}, function (data) {
                    $scope.property = data;
                }).$promise;
            };

            $scope.queryProperties = function () {
                return PropertyService.query(function (data) {
                    $scope.properties = data;
                }).$promise;
            };

            $scope.queryConcepts = function () {
                return ConceptService.query(function (data) {
                    $scope.assignableItems = data;
                }).$promise;
            };

            $scope.assignItem = function (item) {
                $scope.property.range.push(item.id);
            }

            $scope.unassignItem = function (item) {
                var idx = $scope.property.range.indexOf(item.id);
                $scope.property.range.splice(idx, 1);
            }

            $scope.filterByQuery = function (item) {
                if ($scope.form.multiselect.query.length > 0) {
                    return item.label.toLowerCase().indexOf($scope.form.multiselect.query.toLowerCase()) != -1;
                }
                return true;
            }

            $scope.filterAssignedItems = function (item) {
                return $scope.property.range.indexOf(item.id) > -1;
            }

            $scope.filterAssignableItems = function (item) {
                return $scope.property.range.indexOf(item.id) == -1;
            }

            $scope.getProperty("0bfccb86dbfff233c5dd1ab9c1bd51f1e4acd568")
                .then($scope.queryConcepts);

        }]
);