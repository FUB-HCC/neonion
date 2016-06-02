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

    /**
     * Widget create a property from a field in viewer.
     * @returns {{}}
     */
    Annotator.Plugin.neonion.prototype.widgets['pointAndLightRelations'] = function (scope, options) {
        var factory = {
            path : [],
            selection : [],
            options : {
                debug: true,
                selectionRadius : function() { return screen.height * 0.2 },
                selectionCount: 1,
                cullAnnotations : true,
                cullingDistance : function () { return screen.height * 0.8 },
                FOWRadians : Math.PI / 6
            },
            math : {
                vector2 : function (x, y) {
                    return {x : x, y : y}
                },
                add : function (v1, v2) {
                    return factory.math.vector2(v1.x - v2.x, v1.y - v2.y);
                },
                subtract : function (v1, v2) {
                    return factory.math.vector2(v1.x - v2.x, v1.y - v2.y);
                },
                multiply : function(vector, multiplier) {
                    return factory.math.vector2(vector.x * multiplier, vector.y * multiplier);
                },
                divide : function(vector, divisor) {
                    return factory.math.vector2(vector.x / divisor, vector.y / divisor);
                },
                normalize : function (vector) {
                    return factory.math.divide(vector, factory.math.distance(factory.math.vector2(0, 0), vector))
                },
                dot : function (v1, v2) {
                    return v1.x * v2.x + v1.y * v2.y;
                },
                distance : function (ptA, ptB) {
                    return Math.sqrt(
                        (ptA.x - ptB.x) * (ptA.x - ptB.x) + (ptA.y - ptB.y) * (ptA.y - ptB.y)
                    );
                },
                center: function (rect) {
                    return factory.math.vector2(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
                }
            },
            helper : {
                annotationCentroid : function (annotation) {
                    return factory.math.center(annotation.highlights[0].getClientRects()[0]);
                }
            }
        };

        factory.load = function () {
            factory.g2d = factory.createGraphicsOverlay();

            scope.annotator.subscribe("annotationCreated", factory.collectAnnotations);
            scope.annotator.subscribe("annotationDeleted", factory.collectAnnotations);
            scope.annotator.subscribe("annotationsLoaded", factory.collectAnnotations);

            $(document).mousemove(function (event) {
                if (factory.isActive()) {
                    var cursor = factory.math.vector2(event.clientX, event.clientY);
                    factory.selection = factory.selectNearbyAnnotations(cursor);

                    for(var key in factory.path) {
                        factory.toggleSegment(factory.path[key], false);
                    }

                    for (var i = 0; i < factory.selection.length; i++) {
                        var source = factory.selection[i];
                        var counterparts = factory.getCounterparts(source, cursor);
                        for (var c = 0; c < counterparts.length; c++) {
                            var key = factory.getCompositeKey(source, counterparts[c]);
                            if (!factory.path.hasOwnProperty(key)) {
                                factory.path[key] = factory.instantiateSegment(source, counterparts[c]);
                                factory.g2d.append(factory.path[key].path);
                            }
                            factory.toggleSegment(factory.path[key], true);
                        }
                    }

                    factory.updateGraphics(factory.g2d, cursor);
                }
            });
        };

        factory.collectAnnotations = function () {
            factory.annotations = scope.getAnnotations();
        };

        factory.isActive = function (active) {
            return scope.annotationMode() == scope.annotationModes.conceptTagging;
        };

        factory.toggleSegment = function (segment, active) {
            if (segment.active != active) {
                segment.active = active;
                if (active) {
                    segment.path.setAttribute("class", "annotator-svg-relation fade in");
                }
                else {
                    segment.path.setAttribute("class", "annotator-svg-relation fade");
                }
            }
        };

        factory.getCompositeKey = function (annoA, annoB) {
            return [
                annoA['oa']['@id'],
                annoB['oa']['@id']
            ];
        };

        factory.getCounterparts = function (source, cursor) {
            var centerSource = factory.helper.annotationCentroid(source);
            var coneCenterLine = factory.math.normalize(
                factory.math.subtract(cursor, centerSource));

            return factory.getCompatibleAnnotations(source)
                .filter(function (annotation) {
                    if (factory.options.cullAnnotations) {
                        var centerTarget = factory.helper.annotationCentroid(annotation);
                        var direction = factory.math.normalize(
                            factory.math.subtract(centerTarget, centerSource));

                        return factory.math.distance(centerSource, centerTarget) < factory.options.cullingDistance() &&
                            factory.math.dot(coneCenterLine, direction) >= Math.cos(factory.options.FOWRadians);
                    }
                    return true;
                });
            // TODO check culling
        };

        factory.getCompatibleAnnotations = function (source) {
            return factory.annotations.filter(function (annotation) {
                // TODO integrate concept set
                return annotation != source;
            })
        };

        factory.createGraphicsOverlay = function() {
             return $("<svg class='annotator-relation-overlay' shape-rendering='auto' xmlns='http://www.w3.org/2000/svg' />")
                 .appendTo(".annotator-wrapper");
        };

        factory.updateGraphics = function (g2d, cursor) {
            for(var key in factory.path) {
                //if (factory.path[key].active) {
                    // TODO
                    var pts = [];
                    var pt1 = factory.helper.annotationCentroid(factory.path[key].source);
                    var pt2 = factory.helper.annotationCentroid(factory.path[key].target);
                    pts.push(pt1.x + "," + pt1.y);
                    pts.push(pt2.x + "," + pt2.y);
                    factory.path[key].path.setAttribute("points", pts.join(" "));

                //}
            }
            if (factory.options.debug) {
                factory.drawDebug();
            }
        };

        factory.drawDebug = function (g2d, cursor) {

        };

        factory.instantiateSegment = function(source, target) {
            var line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
            line.setAttribute("class", "annotator-svg-relation fade");

            return {
                key : factory.getCompositeKey(source, target),
                source : source,
                target : target,
                active : false,
                path : line
            }
        };

        factory.selectNearbyAnnotations = function (cursor) {
            return factory.annotations
                // get annotation within the radius
                .filter(function (annotation) {
                    var center = factory.helper.annotationCentroid(annotation);
                    return factory.math.distance(cursor, center) < factory.options.selectionRadius();
                })
                // sort by distance to mouse
                .sort(function (a, b) {
                    var centerA = factory.helper.annotationCentroid(a);
                    var centerB = factory.helper.annotationCentroid(b);
                    return factory.math.distance(cursor, centerA) - factory.math.distance(cursor, centerB);
                })
                // return closest annotations
                .slice(0, factory.options.selectionCount);
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
                    return matchingConcepts.indexOf(annotation['oa']['hasBody']['classifiedAs']) != -1;
                }
                return false;
            });
        };

        return factory;
    };

})();