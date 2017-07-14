neonionApp.controller('ConceptSetListCtrl', ['$scope', '$sce', 'CommonService', 'ConceptSetService', 'ConceptService',
        function ($scope, $sce, CommonService, ConceptSetService, ConceptService) {
            "use strict";

            $scope.listModeEnabled = true;
            $scope.style = {
                compact: false,
                allowCreate : true,
                detailTemplateUrl : "/static/partials/vocabulary/conceptset-detail.html"
            };
            $scope.locales = {
                // TODO localize
                create: "Create Concept Set"
            };

            $scope.queryConceptSets = function () {
                return ConceptSetService.query(function (data) {
                    $scope.resources = data;
                }).$promise;
            };

            $scope.queryConcepts = function () {
                return ConceptService.query(function (data) {
                    $scope.concepts = data;
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

            $scope.getItemSubHeader = function (resource) {
                return "";
            };

            $scope.getItemDescription = function (resource) {
                return $sce.trustAsHtml(resource.comment);
            };

            $scope.getItemFooter = function (resource) {
                if ($scope.concepts) {
                    var conceptNames = $scope.concepts.filter(
                        function (item) {
                            return resource.concepts.indexOf(item.id) != -1;
                        }
                    ).map(
                        function (item) {
                            return item.label;
                        }
                    );

                    return $sce.trustAsHtml(conceptNames.join(" | "));
                }
                return "";
            };

            $scope.filterResources = function (resource) {
                if (CommonService.filter.query.length > 0) {
                    return resource.label.toLowerCase().indexOf(CommonService.filter.query.toLowerCase()) != -1;
                }
                return true;
            };

            var unbindReturnEvent = $scope.$on('returnEvent', function () {
                $scope.queryConceptSets();
                $scope.listModeEnabled = true;
            });
            // unbind event
            $scope.$on('$destroy', unbindReturnEvent);

            // execute promise chain
            $scope.queryConceptSets()
                .then($scope.queryConcepts);

        }]
);
