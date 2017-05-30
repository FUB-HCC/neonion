(function () {
    "use strict"; // enable strict mode

    /**
     * Widget to visualize relationships inside the text.
     * @returns {{}}
     */
    Annotator.Plugin.neonion.prototype.widgets['visualizeRelationship'] = function (scope, options) {
        var factory = {
            sideBarWidth: 100,
            connections: {},
            activeConnections: []
        };

        factory.load = function () {
            factory.g2d = factory.instantiateGraphicsOverlay();
            factory.svgContainer = factory.instantiateConnectionContainer();

            // attach to events
            $(scope.annotator.viewer.element[0])
                .on("mouseenter", ".annotator-viewer-relation button", function (event) {
                    var target = event.currentTarget,
                        annotationId = $(target).attr("data-value");
                    if (annotationId) {
                        var connection = scope.linkedAnnotations.find(function (annotation) {
                            return annotation['oa']['@id'] == annotationId;
                        });
                        if (connection) {
                            factory.activeConnections.push(connection);
                            factory.showRelation(connection);
                        }
                    }
                })
                .on("mouseleave", ".annotator-viewer-relation button", function () {
                    factory.activeConnections.forEach(factory.hideRelation);
                    factory.activeConnections = [];
                });
        };

        factory.getCompositeKey = function (annotation) {
            return [
                annotation['oa']['hasTarget']['hasSelector']['source'],
                annotation['oa']['hasTarget']['hasSelector']['target']
            ];
        };

        factory.instantiateGraphicsOverlay = function () {
            if ($(".annotator-relation-overlay")[0]) {
                return $(".annotator-relation-overlay").first();
            }
            else {
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("class", "annotator-relation-overlay");

                return $(svg)
                    .appendTo(".annotator-wrapper");
            }
        };

        factory.instantiateConnectionContainer = function () {
            return $(document.createElementNS('http://www.w3.org/2000/svg', 'g'))
                .appendTo(factory.g2d);
        };

        factory.instantiateConnection = function (source, target) {
            var path = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            path.setAttribute("class", "annotator-relation-line");
            var caption = document.createElementNS("http://www.w3.org/2000/svg", "text");
            caption.setAttribute("class", "annotator-relation-caption");

            return {
                element: $(path),
                caption: $(caption),
                relations: [],
                source: source,
                target: target
            };
        };

        factory.collectLinkedAnnotations = function (source) {
            return scope.linkedAnnotations.filter(function (annotation) {
                var selector = annotation['oa']['hasTarget']['hasSelector'];
                return selector && selector['source'] == source['oa']['@id'];
            });
        };

        factory.showRelation = function (annotation) {
            var key = factory.getCompositeKey(annotation);
            // check if the connection already exists
            if (!factory.connections.hasOwnProperty(key)) {
                var annotations = scope.getAnnotations();
                var source = annotations.find(function (item) {
                        return item['oa']['@id'] == annotation['oa']['hasTarget']['hasSelector']['source'];
                    }),
                    target = annotations.find(function (item) {
                        return item['oa']['@id'] == annotation['oa']['hasTarget']['hasSelector']['target'];
                    });

                factory.connections[key] = factory.instantiateConnection(source, target);
                factory.connections[key].element.appendTo(factory.svgContainer);
                factory.connections[key].caption.appendTo(factory.svgContainer);
            }

            var connection = factory.connections[key];
            if (connection.relations.indexOf(annotation) == -1) {
                connection.relations.push(annotation);
            }

            // add outline to annotation highlights
            connection.source.highlights
                .concat(connection.target.highlights)
                .forEach(function (highlight) {
                    $(highlight).addClass("annotator-relation-outline");
                });

            factory.redrawRelation(connection);
        };

        factory.hideRelation = function (annotation) {
            var key = factory.getCompositeKey(annotation);
            if (factory.connections.hasOwnProperty(key)) {
                var connection = factory.connections[key];
                connection.element.attr("class", "annotator-relation-line hideLine");
                connection.caption.hide();

                // remove outline from annotation highlights
                connection.source.highlights
                    .concat(connection.target.highlights)
                    .forEach(function (highlight) {
                        $(highlight).removeClass("annotator-relation-outline");
                    });
            }
        };

        factory.redrawRelation = function (connection) {
            if (connection['source'] && connection['target']) {
                var rectA = connection.source.highlights[0].getClientRects()[0],
                    rectB = connection.target.highlights[0].getClientRects()[0];

                connection.element
                    .attr("points", factory.getPoints(rectA, rectB).join(" "))
                    .attr("class", "annotator-relation-line fadeIn");

                // draw caption
                if (connection.relations.length) {
                    var caption = connection.caption;
                    var annotation = connection.relations[0];
                    var y = Math.min(rectA.top + rectA.height, rectB.top + rectB.height);
                    caption
                        .html(annotation['neonion']['viewer']['predicateLabel'])
                        .attr("x", factory.getWidth())
                        .attr("y", y)
                        .show();
                }
            }
        };

        factory.getWidth = function () {
            var rect = scope.annotator.element[0].getBoundingClientRect();
            return rect.left + rect.width + factory.sideBarWidth;
        };

        factory.getPoints = function (rectA, rectB) {
            var pts = [],
                outerPt = factory.getWidth(),
                x1 = rectA.left, y1 = rectA.top,
                x2 = rectB.left, y2 = rectB.top;

            y1 += rectA.height + 1;
            pts.push(x1 + "," + y1);

            //pts.push(x1 + "," + y1);
            pts.push(outerPt + "," + y1);
            y2 += rectB.height + 1;
            pts.push(outerPt + "," + y2);
            pts.push(x2 + "," + y2);

            return pts;
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
            // add field to viewer to place a summary of all properties
            scope.annotator.viewer.addField({
                load: factory.summarizeProperties
            });
        };

        factory.summarizeProperties = function (field, annotation) {
            $(field)
                .attr("class", "annotator-viewer-relation")
                .empty()
                .hide();

            if (annotation.hasOwnProperty("oa")) {
                switch (annotation.oa.motivatedBy) {
                    case scope.oa.motivation.classifying:
                    case scope.oa.motivation.identifying:
                        var linkedAnnotations = factory.getLinkedAnnotationsWithSubject(annotation['oa']['hasBody']['contextualizedAs']);
                        if (linkedAnnotations.length > 0) {
                            linkedAnnotations
                            // sort by relations by property label
                                .sort(function (p1, p2) {
                                    var label1 = p1['neonion']['viewer']['predicateLabel'],
                                        label2 = p2['neonion']['viewer']['predicateLabel'];
                                    if (label1 < label2) return -1;
                                    if (label1 > label2) return 1;
                                    return 0;
                                })
                                .forEach(function (statement) {
                                    var object = factory.getAnnotationById(statement['oa']['hasTarget']['hasSelector']['target']);
                                    // ensure the target annotation was found
                                    if (object) {
                                        $(field).append(factory.createRelationItem(annotation, statement, object));
                                    }
                                });
                            $(field).show();
                        }
                        break;
                }
            }
        };

        factory.onDeleteProperty = function (e) {
            var annotationId = e.currentTarget.getAttribute("data-value");
            if (annotationId) {
                var annotation = scope.linkedAnnotations.find(function (item) {
                    return item['oa']['@id'] == annotationId;
                });
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
        factory.createRelationItem = function (subject, relation, object) {
            return $("<button data-value='" + relation['oa']['@id'] + "'></button>")
            //.append("<span data-value='" + subject['oa']['@id'] + "' class='subject'>" + subject['oa']['hasBody']['label'] + "</span>")
                .append("<span class='predicate'>" + relation['neonion']['viewer']['predicateLabel'] + "</span>")
                .append("<span data-value='" + object['oa']['@id'] + "' class='object'>" + object['oa']['hasBody']['label'] + "</span>")
                .click(factory.onDeleteProperty);
        };

        return factory;
    };

})();