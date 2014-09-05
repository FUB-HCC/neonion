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
            var suggestionField = this.annotator.editor.addField({
                load: this.updateSuggestionField,
                submit: this.pluginSubmit
            });
            $(suggestionField).children((":first")).replaceWith("<div class='btn-group-vertical'></div>");
            // attach click handler
            $(suggestionField).on( "click", "button", function (e) {
                var source = $(this);
                source.parent().children().removeClass("active");
                source.addClass("active");
                $(".annotator-widget").submit();
            });

            var overlay = $("<div class='annotator-overlay' style='display:none;'></div>");
            $(element).parent().append(overlay);
            //$(this.annotator.wrapper[0]).append(overlay);
            // mouse hover for detail window
            $(suggestionField).on( "mouseenter", "button", function (e) {
                var dataIndex = parseInt($(this).val());
                var dataItem = $(element).data("results")[dataIndex];
                var decorator = compositor[selectedType].decorator || Annotator.Plugin.Neonion.prototype.decorator.decorateDefault;

                /*var pos = $(".annotator-editor").position();
                pos.left += $(".annotator-editor").width();
                overlay.css(pos);*/
                overlay.html(decorator(dataItem));
                overlay.show();
            });
            $(suggestionField).on( "mousemove", "button", function (e) {
                var pos = { top : e.pageY, left: e.pageX + 30 };
                overlay.css(pos);
            });
            $(suggestionField).on( "mouseleave", "button", function (e) {
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

        pluginSubmit : function(field, annotation) {
            var activeItem = $(field).children(":first").children(".active");

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
        },

        updateSuggestionField : function(field, annotation) {
            // get selected text
            var list = $(field).children(":first");
            list.empty();
            // reserve max height so annotator can arrange the editor window properly
            list.css("min-height", list.css("max-height"));

            if (compositor[selectedType]) {
                compositor[selectedType].search(annotation.quote, function(items) {
                    // store last result set in jQuery data collection
                    $(element).data("results", items);
                    // update score
                    Annotator.Plugin.Neonion.prototype.updateScoreAccordingOccurrence(items);
                    // add unknown person resource
                    if (compositor[selectedType].unknownResource) {
                        items.unshift(compositor[selectedType].unknownResource);
                    }
                    // clear min-height property
                    list.css("min-height", "");
                    // create and add items
                    list.append(Annotator.Plugin.Neonion.prototype.createListItems(items, compositor[selectedType].formatter));

                    // activae corresponding button
                    if (annotation.rdf) {
                        list.children("button[uri='" + annotation.rdf.about + "']" ).addClass("active");
                    }
                });
            }
        }
    }

};

// Prototype extensions
Annotator.Plugin.Neonion.prototype.literals = {
    en : {
        person :            "Person",
        unknownPerson :     "Unknown person",
        institute :         "Institute",
        unknownInstitute :  "Unknown institute",
        unknown :           "Unknown",
        unknownResource :   "Unknown resource",
        creator :           "Creator"
    },
    de : {
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
        formatter : Annotator.Plugin.Neonion.prototype.formatter.formatPerson
    };
    // add compositor for institutes
    compositor["https://www.wikidata.org/wiki/Q31855"] = {
        label : Annotator.Plugin.Neonion.prototype.literals['de'].institute,
        unknownResource : { uri : "http://neonion.com/resource/Unknown_Institute", label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownInstitute },
        search : Annotator.Plugin.Neonion.prototype.search.searchInstitute,
        formatter : Annotator.Plugin.Neonion.prototype.formatter.formatInstitute
    };
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

Annotator.Plugin.Neonion.prototype.overrideAdder = function(adder, compositor) {
    adder.html("");
    for (var uri in compositor) {
        adder.append("<button class='btn' value='" + uri + "'>" + compositor[uri].label + "</button>");
    }
},

Annotator.Plugin.Neonion.prototype.updateScoreAccordingOccurrence = function(items) {
    var annotatorItems = $(".annotator-hl:not(.annotator-hl-temporary)");
    var occurrence = {};
    // count occurrence of each resource
    annotatorItems.each(function() {
        var annotation = $(this).data("annotation");
        console.log(annotation);
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
        //if (value.descr) label += "<br/><small>" + value.descr + "</small>";
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
        return "<div>Datenblatt zu Person</div>";
    },
    decorateInstitute : function(data) {
        return "<div>Datenblatt zu Institution</div>";
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
        var url = '/es/institutes?q=Institut';
        $.getJSON(url, function(data) {
            data.hits.hits.sort(Annotator.Plugin.Neonion.prototype.comparator.compareByLabel);
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