Annotator.Plugin.Neonion = function (element, options) {
    // call constructor
    Annotator.Plugin.apply(this, arguments);

    // private vars
    var user = null;
    var compositor = {};
    var selectedType = null;
    var viewerFields = {};
    var editorFields = {};

    // properties
    this.setUser = function(userData) { user = userData; }
    this.getUser = function() { return user; }
    this.setCompositor = function(compositorData) { compositor = compositorData; }
    this.getCompositor = function() { return compositor; }

    // init method
    this.pluginInit = function () {
        
        this.overrideAdder();
        viewerFields = this.initViewerFields();
        editorFields = {
            search : this.initEditorEntitySearch(),
            create : this.initEditorEntityCreation()
        }

        // get logged in user credentials
        $.ajax({
            context : this,
            type : "get",
            url : options.whoamiUrl,
            success : this.setUser,
            dataType : "json"
        });
    }

    // overrides the adder according provided types
    this.overrideAdder = function() {
        var adder = $(this.annotator.adder[0]);

        // create compositor
        this.setCompositor(options.compositor || Annotator.Plugin.Neonion.prototype.defaultCompositor());
        // add additional adder buttons
        this.setAnnotationTypes(adder, this.getCompositor());
        // catch submit event
        adder.on( "click", "button", function (e) {
            // set selected type
            selectedType = $(this).val();
            // show or hide entity creation field
            if (compositor[selectedType] && compositor[selectedType].allowCreation) {
                $(editorFields.create).show();
            }
            else {
                $(editorFields.create).hide();
            }
        });  
        return adder; 
    }

    // creates additional fields in viewer
    this.initViewerFields = function() {
        return {
            // add field to linked person
            resource : this.annotator.viewer.addField({
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
            }),
            // add field with creator
            creator : this.annotator.viewer.addField({
                load: function (field, annotation) {
                    var userField = Annotator.Plugin.Neonion.prototype.literals['de'].unknown;
                    if (annotation.creator) {
                        userField = annotation.creator.email;
                    }
                    field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['de'].creator + ": " + userField;
                }
            })
        };
    }

    // creates the search field in editor
    this.initEditorEntitySearch = function() {
        // add field containing the suggested ressources
        var searchField = this.annotator.editor.addField({
            load: function(field, annotation) { 
                // restore type from annotation if provided
                selectedType = annotation.rdf ? annotation.rdf.typeof : selectedType;
                // reserve max height so annotator can arrange the editor window properly
                var list = $(field).find("#resource-list");
                list.css("min-height", list.css("max-height"));
                
                $(field).show();
                $(field).find("#resource-search").val(annotation.quote); 
                $(field).find("#resource-form").submit();
            },
            submit: function(field, annotation) {
                // add user to annotation
                annotation.creator = user;

                if ($(element).data("resource")) {
                    var dataItem = $(element).data("resource");
                    // update annotation object
                    annotation.rdf = {
                        typeof : selectedType,
                        property : "rdfs:label",
                        about : dataItem.uri + '',
                        label : dataItem.label
                     };
                     // remove from data
                     $(element).data("resource", null);
                     //console.log(annotation);
                     //console.log(dataItem);
                }
            }
        });

        $(searchField).children((":first")).replaceWith(
            "<div id='resource-list' class='btn-group-vertical'></div><form id='resource-form'></form>"
        );
        var searchForm = $(searchField).find("#resource-form");
        
        // input for search term
        searchForm.append("<input id='resource-search' type='text' autocomplete='off'  placeholder='" 
            + Annotator.Plugin.Neonion.prototype.literals['de'].searchText + "' required />"
        );
        //searchForm.append("<input type='submit' value='" + Annotator.Plugin.Neonion.prototype.literals.de.search + "' />");
        // attach submit handler handler
        searchForm.submit(function() {
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

        var resourceList = $(searchField).find("#resource-list");
        resourceList.html(this.createSpinner());
        // attach click handler
        resourceList.on( "click", "button", function (e) {
            var source = $(this);
            //source.parent().children().removeClass("active");
            //source.addClass("active");
            var itemIndex = parseInt(source.val());
            var dataItem = $(element).data("results")[itemIndex];
            // store selected resource in data
            $(element).data("resource", dataItem);
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

        return searchField;
    }

    this.initEditorEntityCreation = function() {
        var createField = this.annotator.editor.addField({
            load: function(field, annotation) { 
                createForm.hide();
                createForm.html('');
                if (compositor[selectedType] && compositor[selectedType].allowCreation) {
                    if (compositor[selectedType].fields) {
                        compositor[selectedType].fields.forEach(function(element, index, array) {
                            var field = "<label for='" + element.name + "''>" + element.label + "</label>";
                            field += "<input type='" + element.type + "' id='" + element.name + "'";
                            if (element.required) field += " required";
                            field += " autocomplete='off' />";
                            createForm.append(field + "<br>");
                        });
                        createForm.append(
                            "<input type='submit' class='btn annotator-btn' value='" +
                            Annotator.Plugin.Neonion.prototype.literals['de'].create + "' />"
                        );
                        // prefill first field
                        createForm.find("#" + compositor[selectedType].fields[0].name).val(annotation.quote);
                    }
                    else {
                        console.error("No entity field description provided");  
                    }
                } 
            }
        });

        $(createField).children((":first")).replaceWith(
            "<button id='create-toggle' class='btn annotator-btn' >" 
            + Annotator.Plugin.Neonion.prototype.literals['de'].create + 
            "</button><form id='create-form'>fhjkfhfkjgdhfkjghfk</form>"
        );

        $(createField).find("#create-toggle").click(function() {
            $(editorFields.search).slideToggle();
            createForm.slideToggle();
            return false;
        });

        var createForm = $(createField).find("#create-form");
        createForm.submit(function() {
            if (compositor[selectedType]) {
                var fields = {};
                var formFields = this.elements;
                // collect fields
                compositor[selectedType].fields.forEach(function(element, index, array) {
                    var value = formFields[element.name].value;
                    fields[element.name] = value ? value : null;
                });
                // create entity
                if (compositor[selectedType].create) {
                    compositor[selectedType].create(fields, function(data) {
                        $(element).data("resource", data);
                        $(".annotator-widget").submit();
                    });
                }
                else {
                    console.error("No create entity service provided");
                }
            }
            return false;
        });

        return createField;
    }
};

jQuery.extend(Annotator.Plugin.Neonion.prototype, new Annotator.Plugin(), {
    events: {},
    options: {},

    classes : {
        visible :               "annotator-hl",
        hide :                  "annotator-hl-filtered"
    },

    literals : {
        en : {
            search :            "Search",
            searchText :        "Search text",
            create :            "Create",     
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
            searchText :        "Suchtext",
            create :            "Anlegen",
            person :            "Person",
            unknownPerson :     "Unbekannte Person",
            institute :         "Institut",
            unknownInstitute :  "Unbekanntes Institut",
            unknown :           "Unbekannt",
            unknownResource :   "Unbekannte Ressource",
            creator :           "Erfasser"
        }
    },

    setAnnotationTypes : function(adder, compositor) {
        adder.html("");
        for (var uri in compositor) {
            if (!compositor[uri].omitAdder) {
                adder.append("<button class='btn' value='" + uri + "'>" + compositor[uri].label + "</button>");
            }
        }
    },

    defaultCompositor : function() {
        return {
             // add compositor for persons
            "https://www.wikidata.org/wiki/Q5" : {
                label : Annotator.Plugin.Neonion.prototype.literals['de'].person,
                omitAdder : false,
                allowCreation : true,
                unknownResource : { uri : "http://neonion.com/resource/Unknown_Person", label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownPerson },
                create : Annotator.Plugin.Neonion.prototype.create.createPerson,
                search : Annotator.Plugin.Neonion.prototype.search.searchPerson,
                formatter : Annotator.Plugin.Neonion.prototype.formatter.formatPerson,
                decorator : Annotator.Plugin.Neonion.prototype.decorator.decoratePerson,
                fields : [ 
                    { name : 'label', label : 'Vollständiger Name', type : 'text', required : true },
                    { name : 'descr', label : 'Kurzbeschreibung', type : 'text' },
                    { name : 'birth', label : 'Geburtsdatum', type : 'date' },
                    { name : 'death', label : 'Sterbedatum', type : 'date' }
                ]
            },
            // add compositor for institutes
            "https://www.wikidata.org/wiki/Q31855" : {
                label : Annotator.Plugin.Neonion.prototype.literals['de'].institute,
                omitAdder : false,
                allowCreation : false,
                unknownResource : { uri : "http://neonion.com/resource/Unknown_Institute", label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownInstitute },
                create : Annotator.Plugin.Neonion.prototype.create.createInstitute,
                search : Annotator.Plugin.Neonion.prototype.search.searchInstitute,
                formatter : Annotator.Plugin.Neonion.prototype.formatter.formatInstitute,
                decorator : Annotator.Plugin.Neonion.prototype.decorator.decorateInstitute
            }
        };
    },

    getAnnotationHighlights : function() {
        return $(".annotator-hl:not(.annotator-hl-temporary),." + Annotator.Plugin.Neonion.prototype.classes.hide);
    },

    showAnnotation : function(annotation) {
        annotation.highlights.forEach(function(entry) {
            entry.className = Annotator.Plugin.Neonion.prototype.classes.visible;
        });
    },

    hideAnnotation : function(annotation) {
        annotation.highlights.forEach(function(entry) {
            entry.className = Annotator.Plugin.Neonion.prototype.classes.hide;
            entry.style.backgroundColor = "";
        });
    },

    getContributors : function() {
        var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
        var constributors = [];
        highlights.each(function() {
            var annotation = $(this).data("annotation");
            var userId = annotation.creator.email;
            if (constributors.indexOf(userId) == -1) {
                constributors.push(userId);
            }
        });
        return constributors;
    },

    getUserAnnotations : function(userId) {
        var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
        var annotations = [];
        highlights.each(function() {
            var annotation = $(this).data("annotation");
            if (annotation.creator.email == userId) {
                annotations.push(annotation);
            }
        });
        return annotations;
    },

    getLastAnnotation : function(userId) {
        var annotations = Annotator.Plugin.Neonion.prototype.getUserAnnotations(userId);
        if (annotations.length > 0) {
            annotations.sort(Annotator.Plugin.Neonion.prototype.comparator.compareByUpdated);
            return annotations[annotations.length-1];
        }
        return null;
    },

    getCookie : function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    },

    /*enrichRDFa : function(annotation) {
        // add RDFa attributes to markup
        annotation.highlights[0].setAttribute("typeof", annotation.rdf.typeof);
        annotation.highlights[0].setAttribute("property", annotation.rdf.property);
        annotation.highlights[0].setAttribute("about", annotation.rdf.about);
    },*/

    createListItems : function(list, formatter) {
        var items = [];
        for(var i = 0; i < list.length; i++) {
            var label = formatter(list[i]);
            items.push("<button type='button' class='btn annotator-btn' value='" + i + "'>" + label + "</button>");
        }
        return items;
    },

    createSpinner : function() {
        return "<span style='margin:5px;' class='fa fa-spinner fa-spin'></span>";
    },

    updateScoreAccordingOccurrence : function(items) {
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
    },

    comparator : {
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
    },

    formatter : {
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
    },

    decorator : {
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
    },

    search : {
        searchPerson : function(name, callback) {
            var url = '/es/persons?q=' + name;
            $.getJSON(url, function(data) {
                if (callback) callback(Annotator.Plugin.Neonion.prototype.search.esNormalizeData(data));
            });
        },
        searchInstitute : function(name, callback) {
            var url = '/es/institutes?q=' + name;
            $.getJSON(url, function(data) {
                if (callback) callback(Annotator.Plugin.Neonion.prototype.search.esNormalizeData(data));
            });
        },
        esNormalizeData : function(data) {
            var array = [];
            data.hits.hits.forEach(function(value, index, arr) {
                array.push(value._source);
            });
            return array;
        }
    },
    create : {
        createPerson : function(data, callback) {
            $.ajax({
                dataType: "json", type: "POST",
                url: '/es/create/persons', 
                data: { "data" : JSON.stringify(data), csrfmiddlewaretoken : Annotator.Plugin.Neonion.prototype.getCookie('csrftoken') },
                success: function(data, jqXHR) {
                    if (callback) callback(data);
                }
            });
        },
        createInstitute : function(data, callback) {
            $.ajax({
                dataType: "json", type: "POST",
                url: '/es/create/institutes', 
                data: { "data" : JSON.stringify(data), csrfmiddlewaretoken : Annotator.Plugin.Neonion.prototype.getCookie('csrftoken') },
                success: function(data, jqXHR) {
                    if (callback) callback(data);
                }
            });
        }
    }
});