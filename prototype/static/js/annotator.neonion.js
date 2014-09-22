Annotator.Plugin.Neonion = function (element, options) {

    var user;
    var adder;
    var selectedType;
    var compositor;
    var instance;

    return {

        pluginInit : function () {
            instance = this;
            adder = $(this.annotator.adder[0]);

            // create compositor
            compositor = options.compositor || {};
            // intialize default compositors
            Annotator.Plugin.Neonion.prototype.initializeDefaultCompistor(compositor);
            // add additional adder buttons
            this.setAnnotationTypes(compositor);
            // catch submit event
            adder.on( "click", "button", function (e) {
                // set selected type
                selectedType = $(this).val();
            });

            // add field to linked person
            this.annotator.viewer.addField({
                load: function (field, annotation) {
                    if (annotation.rdf) {
                        var fieldValue = "<a href='" + annotation.rdf.about + "' target='blank'>" + annotation.rdf.label + "</a>";
                        var fieldCaption;
                        if (compositor[annotation.rdf.typeof]) {
                            fieldCaption = compositor[annotation.rdf.typeof].label;
                        }
                        else {
                            fieldCaption = Annotator.Plugin.Neonion.prototype.literals['de'].unknownResource;
                        }
                        field.innerHTML = fieldCaption + ":&nbsp;" + fieldValue;
                    }
                    else {
                        field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['de'].unknownResource
                    }
                }
            });
            // add field with creator
            this.annotator.viewer.addField({
                load: function (field, annotation) {
                    var userField = Annotator.Plugin.Neonion.prototype.literals['de'].unknown;
                    if (annotation.creator) {
                        userField = annotation.creator.email;
                    }
                    field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['de'].creator + ": " + userField;
                }
            });

            // add field containing the suggested ressources
            var resourceField = this.annotator.editor.addField({
                load: function(field, annotation) { 
                    // reserve max height so annotator can arrange the editor window properly
                    var list = $(field).find("#resource-list");
                    list.css("min-height", list.css("max-height"));

                    $(field).find("#resource-search").val(annotation.quote); 
                    $(field).find("#resource-form").submit();
                },
                submit: this.pluginSubmit
            });
            
            $(resourceField).children((":first")).replaceWith(
                "<div id='resource-panel'><div id='resource-list' class='btn-group-vertical'></div><form id='resource-form'></form></div>"
            );
            var resourceForm = $(resourceField).find("#resource-form");
            
            // input for search term
            resourceForm.append("<input id='resource-search' type='text' />");
            //resourceForm.append("<input type='submit' value='" + Annotator.Plugin.Neonion.prototype.literals.de.search + "' />");
            // attach submit handler handler
            resourceForm.submit(function() {
                // get search term
                var searchTerm = $(this).find("#resource-search").val();
                var list = $(this).parent().find("#resource-list");
                if (compositor[selectedType]) {
                    compositor[selectedType].search(searchTerm, function(items) {
                        // store last result set in jQuery data collection
                        $(element).data("results", items);
                        // update score
                        Annotator.Plugin.Neonion.prototype.updateScoreAccordingOccurrence(items);
                        // add unknown person resource
                        if (compositor[selectedType].unknownResource) {
                            items.unshift(compositor[selectedType].unknownResource);
                        }
                        
                        // clear list and min-height css property
                        list.css("min-height", "");
                        list.empty();
                        // create and add items
                        list.append(Annotator.Plugin.Neonion.prototype.createListItems(items, compositor[selectedType].formatter));
                    });
                }
                return false;
            });

            var resourceList = $(resourceField).find("#resource-list");
            resourceList.html(Annotator.Plugin.Neonion.prototype.createSpinner());
            // attach click handler
            resourceList.on( "click", "button", function (e) {
                var source = $(this);
                source.parent().children().removeClass("active");
                source.addClass("active");
                $(".annotator-widget").submit();
            });

            var overlay = $("<div class='annotator-overlay' style='display:none;'></div>");
            $(element).parent().append(overlay);
            // mouse hover for detail window
            resourceList.on( "mouseenter", "button", function (e) {
                var dataIndex = parseInt($(this).val());
                var dataItem = $(element).data("results")[dataIndex];
                var decorator = compositor[selectedType].decorator || Annotator.Plugin.Neonion.prototype.decorator.decorateDefault;
                overlay.html(decorator(dataItem));
                overlay.show();
            });
            resourceList.on( "mousemove", "button", function (e) {
                var pos = { top : e.pageY, left: e.pageX + 30 };
                overlay.css(pos);
            });
            resourceList.on( "mouseleave", "button", function (e) {
                overlay.hide();
            });

            // get logged in user credentials
            $.ajax({
                context : this,
                type : "get",
                url : options.whoamiUrl,
                success : this.setUser,
                dataType : "json"
            });

            // attach event handler to enrich DOM with RDFa
            this.annotator.subscribe("annotationCreated", Annotator.Plugin.Neonion.prototype.enrichRDFa);
            this.annotator.subscribe("annotationUpdated", Annotator.Plugin.Neonion.prototype.enrichRDFa);
        },

        setAnnotationTypes : function(compositor) {
            Annotator.Plugin.Neonion.prototype.overrideAdder(adder, compositor);
        },

        setUser : function(userData) {
            user = userData;
        },

        getUser : function() {
            return user;
        },

        pluginSubmit : function(field, annotation) {
            var activeItem = $(field).find(".active");

            // add user to annotation
            annotation.creator = user;
            var itemIndex = parseInt(activeItem.val());
            var dataItem = $(element).data("results")[itemIndex];

            // update annotation object
            annotation.rdf = {
                typeof : selectedType,
                property : "rdfs:label",
                about : dataItem.uri,
                label : dataItem.label
             };
        }
    }

};

