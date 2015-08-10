neonionApp.controller('ConceptSetDetailCtrl', ['$scope', 'ConceptSetService', 'ConceptService',
        function ($scope, ConceptSetService, ConceptService) {
            "use strict";

            $scope.form = {
                multiselect: {
                    query: ""
                }
            };
            $scope.literals = {
                multiselect: {
                    assigned: "Assigned Concepts",
                    placeholder: "Type here to filter for concepts"
                }
            }

            $scope.create = function () {
                $scope.conceptSet = new ConceptSetService({
                    label: "",
                    comment: ""
                });
                return $scope.conceptSet.$save().$promise;
            }

            $scope.saveChanges = function () {

            }

            $scope.update = function () {
                return $scope.conceptSet.$update().$promise;
            }

            $scope.getConceptSet = function (id) {
                return ConceptSetService.get({id: id}, function (data) {
                    $scope.conceptSet = data;
                }).$promise;
            };

            $scope.queryConcepts = function () {
                return ConceptService.query(function (data) {
                    $scope.assignableItems = data;
                }).$promise;
            };

            $scope.assignItem = function (item) {
                $scope.conceptSet.concepts.push(item.id);
            }

            $scope.unassignItem = function (item) {
                var idx = $scope.conceptSet.concepts.indexOf(item.id);
                $scope.conceptSet.concepts.splice(idx, 1);
            }

            $scope.filterByQuery = function (item) {
                if ($scope.form.multiselect.query.length > 0) {
                    return item.label.toLowerCase().indexOf($scope.form.multiselect.query.toLowerCase()) != -1;
                }
                return true;
            }

            $scope.filterAssignedItems = function (item) {
                return $scope.conceptSet.concepts.indexOf(item.id) > -1;
            }

            $scope.filterAssignableItems = function (item) {
                return $scope.conceptSet.concepts.indexOf(item.id) == -1;
            }

            $scope.getConceptSet("default")
                .then($scope.queryConcepts);

        }]
);