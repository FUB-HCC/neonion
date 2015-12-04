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

    /**
     * Widget to visualize relationships inside the text.
     * @returns {{}}
     */
    Annotator.Plugin.Neonion.prototype.widgets['visualizeRelationship'] = function (scope, options) {
        var factory = {};

        factory.sideBarWidth = 100;
        factory.maxDistance = 500;
        factory.relationMap = {};

        factory.load = function () {
            // attach to events
            scope.annotator.subscribe("linkedAnnotationCreated", factory.relationCreated);
            scope.annotator.subscribe("linkedAnnotationDeleted", factory.relationDeleted);
            scope.annotator.subscribe("annotationsLoaded", factory.relationsLoaded);
        };

        factory.getCompositeKey = function (annotation) {
            return [annotation.oa.hasTarget.source, annotation.oa.hasTarget.target];
        };

        factory.relationsLoaded = function (annotations) {
            factory.relationMap = {};
            for (var i = 0; i < scope.linkedAnnotations.length; i++) {
                factory.relationCreated(scope.linkedAnnotations[i]);
            }
        };

        factory.relationCreated = function (annotation) {
            var key = factory.getCompositeKey(annotation);
            if (!factory.relationMap.hasOwnProperty(key)) {
                var element = $("<svg class='annotator-relation-line fade' shape-rendering='crispEdges' xmlns='http://www.w3.org/2000/svg' />")
                    .appendTo(".annotator-wrapper");
                var annotations = scope.getAnnotations();

                factory.relationMap[key] = {
                    element: element,
                    relations: [],
                    source: annotations.filter(function (item) {
                        return item.id == annotation.oa.hasTarget.source
                    }).pop(),
                    target: annotations.filter(function (item) {
                        return item.id == annotation.oa.hasTarget.target
                    }).pop()
                };
                // delay fade in
                window.setTimeout(function () {
                    element.attr("class", "annotator-relation-line fade in");
                }, 20);
            }

            factory.relationMap[key].relations.push(annotation);
            factory.redrawRelation(key);
        };

        factory.relationDeleted = function (annotation) {
            var key = factory.getCompositeKey(annotation);
            if (factory.relationMap.hasOwnProperty(key)) {
                var relationIdx = factory.relationMap[key].relations.indexOf(annotation);
                if (relationIdx != -1) {
                    factory.relationMap[key].relations.splice(relationIdx, 1);
                }
                // hide relation element if there are no relations
                if (factory.relationMap[key].relations.length == 0) {
                    // hide DOM elements
                    factory.relationMap[key]['element'].attr("class", "annotator-relation-line fade");
                    delete factory.relationMap[key];
                }
            }
        };

        factory.redrawRelation = function (key) {
            if (factory.relationMap.hasOwnProperty(key)) {
                var annotatorBoundingRect = scope.annotator.element[0].getBoundingClientRect();
                var sourceRects = factory.relationMap[key].source.highlights[0].getClientRects();
                var targetRects = factory.relationMap[key].target.highlights[0].getClientRects();

                // calculate bounds of the SVG container
                var bounds = {
                    offsetTop: annotatorBoundingRect.top,
                    offsetLeft: annotatorBoundingRect.left,
                    top: Math.floor(Math.min(sourceRects[0].top, targetRects[0].top) - annotatorBoundingRect.top),
                    left: 0, // Math.floor(Math.min(sourceRects[0].left, targetRects[0].left) - annotatorBoundingRect.left),
                    height: Math.ceil(Math.max(targetRects[0].top + targetRects[0].height - sourceRects[0].top,
                            sourceRects[0].top + sourceRects[0].height - targetRects[0].top) + 1),
                    transform: function (pt) {
                        return {
                            left: Math.floor(pt.left - this.left - this.offsetLeft),
                            top: Math.floor(pt.top - this.top - this.offsetTop)
                        };
                    }
                };
                bounds.width = Math.ceil(annotatorBoundingRect.width - bounds.left + factory.calculateRelationOffset(sourceRects[0], targetRects[0]));

                // set position of SVG container
                factory.relationMap[key]['element']
                    .empty()
                    .css("top", bounds.top).css("left", bounds.left)
                    .width(bounds.width).height(bounds.height);

                // create SVG polyline
                var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                line.setAttribute("class", "annotator-svg-relation");
                var pts = [];

                if (sourceRects[0].top != targetRects[0].top) {
                    var pt1 = bounds.transform(sourceRects[0]), pt2 = bounds.transform(targetRects[0]);
                    pts.push(pt1.left + "," + pt1.top);
                    pt1.top += sourceRects[0].height;
                    pts.push(pt1.left + "," + pt1.top);

                    pts.push(pt1.left + "," + pt1.top);
                    pts.push(bounds.width - 1 + "," + pt1.top);
                    pts.push(bounds.width - 1 + "," + pt2.top);
                    pts.push(pt2.left + "," + pt2.top);
                    pt2.top += targetRects[0].height;
                    pts.push(pt2.left + "," + pt2.top);
                }
                else {
                    var pt1 = bounds.transform(sourceRects[0]), pt2 = bounds.transform(targetRects[0])
                    pts.push(pt1.left + sourceRects[0].width * 0.5 + "," + pt1.top + sourceRects[0].height);
                    pts.push(pt2.left + targetRects[0].width * 0.5 + "," + pt2.top + targetRects[0].height);
                }
                line.setAttribute("points", pts.join(" "));
                // append element to DOM
                factory.relationMap[key]['element'].append(line);

                factory.redrawRelationCaption(key);
            }
        };

        factory.redrawRelationCaption = function (key) {

        };

        factory.calculateRelationOffset = function(sourceA, targetB) {
            return (Math.min(Math.abs(sourceA.top - targetB.top), factory.maxDistance) / factory.maxDistance) * factory.sideBarWidth;
        };

        return factory;
    };

    /**
     * Widget to show existing properties in the viewer.
     * @returns {{}}
     */
    Annotator.Plugin.Neonion.prototype.widgets['viewerSummarizeStatements'] = function (scope, options) {
        var factory = {};

        factory.load = function () {
            $(".annotator-viewer").on("click", "[data-action='delete-property']", factory.onDeleteProperty);

            // add field to viewer to place a summary of all properties
            scope.annotator.viewer.addField({
                load: factory.summarizeProperties
            });
        };

        factory.summarizeProperties = function (field, annotation) {
            $(field).empty().hide();
            if (annotation.hasOwnProperty("oa")) {
                switch (annotation.oa.motivatedBy) {
                    case scope.oa.motivation.classifying:
                    case scope.oa.motivation.identifying:
                        var linkedAnnotations = factory.getLinkedAnnotationsWithSubject(scope.helper.getSemanticTag(annotation).uri);
                        if (linkedAnnotations.length > 0) {
                            linkedAnnotations.forEach(function (statement) {
                                var object = factory.getAnnotationById(statement.oa.hasTarget.target);
                                // ensure the target annotation was found
                                if (object) {
                                    $(field).append(factory.createStatementHTML(scope.helper.getSemanticTag(annotation),
                                        scope.helper.getSemanticTag(statement),
                                        scope.helper.getSemanticTag(object), statement.id));
                                }
                            });
                            $(field).wrapInner("<ul></ul>").show();
                        }
                        break;
                }
            }
        };

        factory.onDeleteProperty = function (e) {
            var annotationId = e.target.getAttribute("data-value");
            if (annotationId) {
                var annotation = scope.linkedAnnotations.filter(function (item) {
                    return item.id == annotationId;
                }).pop();
                scope.deleteLinkedAnnotation(annotation);
            }
            // update interface
            scope.annotator.viewer.hide();
        };

        /**
         * Find all linked annotations stating something about a given subject.
         * @param subject
         * @returns {Array.<T>}
         */
        factory.getLinkedAnnotationsWithSubject = function (subject) {
            return scope.linkedAnnotations.filter(function (annotation) {
                return scope.helper.getSemanticTag(annotation).subject == subject;
            });
        };

        /**
         * Returns the annotation object with the given id.
         * @param id
         * @returns {T}
         */
        factory.getAnnotationById = function (id) {
            return scope.getAnnotations()
                .filter(function (annotation) {
                    return annotation.id == id;
                })
                .pop();
        };

        /**
         * Returns a HTML representation of a statement.
         * @param subject
         * @param predicate
         * @param object
         * @returns {String}
         */
        factory.createStatementHTML = function (subject, predicate, object, annotationId) {
            return "<li>" +
                subject.label + "&nbsp;" +
                predicate.predicateLabel + "&nbsp;" +
                object.label +
                "<i class='pull-right fa fa-times fa-1' data-action='delete-property' data-value='" + annotationId + "'></i>" +
                "</li>";
        };

        return factory;
    };

    /**
     * Widget create a property from a field in viewer.
     * @returns {{}}
     */
    Annotator.Plugin.Neonion.prototype.widgets['viewerCreateProperty'] = function (scope, options) {
        var factory = {
            focusedAnnotation: null,
            selectProperty: null,
            groupedObjects: {}
        };

        factory.load = function () {
            // add field to viewer to place porperties
            scope.annotator.viewer.addField({
                load: factory.loadPropertyField
            });

            $(".annotator-viewer").on("click", "[data-action='create-property']", factory.onCreateProperty);

            factory.setupDialog();
        };

        factory.loadPropertyField = function (field, annotation) {
            $(field).empty().hide();
            if (annotation.hasOwnProperty("oa")) {
                switch (annotation.oa.motivatedBy) {
                    case scope.oa.motivation.classifying:
                    case scope.oa.motivation.identifying:
                        var conceptDefinition = scope.getConcept(scope.helper.getSemanticTag(annotation).typeof);
                        if (conceptDefinition && conceptDefinition.properties.length > 0) {
                            conceptDefinition.properties.forEach(function (property, index) {
                                var propertyBtn = $(factory.createPropertyItemHTML(property, index));
                                if (!factory.hasSuitableAnnotations(property)) {
                                    // disable button if there are no suitable instances
                                    propertyBtn.prop('disabled', true);
                                }
                                $(field).append(propertyBtn);
                            });
                            factory.focusedAnnotation = annotation;
                            $(field).show();
                        }
                        break;
                }
            }
        };

        /**
         * Checks whether the page contains annotations with suitable concept types for the given property.
         * @param property
         */
        factory.hasSuitableAnnotations = function (property) {
            // get tne URIs of all suitable concepts
            var matchingConcepts = scope.concepts.filter(function (concept) {
                    return property.range.indexOf(concept.id) != -1;
                })
                .map(function (concept) {
                    return concept.uri;
                });

            return scope.getAnnotations().some(function (annotation) {
                if (scope.helper.getMotivationEquals(annotation, scope.oa.motivation.classifying) ||
                    scope.helper.getMotivationEquals(annotation, scope.oa.motivation.identifying)) {
                    return matchingConcepts.indexOf(scope.helper.getSemanticTag(annotation).typeof) != -1;
                }
                return false;
            });
        };

        factory.onCreateProperty = function (e) {
            if (factory.focusedAnnotation) {
                var concept = scope.getConcept(scope.helper.getSemanticTag(factory.focusedAnnotation).typeof);
                if (concept) {
                    // get index of property from target value
                    var propertyIdx = parseInt($(e.target).val());

                    // get the property description
                    factory.selectedProperty = concept.properties[propertyIdx];

                    // find all suitable concepts for property
                    var matchingConcepts = scope.concepts.filter(function (concept) {
                        return factory.selectedProperty.range.indexOf(concept.id) != -1;
                    });

                    // find all annotations matching that concepts
                    var annotations = scope.getAnnotationsMatchingConcepts(matchingConcepts);

                    // group annotations by their uri and cache result in factory
                    factory.groupedObjects = scope.groupAnnotationBy(annotations,
                        function (annotation) {
                            return scope.helper.getSemanticTag(annotation).uri;
                        }
                    );

                    factory.showDialog(scope.helper.getSemanticTag(factory.focusedAnnotation), factory.selectedProperty, factory.groupedObjects);
                }
            }
        };

        factory.setupDialog = function () {
            factory.dialog = document.createElement("dialog");
            factory.dialogSection = $("<section></section>");
            factory.dialogSection.appendTo(factory.dialog);

            factory.dialogSection.on("click", "[data-action='dialog-close']", factory.closeDialog);
            factory.dialogSection.on("click", "[data-action='dialog-submit']", factory.submitDialog);

            // check if the browser supports the dialog element
            if (!factory.dialog.showModal) {
                // load external library polyfill dialog
                $.getScript("https://cdnjs.cloudflare.com/ajax/libs/dialog-polyfill/0.4.1/dialog-polyfill.min.js", function () {
                    // register at dialog at polyfill
                    dialogPolyfill.registerDialog(factory.dialog);
                    // load stylesheet
                    $('head').prepend('<link rel="stylesheet" type="text/css" ' +
                        'href="https://cdnjs.cloudflare.com/ajax/libs/dialog-polyfill/0.4.1/dialog-polyfill.min.css">');
                });
            }

            scope.annotator.wrapper[0].appendChild(factory.dialog);
        };

        factory.showDialog = function (subject, property, objects) {
            // for each uri in grouped objects take the first item as representative
            var items = [];
            for (var key in objects) {
                items.push({
                    uri: key,
                    label: scope.helper.getSemanticTag(objects[key][0]).label
                });
            }
            // sort items by label alphabetically
            items.sort(scope.comparator.compareByLabel);

            // add heading to dialog
            factory.dialogSection.empty()
                .append("<a class='pull-right' data-action='dialog-close'><i class='fa fa-times'></i></a>")
                .append("<h5>" + subject.label + "&nbsp;" + property.label + ":</h5>");

            factory.itemSection = $("<div class='list-group'></div>");

            // add item to dialog
            var group = $("<div class='btn-group-vertical' role='group'></div>");
            items.forEach(function (item) {
                group.append(factory.createInstanceItemHTML(item));
            });
            factory.dialogSection.append(group);

            // update interface
            scope.annotator.viewer.hide();
            factory.dialog.showModal();
        };

        factory.submitDialog = function (e) {
            var uri = $(e.target).val();
            if (factory.groupedObjects.hasOwnProperty(uri)) {
                var annotations = factory.groupedObjects[uri];

                // sort annotations by euclidean distance to focused annotation
                annotations.sort(function (a, b) {
                    return factory.euclideanDistance(factory.focusedAnnotation, a) - factory.euclideanDistance(factory.focusedAnnotation, b);
                });

                // principle of proximity - the annotation with the closest distance to the focused annotation becomes the target
                scope.createLinkedAnnotation(factory.focusedAnnotation, factory.selectedProperty, annotations[0]);
            }

            factory.closeDialog();
        };

        /**
         * Calculates the euclidean distance between two annotations.
         * @param a
         * @param b
         * @returns {number}
         */
        factory.euclideanDistance = function (a, b) {
            a = a.highlights[0].getBoundingClientRect();
            b = b.highlights[0].getBoundingClientRect();
            var centerA = {x: a.left + a.width * 0.5, y: a.top + a.height * 0.5};
            var centerB = {x: b.left + b.width * 0.5, y: b.top + b.height * 0.5};
            return Math.sqrt((centerA.x - centerB.x) * (centerA.x - centerB.x) + (centerA.y - centerB.y) * (centerA.y - centerB.y));
        };

        factory.closeDialog = function () {
            factory.dialog.close();
            factory.focusedAnnotation = null;
        };

        factory.createInstanceItemHTML = function (instance) {
            return "<button type='button' class='btn btn-default' data-action='dialog-submit' value='" +
                instance.uri + "'>" + instance.label + "</button>";
        };

        factory.createPropertyItemHTML = function (property, index) {
            return "<button class='btn btn-secondary btn-xs btn-spacing' data-action='create-property' type='button' value='" + index + "'>" +
                property.label + "</button>";
        };

        return factory;
    };

})();