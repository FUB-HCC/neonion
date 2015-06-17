/**
 * Service for Annotator
 */
neonionApp.factory('AnnotatorService', ['$http', function ($http) {
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

    factory.scrollToAnnotation = function (annotation) {
        // check if just the annotation id was passed
        if (typeof annotation == 'string') {
            var annotations = annotator.plugins.Neonion.getAnnotationObjects();
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

    factory.refreshContributors = function () {
        var users = annotator.plugins.Neonion.getContributors();
        var items = [];

        users.forEach(function (user, index) {
            var idx = factory.contributors.map(function (x) {
                return x.user;
            }).indexOf(user);
            var showAnnotation = idx !== -1 ? factory.contributors[idx].showAnnotation : true;
            var lastAnnotation = annotator.plugins.Neonion.getLastAnnotation(user);
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

    factory.makeColor = function (colorNum, colors) {
        if (colors < 1) {
            // defaults to one color - avoid divide by zero
            colors = 1;
        }
        return ( colorNum * (360 / colors) ) % 360;
    };

    factory.colorizeAnnotation = function (annotation) {
        if (annotation.creator) {
            var idx = factory.contributors.map(function (x) {
                return x.user;
            }).indexOf(annotation.creator.email);
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