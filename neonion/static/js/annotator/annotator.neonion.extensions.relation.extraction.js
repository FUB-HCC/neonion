(function () {
    "use strict"; // enable strict mode

    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }

    Vector2.prototype = {
        add: function (v2) {
            return new Vector2(this.x - v2.x, this.y - v2.y);
        },
        subtract: function (v2) {
            return new Vector2(this.x - v2.x, this.y - v2.y);
        },
        multiply: function (multiplier) {
            return new Vector2(this.x * multiplier, this.y * multiplier);
        },
        divide: function (divisor) {
            return new Vector2(this.x / divisor, this.y / divisor);
        },
        normalize: function () {
            return this.divide(this.magnitude());
        },
        dot: function (v2) {
            return this.x * v2.x + this.y * v2.y;
        },
        cross: function (v2) {
            return new Vector2(this.x * v2.y - v2.x * this.y, this.y * v2.x - v2.y * this.x);
        },
        rotate90: function (ccw) {
            // counter clock-wise rotation
            if (ccw) {
                return new Vector2(-this.y, this.x);
            }
            else {
                return new Vector2(this.y, -this.x);
            }
        },
        magnitude: function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        lerp: function (v1, v2, t) {
            return v1.add(v1.subtract(v2).multiply(t));
        },
        distance: function (v1, v2) {
            return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
        },
        undefinedVector: function () {
            return new Vector2(Number.NaN, Number.NaN);
        }
    };

    function Line2D(start, end) {
        this.start = start;
        this.end = end;
    }

    Line2D.prototype = {
        contains: function (point) {
            if (point.x != Number.NaN && point.y != Number.NaN) {
                var v1 = this.end.subtract(this.start);
                var v2 = point.subtract(this.start);
                var v3 = point.subtract(this.end);
                return v2.dot(v1) > 0 && v3.dot(v1) < 0;
            }
            return false;
        },
        intersection: function (line) {
            // https://en.wikipedia.org/wiki/Line–line_intersection#Given_two_points_on_each_line
            var x_1 = this.start.x, y_1 = this.start.y;
            var x_2 = this.end.x, y_2 = this.end.y;
            var x_3 = line.start.x, y_3 = line.start.y;
            var x_4 = line.end.x, y_4 = line.end.y;

            var divisor = (x_1 - x_2) * (y_3 - y_4) - (y_1 - y_2) * (x_3 - x_4);
            if (divisor != 0) {
                var a = ((x_1 * y_2 - y_1 * x_2) * (x_3 - x_4) - (x_1 - x_2) * (x_3 * y_4 - y_3 * x_4)) / divisor;
                var b = ((x_1 * y_2 - y_1 * x_2) * (y_3 - y_4) - (y_1 - y_2) * (x_3 * y_4 - y_3 * x_4)) / divisor;
                return new Vector2(a, b);
            } else {
                // case lines are parallel
                return Vector2.prototype.undefinedVector();
            }
        }
    };

    function Rect2D(left, width, top, height) {
        this.left = left;
        this.width = width;
        this.top = top;
        this.height = height;
    }

    Rect2D.prototype = {
        // ratio of the golden cut
        PHI: 1.6180339887498948,
        center: function () {
            return new Vector2(this.left + this.width * 0.5, this.top + this.height * 0.5);
        },
        pivot: function () {
            // pivot.x is calculated based on the ratio PHI
            return new Vector2(this.left + this.width - (this.width / this.PHI), this.top + this.height * 0.5);
        },
        offset: function (pixel) {
            return new Rect2D(this.left - pixel, this.width + 2 * pixel, this.top - pixel, this.height + 2 * pixel);
        },
        contains: function (point) {
            return point.x >= this.left && point.x <= this.left + this.width &&
                point.y >= this.top && point.y <= this.top + this.height;
        },
        boundingLines: function () {
            return [
                new Line2D(new Vector2(this.left, this.top), new Vector2(this.left + this.width, this.top)),
                new Line2D(new Vector2(this.left + this.width, this.top), new Vector2(this.left + this.width, this.top + this.height)),
                new Line2D(new Vector2(this.left + this.width, this.top + this.height), new Vector2(this.left, this.top + this.height)),
                new Line2D(new Vector2(this.left, this.top + this.height), new Vector2(this.left, this.top))
            ]
        },
        lineIntersection: function (line) {
            var lines = this.boundingLines();
            var intersections = [];
            for (var i = 0; i < lines.length; i++) {
                var intersectionPt = line.intersection(lines[i]);
                if (lines[i].contains(intersectionPt))
                    intersections.push(intersectionPt);
            }
            return intersections;
        },
        fromClientRect: function (rect) {
            return new Rect2D(rect.left, rect.width, rect.top, rect.height);
        }
    };

    /**
     * Widget create relations interactively.
     * @returns {{}}
     */
    Annotator.Plugin.neonion.prototype.widgets['pointAndLightRelations'] = function (scope, options) {
        var SVG_NS = "http://www.w3.org/2000/svg";
        var XLink_NS = "http://www.w3.org/1999/xlink";

        var factory = {
            connections: [],
            selectedAnnotation: null,
            activeAnnotations: [],
            hoveredAnnotation: null,
            hoveredAnnotationRect: null,
            selectedConnection: null,
            flags: 0,
            STATUS_FLAGS: {NONE: 0, ANNOTATION_SELECTED: 1, MENU_VISIBLE: 2},
            options: {
                cullAnnotationsByFrustum: true,
                previewCulledConnections: true,
                filterAnnotations: true,
                bidirectionalCheck: true,
                highlightExistingRelations: true,
                excludeInverseProperties: true,
                FOWDegrees: 10,
                runnerSize: 20,
                connectionTrimmedLength: 30,
                activationProximityLimit: 30,
                maxPathLifting: 100,
                createImagePath: "/static/img/annotator/relation_create.svg",
                editImagePath: "/static/img/annotator/relation_edit.svg"
            },
            helper: {
                /**
                 * Returns a composite hash key from the given annotations.
                 * @param source
                 * @param target
                 * @returns {*[]}
                 */
                getCompositeKey: function (source, target) {
                    return [
                        source['oa']['@id'],
                        target['oa']['@id']
                    ];
                },
                /**
                 * Checks whether the given annotation is a semantic annotation.
                 * @param annotation
                 * @returns {boolean}
                 */
                isSemanticAnnotation: function (annotation) {
                    return scope.helper.getMotivationEquals(annotation, scope.oa.motivation.classifying) ||
                        scope.helper.getMotivationEquals(annotation, scope.oa.motivation.identifying);
                },
                /**
                 * Checks whether the provided annotations have at least one common relationships.
                 * @param source
                 * @param target
                 * @returns {boolean}
                 */
                hasCommonRelation: function (source, target) {
                    if (factory.helper.isSemanticAnnotation(source) && factory.helper.isSemanticAnnotation(target)) {
                        var sourceConcept = scope.getConceptDefinition(source['oa']['hasBody']['classifiedAs']);
                        var targetConcept = scope.getConceptDefinition(target['oa']['hasBody']['classifiedAs']);

                        // check whether the source properties contains the target concept type
                        var valid = sourceConcept.properties.some(function (property) {
                            return property.range.indexOf(targetConcept.id) != -1;
                        });

                        // check whether the target properties contains the source concept type
                        if (factory.options.bidirectionalCheck) {
                            valid |= targetConcept.properties.some(function (property) {
                                return property.range.indexOf(sourceConcept.id) != -1;
                            });
                        }
                        return valid;
                    }
                    return false;
                },
                connectionHasRelation: function (connection) {
                    return connection.annotations.relation != null ||
                        (connection.inverseConnection && connection.inverseConnection.annotations.relation != null);
                },
                findRelationAnnotation: function (source, target) {
                    return scope.linkedAnnotations.find(function (annotation) {
                        var selector = annotation['oa']['hasTarget']['hasSelector'];
                        return selector['source'] == source['oa']['@id'] &&
                            selector['target'] == target['oa']['@id'];
                    });
                },
                findConnectionFromAnnotation: function (annotation) {
                    if (scope.helper.getMotivationEquals(annotation, scope.oa.motivation.linking)) {
                        var key = [
                            annotation['oa']['hasTarget']['hasSelector']['source'],
                            annotation['oa']['hasTarget']['hasSelector']['target']
                        ];
                        if (factory.connections.hasOwnProperty(key)) {
                            return factory.connections[key];
                        }
                    }
                    return null;
                },
                getHoveredAnnotationRect: function (annotation, cursor) {
                    var rects = [];
                    annotation.highlights.forEach(function (highlight) {
                        rects = rects.concat(Array.from(highlight.getClientRects()));
                    });
                    return rects
                        .find(function (rect) {
                            return cursor.x >= rect.left && cursor.x <= rect.left + rect.width &&
                                cursor.y >= rect.top && cursor.y <= rect.top + rect.height;
                        });
                },
                relationTypeEquals: function (annotation, relation) {
                    return scope.helper.getMotivationEquals(annotation, scope.oa.motivation.linking) &&
                        annotation['oa']['hasBody']['relation'] == relation['uri']
                },
                /**
                 * Instantiates the SVG overlay and appends it to the document.
                 * @returns {*|jQuery}
                 */
                instantiateGraphicsOverlay: function () {
                    if ($(".annotator-relation-overlay")[0]) {
                        return $(".annotator-relation-overlay").first();
                    }
                    else {
                        var svg = document.createElementNS(SVG_NS, "svg");
                        svg.setAttribute("class", "annotator-relation-overlay");

                        return $(svg)
                            .appendTo(".annotator-wrapper");
                    }
                },
                /**
                 * Instantiates an SVG container element for the connections and appends it to the SVG element.
                 * @returns {*|jQuery}
                 */
                instantiateConnectionContainer: function () {
                    return $(document.createElementNS(SVG_NS, 'g'))
                        .appendTo(factory.g2d);
                },
                /**
                 * Instantiates an SVG symbol for the runner and appends it to the SVG element.
                 * @returns {*|jQuery}
                 */
                instantiateRunner: function () {
                    var runner = document.createElementNS(SVG_NS, 'image');
                    runner.setAttribute("class", "annotator-relation-runner");
                    runner.setAttributeNS(XLink_NS, "xlink:href", factory.options.createImagePath);
                    return $(runner)
                        .attr("width", factory.options.runnerSize)
                        .attr("height", factory.options.runnerSize)
                        .appendTo(factory.g2d).hide();
                },
                /**
                 * Instantiates a new connection object.
                 * @param source
                 * @param target
                 * @param relation
                 * @returns {*}
                 */
                instantiateConnection: function (source, target) {
                    var relation = factory.helper.findRelationAnnotation(source, target);

                    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute("class", "annotator-relation-line fadeOut");
                    // add the path to the container
                    factory.svgContainer.append(path);

                    return {
                        key: factory.helper.getCompositeKey(source, target),
                        active: false,
                        visible: false,
                        inverseConnection: null,
                        annotations: {
                            source: source,
                            target: target,
                            relation: relation
                        },
                        svg: {
                            path: path
                        }
                    }
                },
                instantiateInverseConnection: function (connection) {
                    var newConnection = factory.helper.instantiateConnection(connection.annotations.target,
                        connection.annotations.source);
                    connection.inverseConnection = newConnection;
                    newConnection.inverseConnection = connection;
                    return newConnection;
                },
                instantiateRelationMenu: function () {
                    return $("<div class='annotator-relation-menu'></div>")
                        .appendTo(".annotator-wrapper").hide();
                },
                instantiateRelationItem: function (source, property, target, existingRelation) {
                    var cls = existingRelation ? "exist" : "";
                    return $("<button class='" + cls + "'></button>")
                        .append("<span class='subject'>" + source + "</span>")
                        .append("<span class='predicate'>" + property + "</span>")
                        .append("<span class='object'>" + target + "</span>");
                },
                instantiateCreatorItem: function (annotation) {
                    return $("<div/>")
                        .append("<hr />")
                        .append("<div class='annotator-creator'>" + scope.helper.formatCreator(annotation) + "</div>");
                },
                instantiateSeparatorLine: function () {
                    return $("<hr />");
                },
                instantiateViewerButton: function () {
                    var label = "Create Relation";
                    return $("<button class='btn btn-secondary btn-xs btn-spacing' type='button'></button>")
                        .append("<i class='fa fa-share-alt' aria-hidden='true'></i>")
                        .append("<span> " + label + "</span>")
                        .css({width: "100%"});
                },
                prepareDashAnimation: function (path) {
                    var length = path.getTotalLength();
                    // Stop previous transition
                    path.style.transition = path.style.WebkitTransition = 'none';
                    // update stroke
                    path.style.strokeDashoffset = length;
                    path.getBoundingClientRect();
                    path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset 0.3s ease';
                }
                ,
                annotationRect: function (annotation) {
                    return Rect2D.prototype.fromClientRect(annotation.highlights[0].getClientRects()[0]);
                },
                /**
                 * Calculate the control points of the qubic bezier curve.
                 * @param source
                 * @param target
                 * @returns {string}
                 */
                calculatePath: function (sourceRect, targetRect) {
                    sourceRect = sourceRect.offset(1);
                    targetRect = targetRect.offset(1);

                    var start = factory.helper.getClosestPoint(targetRect.center(),
                        sourceRect.lineIntersection(new Line2D(sourceRect.center(), targetRect.pivot()))),
                        end = factory.helper.getClosestPoint(sourceRect.pivot(),
                            targetRect.lineIntersection(new Line2D(sourceRect.center(), targetRect.pivot())));

                    // determine in which quadrant is the 2nd point if 1st point is the origin
                    var quadrant = factory.helper.getQuadrant(start, end);
                    // rotate counter-clockwise
                    var ccw = (quadrant % 2 == 0);

                    // calculate the mid-point
                    var distance = Vector2.prototype.distance(sourceRect.pivot(), targetRect.pivot());
                    // calculate the lift of the curve
                    var lifting = Math.min(distance / (screen.height), 1);
                    lifting = lifting * lifting * factory.options.maxPathLifting;

                    var mid = start
                        .add(start.subtract(end).multiply(0.5))
                        .add(start.subtract(end).rotate90(ccw).normalize().multiply(lifting));
                    mid = factory.helper.clampToQuadrant(start, mid, quadrant);

                    // return a qubic bezier curve as SVG string
                    return "M" + start.x.toFixed(1) + " " + start.y.toFixed(1) +
                        " Q " + mid.x.toFixed(1) + " " + mid.y.toFixed(1) +
                        " " + end.x.toFixed(1) + " " + end.y.toFixed(1);
                },
                getQuadrant: function (origin, point) {
                    var greaterOriginX = point.x >= origin.x;
                    var greaterOriginY = point.y >= origin.y;
                    if (greaterOriginX) {
                        return greaterOriginY ? 1 : 4;
                    }
                    else {
                        return greaterOriginY ? 2 : 3;
                    }
                },
                /**
                 * Clamp the given point to the provided quadrant.
                 * @param origin
                 * @param point
                 * @param quadrant
                 * @returns {*}
                 */
                clampToQuadrant: function (origin, point, quadrant) {
                    // clamp x-coordinate
                    switch (quadrant) {
                        case 1:
                        case 4:
                            point.x = Math.max(point.x, origin.x);
                            break;
                        case 2:
                        case 3:
                            point.x = Math.min(point.x, origin.x);
                            break;
                    }
                    // clamp y-coordinate
                    switch (quadrant) {
                        case 1:
                        case 2:
                            point.y = Math.max(point.y, origin.y);
                            break;
                        case 3:
                        case 4:
                            point.y = Math.min(point.y, origin.y);
                            break;
                    }

                    return point;
                },
                /***
                 * Checks whether the given annotation is inside the visible viewport.
                 * @param annotation
                 * @returns {boolean}
                 */
                isVisibleAnnotation: function (annotation) {
                    if (!$(annotation.highlights[0]).hasClass('annotator-hl-filtered')) {
                        return annotation.highlights.some(function (highlight) {
                            var bounds = highlight.getBoundingClientRect();
                            return bounds.bottom >= 0 && bounds.top <= window.innerHeight &&
                                bounds.right >= 0 && bounds.left <= window.innerWidth;
                        });
                    }
                    return false;
                },
                isInsideFrustum: function (annotation, source, cursor) {
                    var origin = factory.helper.annotationRect(source).center(),
                        direction = cursor.subtract(origin).normalize(),
                        fowRadians = factory.options.FOWDegrees * (Math.PI / 180);

                    return annotation.highlights.some(function (highlight) {
                        // check each rectangle of the highlight
                        return Array.from(highlight.getClientRects()).some(function (rect) {
                            var targetPivot = Rect2D.prototype.fromClientRect(rect).pivot(),
                                pivotDir = targetPivot.subtract(origin).normalize(),
                                targetCenter = Rect2D.prototype.fromClientRect(rect).center(),
                                centerDir = targetCenter.subtract(origin).normalize();

                            return direction.dot(pivotDir) >= Math.cos(fowRadians) ||
                                direction.dot(centerDir) >= Math.cos(fowRadians);
                        })
                    });
                },
                /***
                 * Returns the closest point from an array of points to the given origin.
                 * @param origin
                 * @param points
                 * @returns {*|T}
                 */
                getClosestPoint: function (origin, points) {
                    return points.sort(function (pt1, pt2) {
                        return Vector2.prototype.distance(pt1, origin) - Vector2.prototype.distance(pt2, origin);
                    })[0];
                },
                getClosestPointToPath: function (pathNode, point) {
                    // Source https://pomax.github.io/bezierinfo/#projections
                    var pathLength = pathNode.getTotalLength(),
                        precision = 8,
                        best,
                        bestLength,
                        bestDistance = Number.MAX_VALUE;

                    // linear scan for coarse approximation
                    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
                        if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                            best = scan;
                            bestLength = scanLength;
                            bestDistance = scanDistance;
                        }
                    }

                    // binary search for precise estimate
                    precision /= 2;
                    while (precision > 0.5) {
                        var before,
                            after,
                            beforeLength,
                            afterLength,
                            beforeDistance,
                            afterDistance;

                        if ((beforeLength = bestLength - precision) >= 0 &&
                            (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                            best = before;
                            bestLength = beforeLength;
                            bestDistance = beforeDistance;
                        } else if ((afterLength = bestLength + precision) <= pathLength &&
                            (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                            best = after;
                            bestLength = afterLength;
                            bestDistance = afterDistance;
                        } else {
                            precision /= 2;
                        }
                    }

                    return new Vector2(best.x, best.y);

                    function distance2(p) {
                        var dx = p.x - point.x,
                            dy = p.y - point.y;
                        return dx * dx + dy * dy;
                    }
                }
            }
        };

        factory.load = function () {
            factory.g2d = factory.helper.instantiateGraphicsOverlay();
            factory.svgContainer = factory.helper.instantiateConnectionContainer();
            factory.runner = factory.helper.instantiateRunner();
            factory.relationMenu = factory.helper.instantiateRelationMenu();

            // add viewer field
            scope.annotator.viewer.addField({
                load: function (field, annotation) {
                    if (factory.helper.isSemanticAnnotation(annotation)) {
                        if ($(field).children().length == 0) {
                            factory.helper.instantiateViewerButton()
                                .appendTo(field)
                                .click(function () {
                                    if (!factory.isActive()) {
                                        scope.annotationMode(scope.annotationModes.conceptTagging);
                                    }
                                    factory.selectAnnotation(annotation);
                                });
                        }
                        $(field).show();
                    }
                    else {
                        $(field).hide();
                    }
                }
            });

            // subscribe to annotator events
            scope.annotator
                .subscribe("annotationModeChanged", factory.blurSelection)
                .subscribe("annotationCreated", factory.collectAnnotations)
                .subscribe("annotationDeleted", factory.collectAnnotations)
                .subscribe("annotationsLoaded", factory.collectAnnotations)
                .subscribe("annotationViewerShown", function (viewer, annotations) {
                    if (factory.selectedAnnotation) {
                        // hide viewer if an annotation is selected
                        viewer.hide();
                    }
                })
                // neonion plugin-specific events
                .subscribe("linkedAnnotationCreated", factory.linkedAnnotationCreated)
                .subscribe("linkedAnnotationDeleted", factory.linkedAnnotationDeleted)
                // relation plugin-specific events
                .subscribe("connectionBecomeVisible", factory.connectionBecomeVisible)
                .subscribe("connectionBecomeHidden", factory.connectionBecomeHidden)
                .subscribe("connectionBecomeSelected", factory.connectionBecomeSelected)
                .subscribe("connectionBecomeDeselected", factory.connectionBecomeDeselected);


            $(document)
            // add handler to track scrolling
                .scroll(function (event) {
                    if (factory.isActive() && factory.flags & factory.STATUS_FLAGS.ANNOTATION_SELECTED) {
                        factory.invalidate();
                    }
                })
                // add handler to track mouse movement
                .on("mousemove", ".annotator-wrapper", function (event) {
                    if (factory.isActive()) {
                        var cursor = new Vector2(event.clientX, event.clientY);
                        var hovered = $(document.elementFromPoint(cursor.x, cursor.y));
                        // check if the hovered element is the runner
                        if (hovered.is(factory.runner)) {
                            // skip update movement
                            return false;
                        }
                        // check if the hovered element is an annotation
                        else if (hovered.hasClass("annotator-hl")) {
                            var annotation = $(event.target).data("annotation");
                            if (factory.helper.isSemanticAnnotation(annotation)) {
                                factory.hoveredAnnotation = annotation;
                                factory.hoveredAnnotationRect = factory.helper.getHoveredAnnotationRect(annotation, cursor);
                            }
                        }
                        else {
                            factory.hoveredAnnotation = null;
                            factory.hoveredAnnotationRect = null;
                        }

                        if (!(factory.flags & factory.STATUS_FLAGS.MENU_VISIBLE)) {
                            factory.updateMovement(cursor);
                        }
                    }
                })
                // check click on annotation
                .on("click", ".annotator-hl", function (event) {
                    if (factory.isActive()) {
                        var target = $(event.target);
                        var cursor = new Vector2(event.clientX, event.clientY);
                        var annotation = target.data("annotation");
                        if (annotation != factory.selectedAnnotation) {
                            factory
                                .selectAnnotation(annotation)
                                .updateMovement(cursor);
                        }
                        else {
                            factory.blurSelection();
                        }
                        event.stopPropagation();
                    }
                })
                // track clicks
                .on("click", ".annotator-wrapper", function (event) {
                    if (factory.isActive()) {
                        if (factory.flags & factory.STATUS_FLAGS.MENU_VISIBLE) {
                            var cursor = new Vector2(event.clientX, event.clientY);
                            factory
                                .collapseRelationMenu()
                                .updateMovement(cursor);
                        }
                        else if (!$.contains($(".annotator-viewer").get(0), event.target)) {
                            factory.blurSelection();
                        }
                    }
                });

            // attach events to the runner
            factory.runner
                .click(function (event) {
                    factory.expandRelationMenu();
                    event.stopPropagation();
                });
        };

        /***
         * Returns a value indicating whether the mode is accessible.
         * @returns {boolean}
         */
        factory.isActive = function () {
            return scope.annotationMode() == scope.annotationModes.conceptTagging;
        };

        /***
         * Blurs the current selection.
         * @returns {object}
         */
        factory.blurSelection = function () {
            return factory
                .collapseRelationMenu()
                .selectAnnotation(null)
                .selectConnection(null);
        };

        /***
         * Selects the given annotation as source.
         * @param annotation
         * @returns {objects}
         */
        factory.selectAnnotation = function (annotation) {
            if (factory.selectedAnnotation != annotation) {
                // remove classes from annotations
                if (factory.selectedAnnotation) {
                    factory.selectedAnnotation.highlights.forEach(function (highlight) {
                        $(highlight).removeClass("annotator-relation-outline");
                    });
                    // remove fade class from annotations
                    factory.annotations.forEach(function (annotation) {
                        annotation.highlights.forEach(function (highlight) {
                            $(highlight).removeClass("fade");
                        });
                    });
                }

                // hide all connections
                for (var key in factory.connections) {
                    factory.setConnectionVisibility(factory.connections[key], false);
                }

                if (annotation && factory.helper.isSemanticAnnotation(annotation)) {
                    factory.flags |= factory.STATUS_FLAGS.ANNOTATION_SELECTED;
                    factory.selectedAnnotation = annotation;
                    factory.activeAnnotations = factory.getAnnotations(factory.selectedAnnotation);
                    factory.activeAnnotations.forEach(function (other) {
                        var key = factory.helper.getCompositeKey(factory.selectedAnnotation, other);
                        if (!factory.connections.hasOwnProperty(key)) {
                            factory.connections[key] = factory.helper.instantiateConnection(factory.selectedAnnotation, other);

                            var inverseKey = factory.helper.getCompositeKey(other, factory.selectedAnnotation);
                            factory.connections[inverseKey] = factory.helper.instantiateInverseConnection(factory.connections[key]);
                        }
                        factory.setConnectionVisibility(factory.connections[key], true);
                    });

                    factory.selectedAnnotation.highlights.forEach(function (highlight) {
                        $(highlight).addClass("annotator-relation-outline");
                    });

                    // fade all annotation
                    if (factory.options.filterAnnotations) {
                        factory.annotations.forEach(function (annotation) {
                            if (annotation != factory.selectedAnnotation) {
                                if (!factory.helper.hasCommonRelation(factory.selectedAnnotation, annotation)) {
                                    annotation.highlights.forEach(function (highlight) {
                                        $(highlight).addClass("fade");
                                    });
                                }
                            }
                        });
                    }
                }
                else {
                    factory.flags = ~factory.STATUS_FLAGS.ANNOTATION_SELECTED;
                    factory.selectedAnnotation = null;
                }

                scope.annotator.viewer.hide();
                factory.selectConnection(null);
            }
            return factory;
        };

        factory.selectConnection = function (connection) {
            if (factory.selectedConnection != connection) {
                if (factory.selectedConnection) {
                    scope.annotator.publish("connectionBecomeDeselected", [factory.selectedConnection]);
                }

                factory.selectedConnection = connection;
                if (factory.selectedConnection) {
                    scope.annotator.publish("connectionBecomeSelected", [factory.selectedConnection]);
                }

                factory
                    .collapseRelationMenu()
                    .invalidateRunner();
            }
            return factory;
        };

        factory.invalidate = function () {
            for (var key in factory.connections) {
                factory.invalidateConnection(factory.connections[key]);
            }

            return factory.invalidateRunner();
        };

        /**
         * Invalidates the status of the given connection.
         * @param connection
         */
        factory.invalidateConnection = function (connection) {
            if (connection.visible) {
                var sourceRect = factory.helper.annotationRect(connection.annotations.source),
                    targetRect;
                if (factory.hoveredAnnotation &&
                    factory.hoveredAnnotationRect &&
                    factory.hoveredAnnotation != factory.selectedAnnotation) {
                    targetRect = Rect2D.prototype.fromClientRect(factory.hoveredAnnotationRect);
                }
                else {
                    targetRect = factory.helper.annotationRect(connection.annotations.target);
                }

                var pathPoints = factory.helper.calculatePath(sourceRect, targetRect);
                connection.svg.path.setAttribute("d", pathPoints);

                // update dash stroke
                var length = connection.svg.path.getTotalLength();
                connection.svg.path.style.strokeDasharray = length + ', ' + length;
            }
        };

        factory.expandRelationMenu = function () {
            if (factory.selectedConnection) {
                // clear the menu
                factory.relationMenu.empty();

                // populate items
                factory.populateRelationEntries(this.selectedConnection);
                if (factory.options.bidirectionalCheck) {
                    factory.populateRelationEntries(this.selectedConnection.inverseConnection,
                        factory.options.excludeInverseProperties)
                }

                // add creator item
                if (factory.selectedConnection.annotations.relation) {
                    factory.relationMenu.append(
                        factory.helper.instantiateCreatorItem(factory.selectedConnection.annotations.relation));
                }

                var position = factory.runner.position();
                factory.relationMenu
                    .css({
                        left: position.left - window.pageXOffset,
                        top: position.top - window.pageYOffset
                    })
                    .show();

                factory.flags |= factory.STATUS_FLAGS.MENU_VISIBLE;
            }
            return factory;
        };

        /***
         *
         * @param connection
         * @param excludeInverseProperties
         * @returns {}
         */
        factory.populateRelationEntries = function (connection, excludeInverseProperties) {
            var source = connection.annotations.source,
                target = connection.annotations.target,
                sourceConcept = scope.getConceptDefinition(source['oa']['hasBody']['classifiedAs']),
                targetConcept = scope.getConceptDefinition(target['oa']['hasBody']['classifiedAs']);

            var items = sourceConcept.properties
            // filter for possible properties between the source and target concepts
                .filter(function (property) {
                    return property.range.indexOf(targetConcept.id) != -1;
                })
                // exclude properties which are inverse to the properties in the target concept
                .filter(function (sourceProp) {
                    if (excludeInverseProperties) {
                        return !targetConcept.properties.some(function (targetProp) {
                            // check if the current property is a inverse property
                            return targetProp.inverse_property == sourceProp.id;
                        });
                    }
                    return true;
                });

            // add separator line if the menu already contains items
            if (items.length > 0 && factory.relationMenu.children().length != 0) {
                factory.relationMenu.append(factory.helper.instantiateSeparatorLine());
            }

            items
            // create a mapping between the property and the menu item
                .map(function (property) {
                    var relationExists = connection.annotations.relation
                        && connection.annotations.relation['oa']['hasBody']['relation'] == property['uri'];
                    // create a menu item
                    var node = factory.helper.instantiateRelationItem(source['oa']['hasBody']['label'], property.label,
                        target['oa']['hasBody']['label'], relationExists
                    );

                    // assign data to the node
                    node.data('relation', {
                        source: source,
                        property: property,
                        target: target
                    });

                    // return a tuple
                    return {
                        property: property,
                        node: node
                    }
                })
                // sort by property label
                .sort(function (p1, p2) {
                    if (p1.property.label < p2.property.label) return -1;
                    if (p1.property.label > p2.property.label) return 1;
                    return 0;
                })
                // append items to the menu
                .forEach(function (item) {
                    item.node
                        .appendTo(factory.relationMenu)
                        .click(factory.relationItemClicked);
                });

            return factory;
        };

        factory.collapseRelationMenu = function () {
            if (factory.flags & factory.STATUS_FLAGS.MENU_VISIBLE) {
                factory.flags = ~factory.STATUS_FLAGS.MENU_VISIBLE;
                factory.relationMenu.hide();
            }
            return factory;
        };

        factory.updateMovement = function (cursor) {
            if (factory.selectedAnnotation) {
                var activeConnections = [];

                factory.activeAnnotations
                    .forEach(function (annotation) {
                        var key = factory.helper.getCompositeKey(factory.selectedAnnotation, annotation);
                        var connection = factory.connections[key];
                        var active = false;
                        if (factory.options.cullAnnotationsByFrustum) {
                            active = factory.helper.isInsideFrustum(annotation, factory.selectedAnnotation, cursor);
                            if (!active && factory.options.highlightExistingRelations) {
                                active |= factory.helper.connectionHasRelation(connection);
                            }
                        }
                        else {
                            active = true;
                        }

                        if (connection.active != active) {
                            connection.active = active;

                            var length = connection.svg.path.getTotalLength(),
                                dashOffset = 0;

                            if (!active) {
                                if (factory.options.previewCulledConnections) {
                                    dashOffset = length - Math.min(length, factory.options.connectionTrimmedLength);
                                }
                                else {
                                    dashOffset = length;
                                }
                            }
                            connection.svg.path.style.strokeDashoffset = dashOffset;
                        }
                        if (active) {
                            activeConnections.push(connection);
                        }
                    });

                // determine the selected connection
                var newConnection = null;
                if (activeConnections.length > 0) {
                    if (factory.hoveredAnnotation) {
                        // try to find the connection of the hovered annotation
                        newConnection = activeConnections.find(function (connection) {
                            // return true if the target of the connection equal the hovered connection
                            return connection.annotations.target == factory.hoveredAnnotation;
                        });
                    }
                    // check if there is already a selected connection
                    if (!newConnection) {
                        // in case not select the connection by the closest distance to the cursor
                        activeConnections = activeConnections
                        // sort activeConnection by distance to cursor
                            .sort(function (a, b) {
                                var ptA = factory.helper.getClosestPointToPath(a.svg.path, cursor);
                                var ptB = factory.helper.getClosestPointToPath(b.svg.path, cursor);
                                return Vector2.prototype.distance(ptA, cursor) - Vector2.prototype.distance(ptB, cursor)
                            });

                        var pathPoint = factory.helper.getClosestPointToPath(activeConnections[0].svg.path, cursor);
                        if (Vector2.prototype.distance(cursor, pathPoint) < factory.options.activationProximityLimit) {
                            newConnection = activeConnections[0];
                        }
                    }
                }
                // select the new connection
                if (factory.selectedConnection != newConnection) {
                    factory.selectConnection(newConnection);
                }

                // update the position of the runner
                if (factory.selectedConnection) {
                    factory.updateRunner(factory.selectedConnection, cursor);
                }
            }
            return factory;
        };

        /**
         * Invalidates the status of the runner.
         */
        factory.invalidateRunner = function () {
            if (factory.selectedConnection) {
                // check if the selected connection has a relation annotation assigned
                if (factory.helper.connectionHasRelation(factory.selectedConnection)) {
                    factory.runner.attr("xlink:href", factory.options.editImagePath);
                }
                else {
                    factory.runner.attr("xlink:href", factory.options.createImagePath);
                }
                factory.runner.show();
            }
            else {
                factory.runner.hide();
            }

            return factory;
        };

        factory.updateRunner = function (connection, cursor) {
            var pos = null;
            if (connection.annotations.target == factory.hoveredAnnotation) {
                var length = connection.svg.path.getTotalLength();
                pos = connection.svg.path.getPointAtLength(length);
            }
            else {
                pos = factory.helper.getClosestPointToPath(connection.svg.path, cursor);
            }

            pos.x -= factory.options.runnerSize * 0.5;
            pos.y -= factory.options.runnerSize * 0.5;

            factory.runner
                .attr("x", pos.x)
                .attr("y", pos.y);

            return factory;
        };

        factory.collectAnnotations = function () {
            factory.annotations = scope.getAnnotations();
            return factory;
        };

        factory.setConnectionVisibility = function (connection, visible) {
            if (connection.visible != visible) {
                connection.visible = visible;
                if (visible) {
                    scope.annotator.publish("connectionBecomeVisible", [connection]);
                }
                else {
                    scope.annotator.publish("connectionBecomeHidden", [connection]);
                }
            }
            return factory;
        };

        factory.relationItemClicked = function (event) {
            var data = $(event.currentTarget).data("relation");
            if (data) {
                var annotation = factory.helper.findRelationAnnotation(data.source, data.target);
                if (annotation) {
                    if (!factory.helper.relationTypeEquals(annotation, data.property)) {
                        // update annotation with new relation type
                        scope.updateLinkedAnnotation(annotation, data.property);
                    }
                    else {
                        // delete the annotation
                        scope.deleteLinkedAnnotation(annotation);
                    }
                }
                else {
                    // create a new relation
                    scope.createLinkedAnnotation(data.source, data.property, data.target);
                }

                factory
                    .collapseRelationMenu()
                    .invalidateRunner();

            }
            event.stopPropagation();
        };

        factory.linkedAnnotationCreated = function (annotation) {
            var connection = factory.helper.findConnectionFromAnnotation(annotation);
            if (connection) {
                connection.annotations.relation = annotation;
            }
        };

        factory.linkedAnnotationDeleted = function (annotation) {
            var connection = factory.helper.findConnectionFromAnnotation(annotation);
            if (connection) {
                connection.annotations.relation = null;
            }
        };

        factory.connectionBecomeVisible = function (connection) {
            factory.invalidateConnection(connection);

            factory.helper.prepareDashAnimation(connection.svg.path);
            if (factory.options.previewCulledConnections) {
                var length = connection.svg.path.getTotalLength();
                connection.svg.path.style.strokeDashoffset = length - Math.min(length, factory.options.connectionTrimmedLength);
            }
        };

        factory.connectionBecomeHidden = function (connection) {
            connection.active = false;
            // hide the path
            connection.svg.path.style.strokeDashoffset = connection.svg.path.getTotalLength();
        };

        factory.connectionBecomeSelected = function (connection) {
            factory.invalidateConnection(connection);
            connection.svg.path.setAttribute("class", "annotator-relation-line fadeIn");
            // outline annotation
            connection.annotations.target.highlights.forEach(function (highlight) {
                $(highlight).addClass("annotator-relation-outline");
            });
        };

        factory.connectionBecomeDeselected = function (connection) {
            connection.svg.path.setAttribute("class", "annotator-relation-line fadeOut");
            // remove outline
            if (connection.annotations.target != factory.selectedAnnotation) {
                connection.annotations.target.highlights.forEach(function (highlight) {
                    $(highlight).removeClass("annotator-relation-outline");
                });
            }
        };

        factory.getAnnotations = factory.getIlluminated = function (source) {
            var filteredAnnotations = factory.annotations
                .filter(factory.helper.isSemanticAnnotation)
                .filter(factory.helper.isVisibleAnnotation)
                .filter(function (annotation) {
                    // exclude selected annotation
                    return annotation != source;
                });

            if (factory.options.filterAnnotations) {
                filteredAnnotations = factory.filterCompatibleAnnotations(filteredAnnotations, source);
            }

            return filteredAnnotations;
        };

        factory.filterCompatibleAnnotations = function (annotations, source) {
            return annotations.filter(function (annotation) {
                return factory.helper.hasCommonRelation(source, annotation);
            });
        };

        return factory;
    }
    ;

})();