/*jshint jquery:true */

neonionApp.controller('MainCtrl', ['$scope', '$http', 'AccountService', function ($scope, $http, AccountService) {
    "use strict";

    // get current user
    AccountService.getCurrentUser().then(function(result) {
        $scope.user = result.data;
    });

}]);

/**
 * Accounts management controller
 */
neonionApp.controller('AccountsCtrl', ['$scope', '$http', 'AccountService', function ($scope, $http, AccountService) {
    "use strict";

    $scope.users = [];

    AccountService.getAccounts().then(function(result) {
        $scope.users = result.data;
    });

    $scope.updateUser = function (user, field, value) {
        if (user.hasOwnProperty(field) && user[field] != value) {
            user[field] = value;
            AccountService.updateUser(user);   
        }
    };

    $scope.deleteUser = function (user) {
        AccountService.deleteUser(user).then(function(result) {
            var idx = $scope.users.indexOf(user);
            $scope.users.splice(idx, 1);    
        });
    };

}]);

/**
 * Group management controller
 */
neonionApp.controller('GroupsCtrl', ['$scope', '$http', 'GroupService', 'AccountService', 'DocumentService',
    function ($scope, $http, GroupService, AccountService, DocumentService) {
    "use strict";
    
    $scope.groups = [];
    $scope.users = [];
    $scope.documents = [];
    $scope.form = {
        groupName : "",
        selectedGroup : -1
    };

    GroupService.getGroups().then(function(result) {
        $scope.groups = result.data;
    });

    AccountService.getAccounts().then(function(result) {
        $scope.users = result.data;
    });

    DocumentService.getDocuments().then(function(result) {
        $scope.documents = result.data;
    });

    $scope.showMembership = function(group) {
        if ($scope.form.selectedGroup == group.id) {
            $scope.form.selectedGroup = -1;
        }
        else {
            $scope.form.selectedGroup = group.id;
        }
    };

    $scope.createGroup = function () {
        if ($scope.form.groupName.length > 0) {
            var group = {
                name : $scope.form.groupName
            };
            GroupService.createGroup(group).then(function(result) {
                $scope.groups.push(result.data);
            });
            $scope.form.groupName = ""; 
        }
    };

    $scope.deleteGroup = function (group) {
        GroupService.deleteGroup(group).then(function(result) {
            var idx = $scope.groups.indexOf(group);
            $scope.groups.splice(idx, 1);    
        });
    };

    $scope.toggleMembership = function(group, user) {
        if (group.members.indexOf(user.id) === -1) {
            $scope.addGroupMember(group, user);
        }
        else {
            $scope.removeGroupMember(group, user);
        }
    };

    $scope.toggleDocumentAssignment = function(group, document) {
        if (group.documents.indexOf(document.id) === -1) {
            $scope.addDocument(group, document);
        }
        else {
            $scope.removeDocument(group, document);
        }
    };

    $scope.addGroupMember = function(group, user) {
        GroupService.addGroupMember(group, user).then(function(result) {
           group.members.push(user.id);
        });
    };

    $scope.removeGroupMember = function(group, user) {
        GroupService.removeGroupMember(group, user).then(function(result) {
             var idx = group.members.indexOf(user.id);
            if (idx > -1) {
                group.members.splice(idx, 1);
            }
        });
    };

    $scope.addDocument = function(group, document) {
       GroupService.addGroupDocument(group, document).then(function(result) {
            group.documents.push(document.id);
        });
    };

    $scope.removeDocument = function(group, document) {
        GroupService.removeGroupDocument(group, document).then(function(result) {
            var idx = group.documents.indexOf(document.id);
            if (idx > -1) {
                group.documents.splice(idx, 1);
            }
        });
    };

}]);

/**
 * Workspace controller
 */
neonionApp.controller('WorkspaceCtrl', ['$scope', '$http', 'AccountService', 'DocumentService', 'WorkspaceService', 'Search',
    function ($scope, $http, AccountService, DocumentService, WorkspaceService, Search) {
    "use strict";

    $scope.search = Search;
    $scope.search.enable = true;
    $scope.allowRemove = false;
    $scope.allowImport = false;
    $scope.showWorkspaceName = false;

    $scope.initPrivateWorkspace = function() {
        $scope.allowRemove = true;
        $scope.allowImport = true;
        AccountService.getCurrentUser().then(function(result) {
            $scope.user = result.data;
            $scope.workspaces = [{ id : -1, name : 'Private', documents : result.data.owned_documents }];
        });
    };

    $scope.initPublicWorkspace = function() {
        AccountService.getCurrentUser().then(function(result) {
            var user = result.data;
            AccountService.getEntitledDocuments(user).then(function(result) {
                // filter for group public
               $scope.workspaces = result.data.filter(function(element) { return element.id == 1; });
            });
        });
    };

    $scope.initGroupWorkspace = function() {
        $scope.showWorkspaceName = true;
        AccountService.getCurrentUser().then(function(result) {
            var user = result.data;
            AccountService.getEntitledDocuments(user).then(function(result) {
               $scope.workspaces = result.data.filter(function(element) { return element.id != 1; });
            });
        });
    };

    $scope.removeDocument = function (workspace, document) {
        if (workspace.id == -1) {
            WorkspaceService.removeDocument($scope.user, document.id).then(function (result) {
                var idx = workspace.documents.indexOf(document);
                workspace.documents.splice(idx, 1);
            });
        }
    };

    $scope.filterDocuments = function(document) {
        if ($scope.search.query.length > 0) {
            // do something with $scope.search.query
            return document.title.toLowerCase().indexOf($scope.search.query.toLowerCase()) != -1;
        }
        return true;
    };

}]);

