neonionApp.controller('ConceptSetDetailCtrl', ['$scope', 'ConceptSetService', 'ConceptService',
        function ($scope, ConceptSetService, ConceptService) {
            "use strict";

            $scope.form = {
                isEditing: true,
                multiselect: {
                    query: ""
                }
            };
            $scope.literals = {
                multiselect: {
                    assigned: "Assigned Concepts",
                    assignable: "Assignable Concepts",
                    placeholder: "Type here to filter for concepts",
                    nothingAssigned: "Nothing assigned",
                    nothingAssignable: "Nothing to assign"
                }
            };

            $scope.validate = function () {
                return true;
            };

            $scope.create = function () {
                if ($scope.validate()) {
                    if (!$scope.conceptSet.hasOwnProperty('id')) {
                        // generate ID from label
                        $scope.conceptSet.id = window.btoa($scope.conceptSet.label);
                    }
                    $scope.conceptSet.$save($scope.return);
                }
            };

            $scope.update = function () {
                if ($scope.validate()) {
                    $scope.conceptSet.$update($scope.return);
                }
            };

            $scope.delete = function() {
                //$scope.conceptSet.$delete($scope.return);
            };

            $scope.return = function () {
                $scope.$emit("returnEvent");
            };

            $scope.createConceptSet = function () {
                $scope.conceptSet = new ConceptSetService({
                    label: "",
                    comment: "",
                    concepts: []
                });
            };

            $scope.getConceptSet = function (id) {
                return ConceptSetService.get({id: id}, function (data) {
                    $scope.conceptSet = data;
                }).$promise;
            };

            $scope.queryConcepts = function () {
                return ConceptService.query(function (data) {
                    $scope.concepts = data;
                    $scope.updateLists();
                }).$promise;
            };

            $scope.updateLists = function () {
                $scope.assignableItems = $scope.concepts.filter($scope.filterAssignableItems);
                $scope.assignedItems = $scope.concepts.filter($scope.filterAssignedItems);
            };

            $scope.assignItem = function (item) {
                $scope.conceptSet.concepts.push(item.id);
                $scope.updateLists();
            };

            $scope.unassignItem = function (item) {
                var idx = $scope.conceptSet.concepts.indexOf(item.id);
                $scope.conceptSet.concepts.splice(idx, 1);
                $scope.updateLists();
            };

            $scope.filterByQuery = function (item) {
                if ($scope.form.multiselect.query.length > 0) {
                    return item.label.toLowerCase().indexOf($scope.form.multiselect.query.toLowerCase()) != -1;
                }
                return true;
            };

            $scope.filterAssignedItems = function (item) {
                return $scope.conceptSet.concepts.indexOf(item.id) > -1;
            };

            $scope.filterAssignableItems = function (item) {
                return $scope.conceptSet.concepts.indexOf(item.id) == -1;
            };

            var unbindCreateEvent = $scope.$on('createEvent', function (event) {
                $scope.form.isEditing = false;
                $scope.createConceptSet();
                $scope.queryConcepts();
            });

            var unbindEditEvent = $scope.$on('editEvent', function (event, data) {
                $scope.form.isEditing = true;
                $scope.getConceptSet(data.id)
                    .then($scope.queryConcepts);
            });

            // unbind events
            $scope.$on('$destroy', unbindCreateEvent);
            $scope.$on('$destroy', unbindEditEvent);

        }]
);