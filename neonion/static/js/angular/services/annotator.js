/**
 * Service for Annotator
 */
neonionApp.factory('AnnotatorService', [function () {
    "use strict";
    var factory = {};
    var annotator;

    factory.contributors = [];

    factory.annotator = function (value) {
        if (value) {
            annotator = value;
        }
        return annotator;
    };

    /**
     * Counts the annotation objects.
     * @returns {Number}
     */
    factory.getNumberOfTotalAnnotations = function() {
      if(annotator) {
        var annotations = factory.getAnnotationObjects();
        return annotations.length;
      }
    };

    /**
     * Scrolls the viewport to the given annotation.
     * @param annotation
     */
    factory.scrollToAnnotation = function (annotation) {
        // check if just the annotation id was passed
        if (typeof annotation == 'string') {
            var annotations = factory.getAnnotationObjects();
            annotation = annotations.filter(function (element) {
                return (element.id == annotation);
            }).pop();
        }
        if (annotation) {
            var target = $(annotation.highlights[0]);
            $('html, body').stop().animate({
                    'scrollTop': target.offset().top - 200
                },
                1000,
                'easeInOutQuart'
            );
            // blink for more attention
            for (var i = 0; i < 2; i++) {
                $(target).fadeTo('slow', 0.5).fadeTo('slow', 1.0);
            }
        }
    };

    /**
     * Returns a list of annotations as DOM elements.
     * @returns {*|jQuery|HTMLElement}
     */
    factory.getAnnotationHighlights = function () {
        return $(".annotator-hl:not(.annotator-hl-temporary),." + Annotator.Plugin.Neonion.prototype.classes.hide);
    };

    /**
     * Returns a list of annotation objects.
     * @returns {Array<Annotation>}
     */
    factory.getAnnotationObjects = function () {
        var annotations = $.map(factory.getAnnotationHighlights(), function (item) {
            return $(item).data("annotation");
        });
        // since an annotation can have multiple highlights create a unique set of annotations
        var unique = {};
        return $.grep(annotations, function(annotation) {
            if (!unique.hasOwnProperty(annotation.id)) {
                unique[annotation.id] = true;
                return true;
            }
            return false;
        });
    };

    /**
     * Returns a list of annotation objects filtered by the user.
     * @param userId
     * @returns {Array<Annotation>}
     */
    factory.getUserAnnotations = function (userId) {
        var annotations = factory.getAnnotationObjects();
        return annotations.filter(function (annotation) {
            if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("annotatedBy")) {
                return annotation.oa.annotatedBy.email == userId;
            }
            else {
                return false;
            }
        });
    };

    /**
     * Returns the annotation object with the recent update date.
     * @param userId
     * @returns {Annotation}
     */
    factory.getLastAnnotation = function (userId) {
        var annotations;
        if (userId) {
            annotations = factory.getUserAnnotations(userId);
        }
        else {
            annotations = factory.getAnnotationObjects();
        }
        if (annotations.length > 0) {
            annotations.sort(Annotator.Plugin.Neonion.prototype.comparator.compareByUpdated);
            return annotations[annotations.length - 1];
        }
        return null;
    };

    /**
     * Returns a list of users which have contributed on the current document.
     * @returns {Array}
     */
    factory.getContributors = function () {
        var highlights = factory.getAnnotationHighlights();
        var contributors = [];
        highlights.each(function () {
            var annotation = $(this).data("annotation");
            if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("annotatedBy")) {
                var userId = annotation.oa.annotatedBy.email;
                if (contributors.indexOf(userId) === -1) {
                    contributors.push(userId);
                }
            }
        });
        return contributors;
    };

    factory.refreshContributors = function () {
        var users = this.getContributors();
        var items = [];

        users.forEach(function (user, index) {
            var idx = factory.contributors.map(function (x) {
                return x.user;
            }).indexOf(user);
            var showAnnotation = idx !== -1 ? factory.contributors[idx].showAnnotation : true;
            var lastAnnotation = factory.getLastAnnotation(user);
            var isoUpated = lastAnnotation.updated ? lastAnnotation.updated : new Date().toISOString();
            items.push({
                user: user, // creator of annotation
                updated: isoUpated, // date when annotation was updated
                showAnnotation: showAnnotation,
                color: "hsla( " + factory.makeColor(index, users.length) + ", 50%, 75%, 1 )"
            });
        });

        factory.contributors = items;
    };

    /**
     * Shows a given annotation.
     * @param annotation
     */
    factory.showAnnotation = function (annotation) {
        annotation.highlights.forEach(function (entry) {
            entry.className = Annotator.Plugin.Neonion.prototype.classes.visible;
        });
    };

    /**
     * Hides a given annotation.
     * @param annotation
     */
    factory.hideAnnotation = function (annotation) {
        annotation.highlights.forEach(function (entry) {
            entry.className = Annotator.Plugin.Neonion.prototype.classes.hide;
            entry.style.backgroundColor = "";
        });
    };

    factory.makeColor = function (colorNum, colors) {
        if (colors < 1) {
            // defaults to one color - avoid divide by zero
            colors = 1;
        }
        return ( colorNum * (360 / colors) ) % 360;
    };

    factory.colorizeAnnotation = function (annotation) {
        if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("annotatedBy")) {
            var idx = factory.contributors.map(function (x) {
                return x.user;
            }).indexOf(annotation.oa.annotatedBy.email);
            if (idx !== -1) {
                var color = factory.contributors[idx].color;
                annotation.highlights.forEach(function (highlight) {
                    $(highlight).css("backgroundColor", color);
                });
            }
        }
    };

    return factory;
}]);