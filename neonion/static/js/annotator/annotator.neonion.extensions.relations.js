(function () {
    "use strict"; // enable strict mode
    
    /**
     * Widget to visualize relationships inside the text.
     * @returns {{}}
     */
    Annotator.Plugin.neonion.prototype.widgets['visualizeRelationship'] = function (scope, options) {
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
            return [
                annotation['oa']['hasTarget']['hasSelector']['source'], 
                annotation['oa']['hasTarget']['hasSelector']['target']
            ];
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
                        return item['oa']['@id'] == annotation['oa']['hasTarget']['hasSelector']['source'];
                    }).pop(),
                    target: annotations.filter(function (item) {
                        return item['oa']['@id'] == annotation['oa']['hasTarget']['hasSelector']['target'];
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
                if (factory.relationMap[key]['source'] && factory.relationMap[key]['target']) {
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
    Annotator.Plugin.neonion.prototype.widgets['viewerSummarizeStatements'] = function (scope, options) {
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
                        var linkedAnnotations = factory.getLinkedAnnotationsWithSubject(annotation['oa']['hasBody']['contextualizedAs']);
                        if (linkedAnnotations.length > 0) {
                            linkedAnnotations.forEach(function (statement) {
                                var object = factory.getAnnotationById(statement['oa']['hasTarget']['hasSelector']['target']);
                                // ensure the target annotation was found
                                if (object) {
                                    $(field).append(factory.createStatementHTML(annotation, statement, object));
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
                return annotation['neonion']['viewer']['source'] == subject;
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
                    return annotation['oa']['@id'] == id;
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
        factory.createStatementHTML = function (subject, statement, object) {
            return "<li>" +
                subject['oa']['hasBody']['label'] + "&nbsp;" +
                statement['neonion']['viewer']['predicateLabel'] + "&nbsp;" +
                object['oa']['hasBody']['label'] +
                "<i class='pull-right fa fa-times fa-1' data-action='delete-property' data-value='" + statement.id + "'></i>" +
                "</li>";
        };

        return factory;
    };

})();