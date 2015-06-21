/**
 * SPARQL query form controller
 */
neonionApp.controller('QueryCtrl', ['$scope', function ($scope) {
    "use strict";

    $scope.form = {
        prefixes: "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n" +
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n" +
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>\n" +
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>",
        query: "SELECT * {\n" +
        "\t?uri rdf:type <http://neonion.org/concept/person> .\n" +
        "\t?uri rdfs:label ?name\n" +
        "}\nLIMIT 50"
    };

    $scope.endpoint = "endpoint/query";

    $scope.executeQuery = function () {
        var q = new sgvizler.Query();
        q.query($scope.form.query).
            endpointURL($scope.endpoint).
            endpointOutputFormat("json").
            chartFunction("google.visualization.Table").
            draw("query-result");
    };

}]);