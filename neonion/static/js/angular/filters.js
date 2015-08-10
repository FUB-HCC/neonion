neonionApp
    .filter('escape', function () {
        return window.encodeURIComponent;
    })
    .filter('truncate', function () {
        return function (text, position) {
            if (position == 'left')
                text = '[...]\u00A0' + text;

            if (position == 'right')
                text = text + '\u00A0[...]';

            return text;
        };
    })
    .filter('filterByConceptAnnotation', function () {
        return function (annotations) {
            if (!angular.isUndefined(annotations)) {
                return annotations.filter(function (value) {
                    if (value.hasOwnProperty("rdf") && value['rdf'].hasOwnProperty("uri")) {
                        return true;
                    }
                    return false;
                });
            }
            else {
                return [];
            }
        };
    })
    .filter('filterByCommentAnnotation', function () {
        return function (annotations) {
            if (!angular.isUndefined(annotations)) {
                return annotations.filter(function (value) {
                    // TODO better check for OA body type and motivation
                    return !value.hasOwnProperty("rdf");
                });
            }
            else {
                return [];
            }
        };
    });