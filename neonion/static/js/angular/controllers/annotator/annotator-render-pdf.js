/**
 * Render PDF Controller (Experimental)
 */

neonionApp.controller('AnnotatorPDFCtrl', ['$scope',
    function ($scope) {
        "use strict";

        $scope.renderPDF = function (documentUrl) {
            PDFJS.workerSrc = "/static/js/pdf.worker.js";

            PDFJS.getDocument(documentUrl).then(function (pdf) {
                $scope.pdf = pdf;
                // start rendering the first page
                $scope.pdf.getPage(1).then($scope.renderPage);                
            });
        };

        $scope.renderPage = function (page) {
            var scale = 1.5;
            var viewport = page.getViewport(scale);

            // Prepare canvas using PDF page dimensions
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
                    top: canvasOffset.top - angular.element("#document-body").position().top,
                    left: canvasOffset.left
                });

            angular.element("#document-body").append(textlayerDiv);

            page.getTextContent().then(function (textContent) {
                // create the text layer
                var textlayer = new TextLayerBuilder({
                    textLayerDiv: textlayerDiv.get(0), 
                    viewport: viewport,
                    pageIndex: page.pageIndex
                });

                textlayer.setTextContent(textContent);
                textlayer.render(200); // TEXT_LAYER_RENDER_DELAY
                // paramets for rendering the page
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                    textLayer: textlayer
                };
                // render the current page
                page.render(renderContext).then(function() {
                    $scope.onRenderPageComplete(page.pageIndex + 1);
                });
            });
        }

        /**
        * Page rendered successfully.
        */
        $scope.onRenderPageComplete = function(pageNum) {
            // notify parent controller
            $scope.$emit("pageRendered", pageNum);

            if (pageNum < $scope.pdf.numPages) {
                // render next page
                $scope.pdf.getPage(pageNum + 1).then($scope.renderPage);
            }
            else {
                // all pages rendered
                $scope.$emit("allPagesRendered");
            }
        };

        var unbindLoadDocument= $scope.$on('loadDocument', function (event, documentUrl) {
            $scope.renderPDF(documentUrl);
        });

        // Controller initialized notify parent controller
        $scope.$emit("renderTemplateLoaded");

        // unbind event
        $scope.$on('$destroy', unbindLoadDocument);
    }]);