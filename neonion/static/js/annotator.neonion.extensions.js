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
     * @returns {Widget}
     */
    Annotator.Plugin.Neonion.prototype.widgets['storeContext'] = function () {
        var factory = {};

        factory.load = function (scope, options) {
            // extract the context information when the editor was submitted
            scope.annotator.subscribe("annotationEditorSubmit", function (editor, annotation) {
                annotation.context = factory.extractSurroundedContent(annotation, scope.annotator);
            });
        };

        /**
         * Extracts the text left and right of the annotation quote
         * @param annotation
         * @param annotator
         * @returns {{left: string, right: string}}
         */
        factory.extractSurroundedContent = function (annotation, annotator) {
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