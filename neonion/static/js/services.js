/**
 * Deprecated: put controllers in separate file under /angular/services
 */

/**
 * Service for on page search
 */
neonionApp.factory('SearchService', function () {
    "use strict";
    return {
        query : "",
        enabled : false
    };
});

/**
 * Service for accounts
 */
neonionApp.factory('AccountService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.getCurrentUser = function() {
        return $http.get('/api/users/current');
    };

    factory.getAccounts = function() {
        return $http.get('/api/users');
    };

    factory.getEntitledDocuments = function(user) {
        return $http.get('/api/users/' + user.id + "/entitled_documents");
    };

    factory.createUser = function(user) {
        return $http.post("/api/users", user);
    };

    factory.updateUser = function(user) {
        return $http.put("/api/users/" + user.id, user);
    };

    factory.deleteUser = function(user) {
        return $http.delete("/api/users/" + user.id, user);
    };

    return factory;
}]);

/**
 * Service for groups
 */
neonionApp.factory('GroupService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.getGroups = function() {
        return $http.get('/api/groups');
    };

    factory.createGroup = function(group) {
        return $http.post("/api/groups/create_group", group);
    };

    factory.deleteGroup = function(group) {
        return $http.delete("/api/groups/" + group.id + "/delete_group", group);
    };

    factory.addGroupMember = function(group, user) {
        return $http.post("/api/groups/" + group.id + "/add_member", user);
    };

    factory.removeGroupMember = function(group, user) {
        return $http.post("/api/groups/" + group.id + "/remove_member", user);
    };

    factory.addGroupDocument = function(group, document) {
        return $http.post("/api/groups/" + group.id + "/add_document", document);
    };

    factory.removeGroupDocument = function(group, document) {
        return $http.post("/api/groups/" + group.id + "/remove_document", document);
    };

    return factory;
}]);

neonionApp.factory('WorkspaceService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.addDocument = function (user, docID) {
        return $http.post("api/users/" + user.id + "/add_document", { doc_id : docID });
    };

    factory.removeDocument = function(user, docID) {
        return $http.post("api/users/" + user.id + "/hide_document", { doc_id : docID });
    };

    return factory;
}]);

neonionApp.factory('DocumentService', ['$http', function($http) {
    "use strict";
    var factory = {};

    factory.getDocument = function(docID) {
        return $http.get('/api/documents/' + docID);
    };

    factory.getFile = function(document) {
        return $http.get('/documents/viewer/' + document.attached_file.id);
    };

    factory.getDocuments = function() {
        return $http.get('/api/documents');
    };

    factory.importDocuments = function(arr) {
        return $http.post("/documents/cms/import", { documents : arr });
    };

    return factory;
}]);

/**
 * Service for Annotator
 */
neonionApp.factory('AnnotatorService', ['$http', function($http) {
    "use strict";
    var factory = {};
    var annotator;

    factory.contributors = [];

    factory.annotator = function(value) {
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