/**
 * NER model controller
 */
neonionApp.controller('NamedEntityCtrl', ['$scope', function ($scope) {
    "use strict";

    $scope.models = [
        {
            identifier: "Standard",
            parameters: [
                {label: "Name", type: "string", restriction: "must be unique", default: "Standard", updatable: false},
                {
                    label: "Stanford Model",
                    type: "string",
                    restriction: "available model in classifiers",
                    default: "dewac_175m_600",
                    updatable: true
                },
                {
                    label: "Learn-network: number of hidden layer components",
                    type: "integer",
                    restriction: "",
                    default: 10,
                    updatable: false
                },
                {
                    label: "Learn-Network: Initialize",
                    type: "string",
                    restriction: "Random or Standard",
                    default: "Standard",
                    updatable: false
                },
                {label: "Predictor: Learn", type: "boolean", restriction: "", default: false, updatable: true},
                {label: "Learn-Network: Learn", type: "boolean", restriction: "", default: false, updatable: true},
                {
                    label: "Predictor: Inverse of Regularization Strength",
                    type: "float",
                    restriction: "> 0",
                    default: 1000,
                    updatable: false
                }
            ]
        }
    ];
}]);