/**
 * Import controller
 */
neonionApp.controller('WorkspaceImportCtrl', ['$scope', '$http', 'DocumentService', function ($scope, $http, DocumentService) {
    "use strict";

    $http.get('/documents/cms/list').success(function(data) {
        $scope.documents = data;
    });

    $scope.init = function () {
        $("#document-import-list").selectable();
    };

    $scope.importDocuments = function () {
        var selectedDocs = [];
        $('#document-import-list>.ui-selected').each(function() {
            selectedDocs.push(this.id);
        });
        DocumentService.importDocuments(selectedDocs).then(function(data) {
             // return to home
            window.location = "/";
        });
    };

}]);

neonionApp.controller('AnnotationSetCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/annotationsets').success(function(data) {
        $scope.annotationsets = data;
    });

}]);

neonionApp.controller('AnnotationStoreCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $http.get('/api/store/filter').success(function(data) {
        var occurrences = {};
        var filterUserData = data.rows;

        filterUserData.forEach(function(a) {
            var rdf = a.rdf;
            var key = a.quote + rdf;
            var ann = a.quote;
            var type = rdf.typeof;
            var date = a.created;
            var doc = a.uri;

            var typeParts = type.split('/');
            var concept = typeParts[typeParts.length-1];

            if (!(key in occurrences)) {
                occurrences[key] = {ann: ann, count:  1, typeof: concept, last: date, docs: new Array()};
            } else {
                occurrences[key].count++;
                var parsedDate = Date.parse(date);
                var parsedOld = Date.parse(occurrences[key].last);
                if (parsedDate > parsedOld) {
                    occurrences[key].last = date;
                }
            }

            if (((occurrences[key].docs).indexOf(doc)) == -1) {
                occurrences[key].docs.push(doc);
            }
        });
        $scope.occurrences = occurrences;
    });
}]);

neonionApp.controller('AnnOccurCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    "use strict";
    $scope.ann_occur = {};
    var url = $location.absUrl().split('/');
    var quote = url[url.length-1];

    $http.get('/api/store/filter?quote=' + quote).success(function (data2) {

        var filterUserData = data2.rows;

        filterUserData.forEach(function(a) {
            // context variable here
            if (decodeURI(quote) === a.quote) {
                var key = a.id;
                var ann = a.quote;
                var date = a.created;
                var context = a.context;
                var contextRight = context.right;
                var contextLeft = context.left;

                $http.get('/api/documents').success(function (data) {
                    var self = this;

                    data.forEach(function (b) {
                        var title = b.title;
                        var id = b.id;

                        if (id == a.uri) {
                            $scope.ann_occur[key] = {}
                            $scope.ann_occur[key].title = title;
                        }
                        ;
                    });
                    $scope.ann_occur[key].created = date;
                    $scope.ann_occur[key].ann = ann;
                    $scope.ann_occur[key].contextRight = contextRight;
                    $scope.ann_occur[key].contextLeft = contextLeft;
                });
            }
        });
    });

}]);

neonionApp.controller('AnnDocsCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    "use strict";
    var ann_docs = {};
    var url = $location.absUrl().split('/');
    var quote = url[url.length-1];

    $http.get('/api/documents').success(function (data2) {
        data2.forEach(function(b) {
            var id = b.id;
            var title = b.title;

            $http.get('/api/store/filter?quote=' + quote).success(function (data) {
                var filterUserData = data.rows;

                filterUserData.forEach(function (a) {
                    if (decodeURI(quote) === a.quote) {
                        if (!(id in ann_docs) && id == a.uri) {
                            ann_docs[id] = {urn: id, title: title};
                        }
                    }
                });
            });
        });
    });
    $scope.ann_docs = ann_docs;
}]);

/**
 * Annotator controller
 */