// Prototype extensions
Annotator.Plugin.Neonion.prototype.classes = {
    visible : "annotator-hl",
    hide : "annotator-hl-filtered"
}

Annotator.Plugin.Neonion.prototype.literals = {
    en : {
        search :            "Search",
        person :            "Person",
        unknownPerson :     "Unknown person",
        institute :         "Institute",
        unknownInstitute :  "Unknown institute",
        unknown :           "Unknown",
        unknownResource :   "Unknown resource",
        creator :           "Creator"
    },
    de : {
        search :            "Suchen",
        person :            "Person",
        unknownPerson :     "Unbekannte Person",
        institute :         "Institut",
        unknownInstitute :  "Unbekanntes Institut",
        unknown :           "Unbekannt",
        unknownResource :   "Unbekannte Ressource",
        creator :           "Erfasser"
    }
}

Annotator.Plugin.Neonion.prototype.initializeDefaultCompistor = function(compositor) {
     // add compositor for persons
    compositor["https://www.wikidata.org/wiki/Q5"] = {
        label : Annotator.Plugin.Neonion.prototype.literals['de'].person,
        unknownResource : { uri : "http://neonion.com/resource/Unknown_Person", label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownPerson },
        search : Annotator.Plugin.Neonion.prototype.search.searchPerson,
        formatter : Annotator.Plugin.Neonion.prototype.formatter.formatPerson,
        decorator : Annotator.Plugin.Neonion.prototype.decorator.decoratePerson
    };
    // add compositor for institutes
    compositor["https://www.wikidata.org/wiki/Q31855"] = {
        label : Annotator.Plugin.Neonion.prototype.literals['de'].institute,
        unknownResource : { uri : "http://neonion.com/resource/Unknown_Institute", label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownInstitute },
        search : Annotator.Plugin.Neonion.prototype.search.searchInstitute,
        formatter : Annotator.Plugin.Neonion.prototype.formatter.formatInstitute,
        decorator : Annotator.Plugin.Neonion.prototype.decorator.decorateInstitute
    };
}

Annotator.Plugin.Neonion.prototype.getAnnotationHighlights = function() {
    return $(".annotator-hl:not(.annotator-hl-temporary),." + Annotator.Plugin.Neonion.prototype.classes.hide);
}

Annotator.Plugin.Neonion.prototype.showAnnotation = function(annotation) {
    annotation.highlights.forEach(function(entry) {
        entry.className = Annotator.Plugin.Neonion.prototype.classes.visible;
    });
}

Annotator.Plugin.Neonion.prototype.hideAnnotation = function(annotation) {
    annotation.highlights.forEach(function(entry) {
        entry.className = Annotator.Plugin.Neonion.prototype.classes.hide;
    });
}

Annotator.Plugin.Neonion.prototype.getContributors = function() {
    var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
    var constributors = [];
    highlights.each(function() {
        var annotation = $(this).data("annotation");
        var userId = annotation.creator.email;
        if (constributors.indexOf(userId)) {
            constributors.push(userId);
        }
    });
    return constributors;
}

Annotator.Plugin.Neonion.prototype.getUserAnnotations = function(userId) {
    var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
    var annotations = [];
    highlights.each(function() {
        var annotation = $(this).data("annotation");
        if (annotation.creator.email == userId) {
            annotations.push(annotation);
        }
    });
    return annotations;
}

