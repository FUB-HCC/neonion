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
                    return (value['oa']['motivatedBy'] == "oa:classifying" ||
                        value['oa']['motivatedBy'] == "oa:identifying");
                });
            }
            else {
                return [];
            }
        };
    })
    .filter('filterByLinkedAnnotation', function () {
        return function (annotations) {
            if (!angular.isUndefined(annotations)) {
                return annotations.filter(function (value) {
                    return (value['oa']['motivatedBy'] == "oa:linking");
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
                    return (value['oa']['motivatedBy'] == "oa:commenting");
                });
            }
            else {
                return [];
            }
        };
    })
    .filter('filterByHighlightAnnotation', function () {
        return function (annotations) {
            if (!angular.isUndefined(annotations)) {
                return annotations.filter(function (value) {
                    return (value['oa']['motivatedBy'] == "oa:highlighting");
                });
            }
            else {
                return [];
            }
        };
    });