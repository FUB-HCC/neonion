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

    factory.getNumberOfTotalAnnotations = function() {
      if(annotator) {
        var annotations = factory.getAnnotationObjects();
        return annotations.length;
      }
    };

    factory.scrollToAnnotation = function (annotation) {
        // check if just the annotation id was passed
        if (typeof annotation == 'string') {
            var annotations = factory.getAnnotationObjects();
            annotation = annotations.find(function (element) {
                return (element.id == $location.hash());
            });
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

    factory.getAnnotationHighlights = function () {
        return $(".annotator-hl:not(.annotator-hl-temporary),." + Annotator.Plugin.Neonion.prototype.classes.hide);
    };

    factory.getAnnotationObjects = function () {
        var highlights = factory.getAnnotationHighlights();
        var annotations = [];
        highlights.each(function () {
            var annotation = $(this).data("annotation");
            annotations.push(annotation);
        });
        return annotations;
    };

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

    factory.showAnnotation = function (annotation) {
        annotation.highlights.forEach(function (entry) {
            entry.className = Annotator.Plugin.Neonion.prototype.classes.visible;
        });
    };

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