Annotator.Plugin.Neonion.prototype.getLastAnnotation = function(userId) {
    var annotations = Annotator.Plugin.Neonion.prototype.getUserAnnotations(userId);
    if (annotations.length > 0) {
        annotations.sort(Annotator.Plugin.Neonion.prototype.comparator.compareByUpdated);
        return annotations[annotations.length-1];
    }
    return null;
}

Annotator.Plugin.Neonion.prototype.enrichRDFa = function(annotation) {
    // add RDFa attributes to markup
    annotation.highlights[0].setAttribute("typeof", annotation.rdf.typeof);
    annotation.highlights[0].setAttribute("property", annotation.rdf.property);
    annotation.highlights[0].setAttribute("about", annotation.rdf.about);
}

Annotator.Plugin.Neonion.prototype.createListItems = function(list, formatter) {
    var items = [];
    for(var i = 0; i < list.length; i++) {
        var label = formatter(list[i]);
        items.push("<button type='button' class='btn annotator-btn' value='" + i + "'>" + label + "</button>");
    }
    return items;
}

Annotator.Plugin.Neonion.prototype.createSpinner = function() {
    return "<span style='margin:5px;' class='fa fa-spinner fa-spin'></span>";
}

Annotator.Plugin.Neonion.prototype.overrideAdder = function(adder, compositor) {
    adder.html("");
    for (var uri in compositor) {
        adder.append("<button class='btn' value='" + uri + "'>" + compositor[uri].label + "</button>");
    }
},

Annotator.Plugin.Neonion.prototype.updateScoreAccordingOccurrence = function(items) {
    var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
    var occurrence = {};
    // count occurrence of each resource
    highlights.each(function() {
        var annotation = $(this).data("annotation");
        if (annotation.rdf && annotation.rdf.about) {
            if (!occurrence[annotation.rdf.about]) {
                occurrence[annotation.rdf.about] = 0;
            }
            occurrence[annotation.rdf.about]++;
        }
    });
    // calculate score
    for(var i = 0; i < items.length; i++){
        var uri = items[i].uri;
        items[i].score = 1 + (1 - i / (items.length - 1));
        if (occurrence[uri]) {
            items[i].score *= occurrence[uri] + 1;
        }
    }
    // sort by score 
    items.sort(function(a, b) { return b.score - a.score; });
    //console.log(items);
}

Annotator.Plugin.Neonion.prototype.comparator = {
    compareByLabel : function(a, b) {
        return Annotator.Plugin.Neonion.prototype.comparator.compareByField("label", a, b);
    },
    compareByUpdated : function(a, b) {
        return Number(Date.parse(a.updated)) - Number(Date.parse(b.updated));
    },
    compareByField : function(field, a, b) {
        if (a[field] < b[field])
            return -1;
        if (a[field] > b[field])
            return 1;
        return 0;
    }
}

Annotator.Plugin.Neonion.prototype.formatter = {
    formatPerson : function(value) {
        var label = "<span>" + value.label + "</span>";
        if (value.birth) label += "<small>&nbsp;" + value.birth + "</small>";
        return label;
    },
    formatInstitute : function(value) {
        var label = "<span>" + value.label + "</span>";
        // TODO formatting institute
        return label;
    }
}

Annotator.Plugin.Neonion.prototype.decorator = {
    decorateDefault: function(data) {
        var html = "";
        for (var key in data) {
            if (!Array.isArray(data[key])) {
                html += "<p><b>" + key + "</b>&nbsp;<span>" + data[key] + "</span></p>";
            }
        }
        return html;
    },
    decoratePerson : function(data) {
        var html = "<strong>" + data.label + "</strong>";
        if (data.birth) html += "<small>&nbsp;&#42;&nbsp;" + data.birth + "</small>";
        if (data.death) html += "<small>&nbsp;&#8224;&nbsp;" + data.death + "</small>";
        if (data.descr) html += "<br/>" + data.descr;
        return html;
    },
    decorateInstitute : function(data) {
        var html = "<strong>" + data.label + "</strong>";
        if (data.descr) html += "<br/>" + data.descr;
        return html;
    }
}

Annotator.Plugin.Neonion.prototype.search = {
    searchPerson : function(name, callback) {
        var url = '/es/persons?q=' + name;
        $.getJSON(url, function(data) {
            callback(Annotator.Plugin.Neonion.prototype.search.esNormalizeData(data));
        });
    },
    searchInstitute : function(name, callback) {
        var url = '/es/institutes?q=' + name;
        $.getJSON(url, function(data) {
            callback(Annotator.Plugin.Neonion.prototype.search.esNormalizeData(data));
        });
    },
    esNormalizeData : function(data) {
        var array = [];
        data.hits.hits.forEach(function(value, index, arr) {
            array.push(value._source);
        });
        return array;
    }
}