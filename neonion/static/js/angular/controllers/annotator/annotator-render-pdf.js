/**
 * Render PDF Controller (Experimental)
 */

neonionApp.controller('AnnotatorPDFCtrl', ['$scope',
    function ($scope) {
        "use strict";

        $scope.renderPDF = function (documentUrl) {
            console.log(documentUrl);
            PDFJS.disableWorker = true;
            PDFJS.workerSrc = "/static/js/pdf.worker.js";

            PDFJS.getDocument(documentUrl).then(function (pdf) {
                console.log(pdf, pdf.numPages);

                // Using promise to fetch the page
                for (var i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then($scope.renderPage);
                    // TODO render async
                }
            });
        };

        $scope.renderPage = function (page) {
            var scale = 1.5;
            var viewport = page.getViewport(scale);

            // Prepare canvas using PDF page dimensions
            var canvas = angular.element("<canvas/>");
            var context = canvas.get(0).getContext('2d');

            // Set canvas height and width to its equivalents of the viewport
            canvas.get(0).height = viewport.height;
            canvas.get(0).width = viewport.width;

            angular.element("#document-body").append(canvas);

            // Render PDF page into canvas context
            var canvasOffset = canvas.offset();
            var $textLayerDiv = angular.element("<div />")
                .addClass("textLayer")
                .css("height", viewport.height + "px")
                .css("width", viewport.width + "px")
                .offset({
                    top: canvasOffset.top,
                    left: canvasOffset.left
                });

             angular.element("#document-body").append($textLayerDiv);

            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);

            /*page.getTextContent().then(function (textContent) {
             //The second zero is an index identifying the page. It is set to page.number - 1.
             //var textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0);
             var textLayer = new TextLayerBuilder({ textLayerDiv : $textLayerDiv.get(0), pageIndex : 0 });
             textLayer.setTextContent(textContent);
             //console.log(textContent);
             var renderContext = {
             canvasContext: context,
             textLayer: textLayer,
             viewport: viewport
             };

             page.render(renderContext);
             });*/
        }

        var unbindLoadDocument= $scope.$on('loadDocument', function (event, documentUrl) {
            $scope.renderPDF(documentUrl);
        });
            // unbind event
            $scope.$on('$destroy', unbindLoadDocument);

        // Controller initialized notify parent controller
        $scope.$emit("renderTemplateLoaded");
    }]);