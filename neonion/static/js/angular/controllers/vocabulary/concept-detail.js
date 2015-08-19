neonionApp.controller('ConceptDetailCtrl', ['$scope', 'ConceptService', 'PropertyService',
        function ($scope, ConceptService, PropertyService) {
            "use strict";

            $scope.form = {
                isEditing: true,
                multiselect: {
                    query: ""
                }
            };
            $scope.literals = {
                multiselect: {
                    assigned: "Assigned Properties",
                    assignable: "Assignable Properties",
                    placeholder: "Type here to filter for properties",
                    nothingAssigned: "Nothing assigned",
                    nothingAssignable: "Nothing to assign"
                }
            };

            $scope.validate = function () {
                return true;
            };

            $scope.create = function () {
                if ($scope.validate()) {
                    if (!$scope.concept.hasOwnProperty('id')) {
                        // generate ID from label
                        $scope.concept.id = window.btoa($scope.concept.label);
                    }
                    $scope.concept.$save($scope.return);
                }
            };

            $scope.update = function () {
                if ($scope.validate()) {
                    $scope.concept.$update($scope.return);
                }
            };

            $scope.delete = function() {
                $scope.concept.$delete($scope.return);
            }

            $scope.return = function () {
                $scope.$emit("returnEvent");
            };

            $scope.createConcept = function () {
                $scope.concept = new ConceptService({
                    label: "",
                    comment: "",
                    properties: [],
                    linked_concepts: []
                });
            };

            $scope.getConcept = function (id) {
                return ConceptService.get({id: id}, function (data) {
                    $scope.concept = data;
                }).$promise;
            };

            $scope.queryProperties = function () {
                return PropertyService.query(function (data) {
                    $scope.properties = data;
                    $scope.updateLists();
                }).$promise;
            };

            $scope.updateLists = function () {
                $scope.assignableItems = $scope.properties.filter($scope.filterAssignableItems);
                $scope.assignedItems = $scope.properties.filter($scope.filterAssignedItems);
            };

            $scope.assignItem = function (item) {
                $scope.concept.properties.push(item.id);
                $scope.updateLists();
            };

            $scope.unassignItem = function (item) {
                var idx = $scope.concept.properties.indexOf(item.id);
                $scope.concept.properties.splice(idx, 1);
                $scope.updateLists();
            };

            $scope.filterByQuery = function (item) {
                if ($scope.form.multiselect.query.length > 0) {
                    return item.label.toLowerCase().indexOf($scope.form.multiselect.query.toLowerCase()) != -1;
                }
                return true;
            };

            $scope.filterAssignedItems = function (item) {
                return $scope.concept.properties.indexOf(item.id) > -1;
            };

            $scope.filterAssignableItems = function (item) {
                return $scope.concept.properties.indexOf(item.id) == -1;
            };

            var unbindCreateEvent = $scope.$on('createEvent', function (event) {
                $scope.form.isEditing = false;
                $scope.createConcept();
                $scope.queryProperties();
            });

            var unbindEditEvent = $scope.$on('editEvent', function (event, data) {
                $scope.form.isEditing = true;
                $scope.getConcept(data.id)
                    .then($scope.queryProperties);
            });

            // unbind events
            $scope.$on('$destroy', unbindCreateEvent);
            $scope.$on('$destroy', unbindEditEvent);

        }]
);