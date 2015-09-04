(function () {
    "use strict"; // enable strict mode

    /**
     * Widget to store the page and paragraph of the annotation.
     * @returns {{}}
     */
    Annotator.Plugin.Neonion.prototype.widgets['storePageReference'] = function (scope, options) {
		var factory = {};

		factory.load = function () {
            scope.annotator.subscribe("annotationEditorSubmit", factory.storePageReference);
        };

        factory.storePageReference = function (editor, annotation) {
            var pageNode = null, paragraphNode = null;
            var currentNode = annotation.highlights[0];
            while(currentNode.parentNode != scope.annotator.element[0]) {
                currentNode = currentNode.parentNode;
                switch(currentNode.tagName.toLowerCase()) {
                    case "table":
                        pageNode = currentNode;
                        break;
                    case "div":
                        if ($(currentNode).hasClass("paragraph")) {
                            paragraphNode = currentNode;
                        }
                        break;
                }
            }
            // store page and paragraph
            if (pageNode) {
                if (!annotation.hasOwnProperty("extensions")) {
                    annotation.extensions = {};
                }
                annotation.extensions.reference = {
                    page : $(pageNode.parentNode).find("table").index(pageNode) + 1
                };
                if (paragraphNode) {
                    annotation.extensions.reference.paragraph = $(paragraphNode.parentNode).find(".paragraph").index(paragraphNode) + 1;
                }
            }
        };

        return factory;
    };

})();