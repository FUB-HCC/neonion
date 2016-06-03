(function () {
    "use strict"; // enable strict mode

    function Vector2(x, y){
       this.x = x;
       this.y = y;
    }

    Vector2.prototype = {
        add : function (v2) {
            return new Vector2(this.x - v2.x, this.y - v2.y);
        },
        subtract : function (v2) {
            return new Vector2(this.x - v2.x, this.y - v2.y);
        },
        multiply : function(multiplier) {
            return new Vector2(this.x * multiplier, this.y * multiplier);
        },
        divide : function(divisor) {
            return new Vector2(this.x / divisor, this.y / divisor);
        },
        normalize : function () {
            return this.divide(this.magnitude());
        },
        dot : function (v2) {
            return this.x * v2.x + this.y * v2.y;
        },
        cross : function(v2) {
            return new Vector2(this.x * v2.y - v2.x * this.y, this.y * v2.x - v2.y * this.x);
        },
        rotate90: function() {
            return new Vector2(-this.y, this.x);
        },
        magnitude : function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        distance : function (v1, v2) {
            return Math.sqrt((v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y));
        },
        undefinedVector : function () {
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

    function Rect2D(left, width, top, height){
        this.left = left;
        this.width = width;
        this.top = top;
        this.height = height;
    }

    Rect2D.prototype = {
        center: function () {
            return new Vector2(this.left + this.width * 0.5, this.top + this.height * 0.5);
        },
        boundingLines: function () {
            return [
                new Line2D(new Vector2(this.left, this.top), new Vector2(this.left + this.width, this.top)),
                new Line2D(new Vector2(this.left + this.width, this.top), new Vector2(this.left + this.width, this.top + this.height)),
                new Line2D(new Vector2(this.left + this.width, this.top + this.height), new Vector2(this.left, this.top + this.height)),
                new Line2D(new Vector2(this.left, this.top + this.height), new Vector2(this.left, this.top))
            ]
        },
        lineIntersection: function(line) {
            var lines = this.boundingLines();
            var intersections = [];
            for (var i = 0; i < lines.length; i++) {
                var intersectionPt = line.intersection(lines[i]);
                if (lines[i].contains(intersectionPt))
                    intersections.push(intersectionPt);
            }
            return intersections;
        }
    };

    function Bezier(v1, v2, v3) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
    }

    Bezier.prototype = {
        getPoint: function(t) {
            var x = (1 - t) * ((1 - t) * this.v1.x + t * this.v2.x) + t * ((1 - t) * this.v2.x + t * this.v3.x);
            var y = (1 - t) * ((1 - t) * this.v1.y + t * this.v2.y) + t * ((1 - t) * this.v2.y + t * this.v3.y);
            return new Vector2(x, y);
        },
        getPointDeriviated: function(t) {
            return 2 * (1 - t) * (v2 - v1) + 2 * t * (v3 - v2);
        },
        getClosestPoint : function(ref) {
            return new Vector2(0, 0);
        },
        convertSVGPath: function () {
           return "M" + this.v1.x + " " + this.v1.y +
               " Q " + this.v2.x + " " + this.v2.y + " " + this.v3.x + " " + this.v3.y;
        }
    };

    /**
     * Widget create a relations interactively.
     * @returns {{}}
     */
    Annotator.Plugin.neonion.prototype.widgets['pointAndLightRelations'] = function (scope, options) {
        var factory = {
            path : [],
            selectedAnnotation : null,
            selectedConnection : null,
            activeConnections : [],
            options : {
                debug: true,
                cullAnnotations : true,
                cullingDistance : function () { return screen.height * 0.8 },
                FOWRadians : Math.PI / 15 // 15  degrees
            },
            helper : {
                instantiateGraphicsOverlay : function() {
                    return $("<svg class='annotator-relation-overlay' shape-rendering='auto' xmlns='http://www.w3.org/2000/svg' />")
                        .appendTo(".annotator-wrapper");
                },
                instantiateRunner: function() {
                    return $("<i class='annotator-relation-runner fa fa-plus-circle fa-lg' aria-hidden='true'></i>")
                        .appendTo(".annotator-wrapper").hide();
                },
                instantiateSegment : function(source, target) {
                    var line = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    line.setAttribute("class", "annotator-svg-relation fade");
                    line.setAttribute("stroke-linecap", "round");

                    return {
                        key : factory.getCompositeKey(source, target),
                        source : source,
                        target : target,
                        active : false,
                        path : line
                    }
                },
                annotationRect : function (annotation) {
                    var rect = annotation.highlights[0].getClientRects()[0];
                    return new Rect2D(rect.left, rect.width, rect.top, rect.height);
                },
                /**
                * Calculate the control points of the qubic bezier curve.
                * @param source
                * @param target
                * @returns {*[Bezier]}
                */
                calculateCurve : function(source, target) {
                    var sourceRect = factory.helper.annotationRect(source);
                    var targetRect = factory.helper.annotationRect(target);
                    var start = factory.helper.getClosestPoint(targetRect.center(),
                        sourceRect.lineIntersection(new Line2D(sourceRect.center(), targetRect.center())));
                    var end = factory.helper.getClosestPoint(sourceRect.center(),
                        targetRect.lineIntersection(new Line2D(sourceRect.center(), targetRect.center())));

                    var factor = Vector2.prototype.distance(sourceRect.center(), targetRect.center()) / (screen.height * 0.5);
                    factor = Math.min(factor, 1);
                    factor *= factor;
                    var mid = start.add(start.subtract(end).multiply(0.5));
                    mid = mid.add(start.subtract(end).rotate90().normalize().multiply(factor * 50));

                    return new Bezier(start, mid, end);
                },
                getClosestPoint: function(origin, points) {
                    return points.sort(function(pt1, pt2){
                        return Vector2.prototype.distance(pt1, origin) - Vector2.prototype.distance(pt2, origin);
                    })[0];
                }
            }
        };

        factory.load = function () {
            factory.g2d = factory.helper.instantiateGraphicsOverlay();
            factory.runner = factory.helper.instantiateRunner();

            scope.annotator.subscribe("annotationModeChanged", factory.blurSelection);
            scope.annotator.subscribe("annotationCreated", factory.collectAnnotations);
            scope.annotator.subscribe("annotationDeleted", factory.collectAnnotations);
            scope.annotator.subscribe("annotationsLoaded", factory.collectAnnotations);
            scope.annotator.subscribe("annotationViewerShown", function(viewer) {
                if (factory.selectedAnnotation)
                    viewer.hide();
            });
            // plugin-specific events
            scope.annotator.subscribe("connectionBecomeVisible", factory.connectionBecomeVisible);
            scope.annotator.subscribe("connectionBecomeHidden", factory.connectionBecomeHidden);
            scope.annotator.subscribe("connectionBecomeSelected", factory.connectionBecomeSelected);
            scope.annotator.subscribe("connectionBecomeDeselected", factory.connectionBecomeDeselected);

            // listen to clicks on annotation highlights
            $(document).on("click", ".annotator-hl", function(event){
                if (factory.isActive()) {
                    var annotation = $(event.target).data("annotation");
                    factory.selectAnnotation(annotation);
                    var cursor = new Vector2(event.clientX, event.clientY);
                    factory.updateMovement(cursor);
                }
            });

            // TODO click on document
            //$(document).on("click", ".annotator-wrapper", factory.blurSelection);

            // mouse movement
            $(document).mousemove(function (event) {
                if (factory.isActive()) {
                    var cursor = new Vector2(event.clientX, event.clientY);
                    factory.updateMovement(cursor);
                }
            });
        };

        factory.blurSelection = function() {
            factory.selectAnnotation(null);
            factory.selectConnection(null);
        };

        factory.selectAnnotation = function (annotation) {
            if (factory.selectedAnnotation != annotation) {
                if (factory.selectedAnnotation) {
                    factory.selectedAnnotation.highlights.forEach(function(highlight) {
                        $(highlight).removeClass("annotator-relation-outline");
                    });
                }

                factory.selectedAnnotation = annotation;
                if (factory.selectedAnnotation) {
                    factory.selectedAnnotation.highlights.forEach(function (highlight) {
                        $(highlight).addClass("annotator-relation-outline");
                    });
                }

                for(var key in factory.path) {
                    factory.setConnectionVisibility(factory.path[key], false);
                }
            }
            return factory.selectedAnnotation;
        };

        factory.selectConnection = function (connection) {
            if (factory.selectedConnection != connection) {
                if (factory.selectedConnection) {
                    factory.publish("connectionBecomeDeselected", [factory.selectedConnection]);
                }

                factory.selectedConnection = connection;
                if (factory.selectedConnection) {
                    factory.publish("connectionBecomeSelected", [factory.selectedConnection]);
                    factory.runner.show();
                }
                else {
                    factory.runner.hide();
                }
            }
        };

        factory.updateMovement = function (cursor) {
            if (factory.selectedAnnotation) {
                var illuminatedAnnotations = factory.getIlluminated(factory.selectedAnnotation, cursor);
                var activeConnections = [];

                illuminatedAnnotations.forEach(function(annotation) {
                    var key = factory.getCompositeKey(factory.selectedAnnotation, annotation);
                    if (!factory.path.hasOwnProperty(key)) {
                        factory.path[key] = factory.helper.instantiateSegment(factory.selectedAnnotation, annotation);
                        factory.g2d.append(factory.path[key].path);
                    }
                    if (factory.activeConnections.indexOf(factory.path[key]) == -1) {
                        factory.setConnectionVisibility(factory.path[key], true);
                    }
                    activeConnections.push(factory.path[key]);
                });

                // sort activeConnection by distance to cursor
                /*activeConnections = activeConnections.sort(function(a,b) {
                    var ptA = a.getClosestPoint(cursor);
                    var ptB = b.getClosestPoint(cursor);
                    return Vector2.prototype.distance(ptA, cursor) - Vector2.prototype.distance(ptB, cursor)
                });
                factory.selectConnection(activeConnections.length > 0 ? activeConnections[0] : null);*/

                factory.activeConnections
                    .filter(function(connection) {
                        return activeConnections.indexOf(connection) == -1;
                    })
                    .forEach(function(connection) {
                        factory.setConnectionVisibility(connection, false);
                    });

                // remove
                factory.selectedConnection = activeConnections.length > 0 ? activeConnections[0] : null;
                // update position of plus
                if (factory.selectedConnection) {
                    factory.runner.show();
                    factory.updateRunner(factory.selectedConnection, cursor);
                }

                if (factory.options.debug) factory.drawDebug();
            }
        };

        factory.updateRunner = function (connection, cursor) {
            var pos = connection.curve.getPoint(0.5);
            pos.x -= factory.runner.width() * 0.5;
            pos.y -= factory.runner.height() * 0.5;
            factory.runner.css({top: pos.y, left: pos.x});
        };

        factory.collectAnnotations = function () {
            factory.annotations = scope.getAnnotations();
        };

        factory.isActive = function (active) {
            return scope.annotationMode() == scope.annotationModes.conceptTagging;
        };

        factory.setConnectionVisibility = function (connection, active) {
            if (connection.active != active) {
                connection.active = active;
                var idx = factory.activeConnections.indexOf(connection);
                if (active) {
                    if (idx == -1) factory.activeConnections.push(connection);
                    scope.annotator.publish("connectionBecomeVisible", [connection]);
                }
                else {
                    if (idx > -1) factory.activeConnections.splice(idx, 1);
                    scope.annotator.publish("connectionBecomeHidden", [connection]);
                }
            }
        };

        factory.connectionBecomeVisible = function(connection) {
            connection.curve = factory.helper.calculateCurve(connection.source, connection.target);
            connection.path.setAttribute("class", "annotator-svg-relation fade in");
            connection.path.setAttribute("d", connection.curve.convertSVGPath());
        };

        factory.connectionBecomeHidden = function(connection) {
            connection.path.setAttribute("class", "annotator-svg-relation fade");
        };

        factory.connectionBecomeSelected = function (connection) {
            // outline annotation
            connection.target.highlights.forEach(function(highlight) {
                $(highlight).addClass("annotator-relation-outline");
            });

        };

        factory.connectionBecomeDeselected = function() {
            // remove outline
            connection.target.highlights.forEach(function(highlight) {
                $(highlight).removeClass("annotator-relation-outline");
            });

        };

        factory.getCompositeKey = function (source, target) {
            return [
                source['oa']['@id'],
                target['oa']['@id']
            ];
        };

        factory.getIlluminated = function (source, cursor) {
            var centerSource = factory.helper.annotationRect(source).center();
            var coneCenterLine = cursor.subtract(centerSource).normalize();

            return factory.getCompatibleAnnotations(source)
                .filter(function (annotation) {
                    if (factory.options.cullAnnotations) {
                        var centerTarget = factory.helper.annotationRect(annotation).center();
                        var direction = centerTarget.subtract(centerSource).normalize();

                        return Vector2.prototype.distance(centerSource, centerTarget) < factory.options.cullingDistance() &&
                            coneCenterLine.dot(direction) >= Math.cos(factory.options.FOWRadians);
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

        factory.drawDebug = function (g2d, cursor) {

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