neonionApp.controller('AnnotatorCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $scope.contributors = [];

    $scope.setupAnnotator = function(uri, userId) {
        $("#document-body").annotator()
        .annotator('addPlugin', 'Neonion', {
            whoamiUrl: "/accounts/me"
        })
        .annotator('addPlugin', 'NER', {
            service : 'http://localhost:5000',
            uri : uri
        })
        .annotator('addPlugin', 'Store', {
            prefix: '/api/store',
            annotationData: {'uri': uri},
            // filter annotations by creator
            loadFromSearch: {
                'uri': uri,
                //'creator.email': userId,
                'limit': 999999
            }
        });

        // get annotator instance and subscribe to events
        $scope.annotator = $("#document-body").data("annotator");
        $scope.annotator
        .subscribe("annotationCreated", $scope.handleAnnotationEvent)
        .subscribe("annotationUpdated", $scope.handleAnnotationEvent)
        .subscribe("annotationDeleted", $scope.handleAnnotationEvent)
        .subscribe('annotationsLoaded', function(annotations) {
            $scope.$apply(function() {
                $scope.contributors = $scope.getContributors();
                // colorize each annotation
                annotations.forEach($scope.colorizeAnnotation);
            });
        });

        $scope.loadAnnotationSet();
    };

    $scope.loadAnnotationSet = function() {
        $http.get('/api/annotationsets').success(function (data) {
            $scope.annotationsets = data;
            if ($scope.annotationsets.length > 0) {
                var sets = {};
                // TODO just take the first AS
                $scope.annotationsets[0].concepts.forEach(function (item) {
                    sets[item.uri] = {
                        label: item.label
                    };
                });

                $scope.annotator.plugins.Neonion.setCompositor(sets);
            }
        });
    };

    $scope.scrollToLastAnnotation = function() {
        var annotation = Annotator.Plugin.Neonion.prototype.getLastAnnotation($scope.annotator.plugins.Neonion.getUser().email);
        if (annotation) {
            var target = $(annotation.highlights[0]);
            $('html, body').stop().animate({
                'scrollTop': target.offset().top - 50 },
                1000,
                'easeInOutQuart'
            );
            // blink for more attention
            for(var i = 0; i < 2; i++) {
                $(target).fadeTo('slow', 0.5).fadeTo('slow', 1.0);
            }
        }
        return false;
    };

    $scope.toggleContributor = function(contributor) {
        var annotations = Annotator.Plugin.Neonion.prototype.getUserAnnotations(contributor.user);
        if (contributor.showAnnotation) {
            annotations.forEach(function(item) {
                Annotator.Plugin.Neonion.prototype.showAnnotation(item);
                $scope.colorizeAnnotation(item);
            });
        } else {
            annotations.forEach(Annotator.Plugin.Neonion.prototype.hideAnnotation);
        }
    };

    $scope.makeColor = function(colorNum, colors) {
        if (colors < 1) {
            // defaults to one color - avoid divide by zero
            colors = 1;
        }
        return ( colorNum * (360 / colors) ) % 360;
    };

    $scope.handleAnnotationEvent = function(annotation) {
        $scope.$apply(function() {
            $scope.contributors = $scope.getContributors();
            $scope.colorizeAnnotation(annotation);
        });
    };

    $scope.colorizeAnnotation = function(annotation) {
        if (annotation.creator) {
            var idx = $scope.contributors.map(function(x) {return x.user; }).indexOf(annotation.creator.email);
            if (idx !== -1) {
                var color = $scope.contributors[idx].color;
                annotation.highlights.forEach(function (highlight) {
                    $(highlight).css("backgroundColor", color);
                });
            }
        }
    };

    $scope.getContributors = function() {
        var users = Annotator.Plugin.Neonion.prototype.getContributors();
        var items = [];

        users.forEach(function (user, index) {
            var idx = $scope.contributors.map(function(x) {return x.user; }).indexOf(user);
            var showAnnotation = idx !== -1 ? $scope.contributors[idx].showAnnotation : true;
            var lastAnnotation = Annotator.Plugin.Neonion.prototype.getLastAnnotation(user);
            var isoUpated = lastAnnotation.updated ? lastAnnotation.updated : new Date().toISOString();
            items.push({
                user: user, // creator of annotation
                updated: isoUpated, // date when annotation was updated
                showAnnotation : showAnnotation,
                color : "hsla( " + $scope.makeColor(index, users.length) + ", 100%, 50%, 0.3 )"
            });
        });

        return items;
    };

}]);

neonionApp.controller('NamedEntityCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

    $scope.models = [
        {
            identifier: 'Standard',
            stanfordModel: 'dewac_175m_600',
            predictorNumberOfComponents: '?',
            predictorNumberOfIterations: '(10^6) / n',
            predictorLossFunction: 'log',
            predictorAlpha: '?',
            numberOfHiddenLayerComponents: 4,
            predictorInitialize: 'Standard',
            learnNetworkInitialize: 'Standard',
            predictorLearn: false,
            learnNetworkLearn: false
        }
    ];
}]);