neonionApp.controller('AccountsCtrl', ['$scope', '$http', 'AccountService', function ($scope, $http, AccountService) {
    "use strict";

    $http.get('/api/users').success(function(data) {
        $scope.users = data;
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

neonionApp.controller('GroupsCtrl', ['$scope', '$http', 'GroupService', function ($scope, $http, GroupService) {
    "use strict";
    
    $scope.groups = [];
    $scope.users = [];
    $scope.form = {
        groupName : "",
        selectedGroup : -1
    };

    $http.get('/api/groups').success(function(data) {
        $scope.groups = data;
    });

    $http.get('/api/users').success(function(data) {
        $scope.users = data;
    });

    $scope.showMembership = function(group) {
        if ($scope.form.selectedGroup == group.id) {
            $scope.form.selectedGroup = -1;
        }
        else {
            $scope.form.selectedGroup = group.id;
        }
    }

    $scope.createGroup = function () {
        if ($scope.form.groupName.length > 0) {
            var group = {
                name : $scope.form.groupName,
                user_set : []
            }
            GroupService.createGroup(group).then(function(result) {
                $scope.groups.push(result.data);
            });
            $scope.form.groupName = ""; 
        }
    };

    $scope.updateGroup = function(group) {
        GroupService.updateGroup(group);
    };

    $scope.deleteGroup = function (group) {
        GroupService.deleteGroup(group).then(function(result) {
            var idx = $scope.groups.indexOf(group);
            $scope.groups.splice(idx, 1);    
        });
    };

    $scope.toogleMembership = function(group, user) {
        if (group.user_set.indexOf(user.id) == -1) {
            $scope.addGroupMember(group, user);
        }
        else {
            $scope.removeGroupMember(group, user);
        }
    };

    $scope.addGroupMember = function(group, user) {
        group.user_set.push(user.id);
        $scope.updateGroup(group);
    };

    $scope.removeGroupMember = function(group, user) {
        var idx = group.user_set.indexOf(user.id);
        if (idx > -1) {
            group.user_set.splice(idx, 1);
            $scope.updateGroup(group);
        }
    };

}]);

neonionApp.controller('WorkspaceDocumentCtrl', ['$scope', '$http', 'WorkspaceService', function ($scope, $http, WorkspaceService) {
    "use strict";

    $http.get('/api/workspace/documents/').success(function(data) {
        $scope.documents = data;
    });

    $scope.removeDocument = function (document) {
        WorkspaceService.removeDocument(document.urn).then(function(result) {
            var idx = $scope.documents.indexOf(document);
            $scope.documents.splice(idx, 1);    
        });
    };
}]);

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

    $http.get('/api/store/search?quote=' + quote).success(function (data2) {

        var filterUserData = data2.rows;

        filterUserData.forEach(function(a) {
            // context variable here

            var key = a.id;
            var ann = a.quote;
            var date = a.created;
            var context = a.context;
            var contextRight = context.right;
            var contextLeft = context.left;

            $http.get('/api/documents').success(function (data) {
                var self = this;

                data.forEach(function(b) {
                    var title = b.title;
                    var urn = b.urn;

                    if (urn == a.uri) {
                        $scope.ann_occur[key] = {}
                        $scope.ann_occur[key].title = title;
                    };
                });
                $scope.ann_occur[key].created = date;
                $scope.ann_occur[key].ann = ann;
                $scope.ann_occur[key].contextRight = contextRight;
                $scope.ann_occur[key].contextLeft = contextLeft;
            });
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
            var urn = b.urn;
            var title = b.title;

            $http.get('/api/store/search?quote=' + quote).success(function (data) {
                var filterUserData = data.rows;

                filterUserData.forEach(function(a) {
                    if (!(urn in ann_docs) && urn == a.uri) {
                        ann_docs[urn] = {urn: urn, title: title};
                    };
                });
            });
        });
    });
    $scope.ann_docs = ann_docs;
}]);

neonionApp.controller('AnnotatorCtrl', ['$scope', '$http', function ($scope, $http) {
    "use strict";

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

        $scope.annotator = $("#document-body").data("annotator");
        $scope.loadAnnotationSet();

        /*annotator.subscribe("annotationCreated", function (annotation) {
        notifyEndpoint(annotation);
        //annotationChanged(annotation);
        });*/

        // TODO raise refresh list when store plugin has finished async request
        /*window.setTimeout(function() {
        refreshContributors();
        var users = Annotator.Plugin.Neonion.prototype.getContributors();
        users.forEach(function(user) {
        var annotations = Annotator.Plugin.Neonion.prototype.getUserAnnotations(user);
        annotations.forEach(function(ann){
        colorizeAnnotation(ann);
        });
        });
        }, 1000);*/
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