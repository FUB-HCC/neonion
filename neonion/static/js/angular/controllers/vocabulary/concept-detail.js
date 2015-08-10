neonionApp.controller('ConceptDetailCtrl', ['$scope', 'ConceptService', 'PropertyService',
        function ($scope, ConceptService, PropertyService) {
            "use strict";

            $scope.form = {
                multiselect: {
                    query: ""
                }
            };
            $scope.literals = {
                multiselect: {
                    assigned: "Assigned Properties",
                    placeholder: "Type here to filter for properties"
                }
            }

            $scope.create = function () {
                $scope.concept = new ConceptService({
                    label: "",
                    comment: ""
                });
                return $scope.concept.$save().$promise;
            }

            $scope.saveChanges = function () {

            }

            $scope.update = function () {
                return $scope.concept.$update().$promise;
            }

            $scope.getConcept = function (id) {
                return ConceptService.get({id: id}, function (data) {
                    $scope.concept = data;
                }).$promise;
            };

            $scope.queryProperties = function () {
                return PropertyService.query(function (data) {
                    $scope.assignableItems = data;
                }).$promise;
            };

            $scope.assignItem = function (item) {
                $scope.concept.properties.push(item.id);
            }

            $scope.unassignItem = function (item) {
                var idx = $scope.concept.properties.indexOf(item.id);
                $scope.concept.properties.splice(idx, 1);
            }

            $scope.filterByQuery = function (item) {
                if ($scope.form.multiselect.query.length > 0) {
                    return item.label.toLowerCase().indexOf($scope.form.multiselect.query.toLowerCase()) != -1;
                }
                return true;
            }

            $scope.filterAssignedItems = function (item) {
                return $scope.concept.properties.indexOf(item.id) > -1;
            }

            $scope.filterAssignableItems = function (item) {
                return $scope.concept.properties.indexOf(item.id) == -1;
            }

            $scope.getConcept("person")
                .then($scope.queryProperties);

        }]
);