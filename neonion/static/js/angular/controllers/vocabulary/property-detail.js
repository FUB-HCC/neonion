neonionApp.controller('PropertyDetailCtrl', ['$scope', 'ConceptService', 'PropertyService',
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
                    assigned: "Assigned Concepts for Property Range",
                    assignable: "Assignable Concepts for Property Range",
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
                    if (!$scope.property.hasOwnProperty('id')) {
                        // generate ID from label
                        $scope.property.id = window.btoa($scope.property.label);
                    }
                    $scope.property.$save($scope.return);
                }
            };

            $scope.update = function () {
                if ($scope.validate()) {
                    $scope.property.$update($scope.return);
                }
            };

            $scope.delete = function () {
                $scope.property.$delete($scope.return);
            }

            $scope.return = function () {
                $scope.$emit("returnEvent");
            };

            $scope.createProperty = function () {
                $scope.property = new PropertyService({
                    label: "",
                    comment: "",
                    inverse_property: null,
                    range: []
                });
            };

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
                    $scope.concepts = data;
                    $scope.updateLists();
                }).$promise;
            };

            $scope.updateLists = function () {
                $scope.assignableItems = $scope.concepts.filter($scope.filterAssignableItems);
                $scope.assignedItems = $scope.concepts.filter($scope.filterAssignedItems);
            };

            $scope.assignItem = function (item) {
                $scope.property.range.push(item.id);
                $scope.updateLists();
            };

            $scope.unassignItem = function (item) {
                var idx = $scope.property.range.indexOf(item.id);
                $scope.property.range.splice(idx, 1);
                $scope.updateLists();
            };

            $scope.filterByQuery = function (item) {
                if ($scope.form.multiselect.query.length > 0) {
                    return item.label.toLowerCase().indexOf($scope.form.multiselect.query.toLowerCase()) != -1;
                }
                return true;
            };

            $scope.filterAssignedItems = function (item) {
                return $scope.property.range.indexOf(item.id) > -1;
            };

            $scope.filterAssignableItems = function (item) {
                return $scope.property.range.indexOf(item.id) == -1;
            };

            var unbindCreateEvent = $scope.$on('createEvent', function (event) {
                $scope.form.isEditing = false;
                $scope.createProperty();
                $scope.queryConcepts()
                    .then($scope.queryProperties);
            });

            var unbindEditEvent = $scope.$on('editEvent', function (event, data) {
                $scope.form.isEditing = true;
                $scope.getProperty(data.id)
                    .then($scope.queryConcepts)
                    .then($scope.queryProperties);
            });

            // unbind events
            $scope.$on('$destroy', unbindCreateEvent);
            $scope.$on('$destroy', unbindEditEvent);

        }]
);