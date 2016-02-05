(function () {
    "use strict"; // enable strict mode

    /**
     * Custom formatter for persons.
     * @param value
     * @returns {*}
     */
    Annotator.Plugin.Neonion.prototype.formatter['http://neonion.org/concept/person'] = function (value) {
        var label = value.label;
        if (value.birth) {
            label += "<span>&nbsp;&#42;&nbsp;" + value.birth;
            if (value.death) {
                label += ",&nbsp;&#8224;&nbsp;" + value.death;
            }
            label += "</span>";
        }

        if (value.descr) {
            label += "<br/><span>" + value.descr + "</span>";
        }
        return label;
    };

    /**
     * Widget to store the surrounded text of the annotation quote.
     * @returns {}
     */
    Annotator.Plugin.Neonion.prototype.widgets['contextInformation'] = function (scope, options) {
        var factory = {};

        factory.load = function () {
            // extract the context information when the editor was submitted
            scope.annotator.subscribe("annotationEditorSubmit", function (editor, annotation) {
                if (!annotation.hasOwnProperty('neonion')) {
                    annotation['neonion'] = {};
                }
                // add context information
                annotation['neonion']['context'] = {
                    'pageIdx': factory.getPageIndex(annotation, scope.annotator),
                    'surrounding': factory.getSurroundedContent(annotation, scope.annotator),
                    'normalizedHighlights': factory.getHighlightRectangles(annotation, scope.annotator)
                };
            });
        };

        /**
         * Returns the element representing the page bounds.
         * @param annotation
         * @param annotator
         */
        factory.getPageElement = function (annotation, annotator) {
            var node = null;
            if (annotation.highlights.length > 0) {
                node = $(annotation.highlights[0]);
                while (!node.parent().hasClass('annotator-wrapper')) {
                    // move up until annotator-wrapper is reached
                    node = node.parent();
                }
                // convert selector to DOM element
                node = node[0];
            }
            return node;
        };

        /**
         * Returns the page index on the document.
         * @param annotation
         * @param annotator
         */
        factory.getPageIndex = function (annotation, annotator) {
            var page = factory.getPageElement(annotation, annotator);
            // return the index of the page
            return $(page.parentNode).children("div").index(page);
        };

        factory.getHighlightRectangles = function (annotation, annotator) {
            var page = factory.getPageElement(annotation, annotator);
            var pageBounds = page.getBoundingClientRect();
            var rects = [];

            annotation.highlights.forEach(function (highlight) {
                var clientRects = highlight.getClientRects();
                // convert ClientRectList to array
                for (var i = 0; i < clientRects.length; i++) {
                    rects.push({
                        'top': clientRects[i].top,
                        'left': clientRects[i].left,
                        'width': clientRects[i].width,
                        'height': clientRects[i].height
                    });
                }
            });

            // return an array of normalized rectangles
            return rects.map(function (rect) {
                // map coordinate to page space and normalize
                rect.top = (rect.top - pageBounds.top) / pageBounds.height;
                rect.left = (rect.left - pageBounds.left) / pageBounds.width;
                // normalize size
                rect.width = rect.width / pageBounds.width;
                rect.height = rect.height / pageBounds.height;
                return rect;
            });
        };

        /**
         * Extracts the text left and right of the annotation quote
         * @param annotation
         * @param annotator
         * @returns {{left: string, right: string}}
         */
        factory.getSurroundedContent = function (annotation, annotator) {
            var length = 70;
            var node, contentLeft = '', contentRight = '';
            // left
            node = annotation.highlights[0];
            while (node != annotator.element[0] && contentLeft.length < length) {
                if (node.previousSibling) {
                    node = node.previousSibling;
                    // prepend extracted text
                    contentLeft = $(node).text() + contentLeft;
                }
                else {
                    node = node.parentNode;
                }
            }

            // right
            node = annotation.highlights[annotation.highlights.length - 1];
            while (node != annotator.element[0] && contentRight.length < length) {
                if (node.nextSibling) {
                    node = node.nextSibling;
                    // append extracted text
                    contentRight += $(node).text();
                }
                else {
                    node = node.parentNode;
                }
            }
            // replace line feed with space
            contentLeft = contentLeft.replace(/(\r\n|\n|\r)/gm, " ");
            contentRight = contentRight.replace(/(\r\n|\n|\r)/gm, " ");

            var leftC = contentLeft.trimLeft().substr(-length);
            var rightC = contentRight.trimRight().substr(0, length);

            return {
                left: leftC.substring(leftC.indexOf(" ") + 1),
                right: rightC.substring(0, rightC.lastIndexOf(" "))
            };
        };

        return factory;
    };

})();