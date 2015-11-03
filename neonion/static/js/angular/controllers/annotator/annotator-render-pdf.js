/**
 * Render PDF Controller (Experimental)
 */

neonionApp.controller('AnnotatorPDFCtrl', ['$scope',
    function ($scope) {
        "use strict";

        $scope.renderPDF = function (documentUrl) {
            //console.log(documentUrl);
            //Not using web workers
            //Not disabling results in an error
            // This line is missing in the example code for rendering a pdf
            PDFJS.disableWorker = true;
            PDFJS.workerSrc = "/static/js/pdf.worker.js";

            PDFJS.getDocument(documentUrl).then(function (pdf) {
                //console.log(pdf, pdf.numPages);
                //console.log(pdf);
                // Using promise to fetch the page
                for (var i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then($scope.renderPage);

                    $scope.$emit("pageRendered");

                    // TODO render async
                }
                $scope.$emit("allPagesRendered");
            });
        };

        $scope.renderPage = function (page) {

            var scale = 1.5;
            var viewport = page.getViewport(scale);

            // Prepare canvas using PDF page dimensions
            //var canvas = angular.element("<canvas style='visibility: hidden'></canvas>");
            var canvas = angular.element("<canvas></canvas>");
            var textlayerDiv = angular.element("<div></div>");
            var context = canvas.get(0).getContext('2d');

            // Set canvas height and width to its equivalents of the viewport
            canvas.get(0).height = viewport.height;
            canvas.get(0).width = viewport.width;

            angular.element("#document-body").append(canvas);

            // Render PDF page into canvas context
            var canvasOffset = canvas.position();
            textlayerDiv
                .addClass("textlayer")
                .css("height", viewport.height + "px")
                .css("width", viewport.width + "px")
                .offset({
                    top: canvasOffset.top - angular.element("#document-body").position().top,              // TODO find out why offset doesn't fit
                    left: canvasOffset.left
                });

            angular.element("#document-body").append(textlayerDiv);

            page.getTextContent().then(function (textContent) {
                 //The second zero is an index identifying the page
                 //It is set to page.number - 1
                var textlayer = new TextLayerBuilder(textlayerDiv.get(0), 0);

                //var textlayer = new TextLayerBuilder({ textlayerDiv : textlayerDiv.get(0), pageIndex : 0 });
                textlayer.setTextContent(textContent);

                //console.log(textContent);

                var renderContext = {
                     canvasContext: context,
                     viewport: viewport,
                     textLayer: textlayer
                 };

                page.render(renderContext);
             });
        }

        var unbindLoadDocument= $scope.$on('loadDocument', function (event, documentUrl) {
            $scope.renderPDF(documentUrl);
        });

        // Controller initialized notify parent controller
        $scope.$emit("renderTemplateLoaded");

        // unbind event
        $scope.$on('$destroy', unbindLoadDocument);
    }]);