/*jshint jquery:true */
/*jshint devel:true */
/*jshint sub:true */
/*global Annotator:false */

/**
 * @preserve Copyright 2015 HCC FU Berlin.
 * write licence text
 */
(function () {
    "use strict"; // enable strict mode

    /**
     * neonion plugin for Annotator
     * @implements {Annotator.Plugin}
     */
    Annotator.Plugin.Neonion = function (element, options) {

        /**
         * Call constructor.
         * @constructor
         */
        Annotator.Plugin.apply(this, arguments);

        /**
         * Get or set AnnotationSet property.
         * @param sets
         * @returns {*}
         */
        this.annotationSets = function (sets) {
            if (sets) {
                this.compositor = sets;
                if (this.editorState.annotationMode == this.annotationModes.semanticAnnotation) {
                    // apply if annotation mode equals semantic annotation mode
                    this.applyAnnotationSets();
                }   
            }
            return this.compositor;
        };

        this.annotationMode = function(mode) {
            if (mode && $.isNumeric(mode)) {
                this.editorState.annotationMode = mode;
                switch(mode) {
                    case this.annotationModes.semanticAnnotation:
                        this.applyAnnotationSets();
                        break;
                    case this.annotationModes.freeTextAnnotation:
                        this.adder.html(this.templates.emptyAdder);
                        break;
                }
            }
            return this.editorState.annotationMode;
        };

        /**
         * Initializes the plugin.
         * @override
         */
        this.pluginInit = function () {
            this.adder = this.overrideAdder();
            this.fields = {
                viewer: this.initViewerField(),
                editor: this.initEditorField()
            };
            this.editorState = {
                annotationMode : this.annotationModes.semanticAnnotation,
                selectedType : "",
                selectedItem : -1,
                resultSet : []
            };

            // create compositor from provided annotation sets
            if (this.options.hasOwnProperty("annotationSets")) {
                this.compositor = this.options["annotationSets"];
            }
            else {
                this.compositor = {};
            }
            
            // bind events to document
            $(document).bind({
                mouseup: $.proxy(function (event) {
                    // skip adder if only one button is visible
                    if ($(this.adder).is(":visible")) {
                        var childBtn = $(this.adder).find("button");
                        // only one button is visible in adder
                        if (childBtn.length === 1) {
                            this.annotator.ignoreMouseup = true;
                            childBtn.click();
                        } 
                    }
                }, this)
            });

            // attach handler to hide editor
            $("[data-action=annotator-cancel]").on("click", $.proxy(function () {
                this.annotator.editor.hide();
            }, this));

            // attach handler to submit editor
            $("[data-action=annotator-submit]").on("click", $.proxy(function () {
                this.annotator.editor.submit();
            }, this));

            // closure
            this.annotationSets(this.annotationSets());
            this.applyLayer(this.annotationLayers.group);
            //this.annotationMode(this.annotationModes.freeTextAnnotation);
        };

        /**
         * Creates additional fields in viewer
         * @returns {{resource: *, agent: *}}
         */
        this.initViewerField = function () {
            return {
                // get comment field
                comment: this.annotator.viewer.fields[0].element,
                // add field to linked resource
                resource: this.annotator.viewer.addField({
                    load: $.proxy(this.viewerLoadResourceField, this)
                }),
                // add field with agent
                agent: this.annotator.viewer.addField({
                    load: $.proxy(this.viewerLoadAgentField, this)
                })
            };
        };

        /**
         * Creates the search field in editor
         * @returns {*}
         */
        this.initEditorField = function () {
            return {
                freeTextField : this.initFreeTextField(),
                semanticAnnotationField : this.initSemanticAnnotationField()
            };
        };

        this.initFreeTextField = function() {
            var field = this.annotator.editor.fields[0].element;
            // add controls 
            $(field).append(
                "<div class='resource-controles'>" + this.templates.submitItem + this.templates.cancelItem + "</div>");

            return field;
        };

        this.initSemanticAnnotationField = function() {
            // add field containing the suggested resources
            var field = this.annotator.editor.addField({
                load: $.proxy(this.loadEditorField, this),
                submit: $.proxy(this.submitEditorField, this)
            });

            // replace filed with custom content
            $(field).children((":first")).replaceWith(
                "<div class='resource-controles'>" + this.templates.cancelItem + this.templates.unknownItem + "</div>" +
                "<form id='resource-form'>" + this.templates.searchItem + "</form>" +
                "<div id='resource-list'></div>"
            );

            // create input for search term
            var searchInput = $('<input>').attr({
                type: 'text',
                id: 'resource-search',
                autocomplete: 'off',
                placeholder: this.literals['en'].searchText,
                required: true
            });

            $(".annotator-editor").append(this.templates.editorLine);

            var searchForm = $(field).find("#resource-form");
            var resourceList = $(field).find("#resource-list");
            searchInput.appendTo(searchForm);

            // attach submit handler handler
            searchForm.submit($.proxy(function () {
                this.updateResourceList(searchInput.val());
                return false;
            }, this));

            // attach key event to search while typing
            searchInput.keyup(function (e) {
                var keyCode = e.which || e.keyCode;
                // fire only on printable characters and backspace
                if (keyCode >= 32 || keyCode === 8) {
                    var timeoutID = $(searchForm).data("timeoutID");
                    if (timeoutID) {
                        // clear prior timeout
                        window.clearTimeout(timeoutID);
                    }
                    // submit search form delayed
                    timeoutID = window.setTimeout(function () {
                        $(searchForm).removeData("timeoutID");
                        $(searchForm).submit();
                    }, 200);
                    $(searchForm).data("timeoutID", timeoutID);
                }
            });

            // stop propagation on anchor click
            resourceList.on("click", "a", $.proxy(function (e) {
                e.stopPropagation();
            }, this));

            // attach handler to submit from resource list
            resourceList.on("click", "button", $.proxy(function (e) {
                var source = $(e.currentTarget);
                var itemIndex = parseInt(source.val());
                // store selected resource in editor state
                this.editorState.selectedItem = itemIndex;
                this.annotator.editor.submit();
            }, this));

            return field;
        };
    };

    $.extend(Annotator.Plugin.Neonion.prototype, new Annotator.Plugin(), {
        events: {
            beforeAnnotationCreated: "beforeAnnotationCreated",
            annotationEditorShown: "annotationEditorShown",
            annotationEditorHidden: "annotationEditorHidden",
            annotationEditorSubmit: "annotationEditorSubmit",
            annotationViewerTextField: "annotationViewerTextField"
        },

        annotationModes : {
            freeTextAnnotation : 1,
            semanticAnnotation : 2
        },

        options: {
            prefix: "/",
            agent: {
                email: "unknown@neonion.org"
            },
            urls: {
                search: "search"
            },
            paginationSize: 5
        },

        templates: {
            showMore: "<button data-action='annotator-more'>Show more results&nbsp;&#8230;</button>",
            spinner: "<span style='margin:5px;' class='fa fa-spinner fa-spin'></span>",
            noResults: "<div class='empty'>No results found.</div>",
            editorLine: "<div class='annotator-linie'></div>",
            searchItem : "<i class='fa fa-search'></i>",
            cancelItem : "<a href='#' data-action='annotator-cancel'><i class='fa fa-times-circle'></i></a>",
            submitItem : "<a href='#' data-action='annotator-submit'><i class='fa fa-check-circle'></i></a>",
            unknownItem : "<a href='#' data-action='annotator-submit'><i class='fa fa-question-circle'></i></a>",
            emptyAdder : "<button></button>"
        },

        /**
         * Enum annotator classes.
         * @enum {string}
         */
        classes: {
            visible: "annotator-hl",
            hide: "annotator-hl-filtered"
        },

        literals: {
            en: {
                search: "Search",
                searchText: "Search term",
                unknown: "Not identified",
                unknownResource: "Unknown resource",
                agent: "Creator"
            },
            de: {
                search: "Suchen",
                searchText: "Suchtext",
                unknown: "Unbekannt",
                unknownResource: "Unbekannte Ressource",
                agent: "Erfasser"
            }
        },

        oa: {
            motivation: {
                classifying: "oa:classifying",
                identifying: "oa:identifying",
                linking: "oa:linking",
                questioning: "oa:questioning"
            },
            types : {
                agent: {
                    person: "foaf:person",
                    software: "prov:SoftwareAgent"
                },
                document: {
                    text: "dctypes:Text"
                },
                content: {
                    contentAsText: "cnt:ContentAsText"
                },
                tag: {
                    tag: "oa:Tag",
                    semanticTag: "oa:SemanticTag"
                }
            }
        },

        annotationLayers: {
            unspecified: function (params) {
                return {
                    uri: params.uri,
                    limit: 999999
                };
            },
            private: function (params) {
                var query = Annotator.Plugin.Neonion.prototype.annotationLayers.unspecified(params);
                query["creator.email"] = params.agent.email;
                return query;
            },
            group: function (params) {
                var query = Annotator.Plugin.Neonion.prototype.annotationLayers.unspecified(params);
                if (params.hasOwnProperty("workspace")) {
                    // filter for workspace
                    query["permissions.read"] = params.workspace;
                }
                return query;
            }
        },


        /**
         * Called before an annotation is created.
         * @param annotation
         */
        beforeAnnotationCreated : function (annotation) {
            // add user to annotation
            annotation.creator = this.options.agent;
            annotation.oa = {
                annotatedBy: $.extend(this.options.agent, {type: this.oa.types.agent.person}),
                hasBody: {},
                hasTarget: {
                    type: this.oa.types.document.text
                }
            };

            // set type of body
            switch(this.editorState.annotationMode) {
                case this.annotationModes.semanticAnnotation:
                    annotation.oa.hasBody.type = this.oa.types.tag.semanticTag; break;
                case this.annotationModes.freeTextAnnotation:
                    annotation.oa.hasBody.type = this.oa.types.tag.tag; break;
            }

            // set permission according current workspace
            if (this.options.hasOwnProperty("workspace")) {
                // add permissions to annotation
                annotation.permissions = {
                    read: [this.options.workspace],
                    update: [this.options.workspace],
                    delete: [this.options.agent.email],
                    admin: [this.options.agent.email]
                };
            }
            //console.log(annotation);
        },

        annotationEditorShown: function(editor, annotation) {
            this.placeEditorBesidesAnnotation(annotation);

            if (annotation.hasOwnProperty("oa")) {
                // make visibility of fields depended from type of body
                switch (annotation.oa.hasBody.type) {
                    case this.oa.types.tag.tag:
                        $(this.fields.editor.freeTextField).show();
                        $(this.fields.editor.semanticAnnotationField).hide();
                        break;
                    case this.oa.types.tag.semanticTag:
                        $(this.fields.editor.freeTextField).hide();
                        $(this.fields.editor.semanticAnnotationField).show();
                }
            }
        },

        annotationEditorHidden: function() {
            // clear prior editor state
            this.editorState.selectedItem = -1;
            this.editorState.resultSet = [];
            this.editorState.selectedType = "";
        },

        annotationViewerTextField: function(field, annotation) {
            if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("hasBody") &&
                annotation.oa.hasBody.type == this.oa.types.tag.tag) {
                $(field).show();
            }
            else {
                $(field).hide();
            }
        },

        annotationEditorSubmit: function(editor, annotation) {
            // add context
            annotation.context = this.extractSurroundedContent(annotation);
        },

        /**
         * Restores annotations if an uri is provided
         */
        applyLayer : function (layer) {
            if (this.annotator.plugins.Store && this.options.hasOwnProperty("uri")) {
                var query = layer(this.options);
                this.annotator.plugins.Store.loadAnnotationsFromSearch(query);
            }
        },

        /**
         * Overrides the adder according provided types
         * @returns {*|jQuery|HTMLElement}
         */
        overrideAdder : function () {
            var adder = $(this.annotator.adder[0]);

            // catch submit event
            adder.on("click", "button", $.proxy(function (e) {
                var sender = $(e.target);
                if (sender.val()) {
                    // set selected type
                    this.editorState.selectedType = sender.val();
                }
                return true;
            }, this));
            return adder;
        },

        viewerLoadResourceField : function (field, annotation) {
            if (annotation.hasOwnProperty("rdf")) {
                var ref = annotation.rdf.hasOwnProperty('sameAs') ? annotation.rdf.sameAs : '#';
                var fieldValue = "<a href='" + ref + "' target='blank'>" + annotation.rdf.label + "</a>";
                var fieldCaption;
                if (this.compositor[annotation.rdf.typeof]) {
                    fieldCaption = this.compositor[annotation.rdf.typeof].label;
                }
                else {
                    fieldCaption = this.literals['en'].unknownResource;
                }
                field.innerHTML = fieldCaption + ":&nbsp;" + fieldValue;
                $(field).show();
            }
            else {
                $(field).hide();
            }
        },

        viewerLoadAgentField : function (field, annotation) {
            var userField = this.literals['en'].unknown;
            if (annotation.hasOwnProperty('oa')) {
                userField = annotation.oa.annotatedBy.email;
            }
            field.innerHTML = this.literals['en'].agent + ":&nbsp;" + userField;
        },

        loadEditorField : function (field, annotation) {
            // restore type from annotation if provided
            this.editorState.selectedType = annotation.hasOwnProperty('rdf') ? annotation.rdf.typeof : this.editorState.selectedType;

            $(field).show();
            $(field).find("#resource-search").val(annotation.quote);
            $(field).find("#resource-form").submit();
        },

        submitEditorField : function (field, annotation) {
            if (annotation.oa.hasBody.type == this.oa.types.tag.semanticTag) {
                // add rdf data
                annotation.rdf = {
                    typeof: this.editorState.selectedType,
                    label: annotation.quote
                };
                annotation.oa.motivatedBy = this.oa.motivation.classifying;

                // add extra semantic data from identified resource
                if (this.editorState.selectedItem > 0) {
                    var dataItem = this.editorState.resultSet[this.editorState.selectedItem];
                    annotation.rdf.sameAs = dataItem.uri + '';
                    annotation.rdf.label = dataItem.label;
                    annotation.oa.motivatedBy = this.oa.motivation.identifying;
                }
            }
        },

        updateResourceList : function(searchTerm) {
            var list = $(this.fields.editor.semanticAnnotationField).find("#resource-list");
            // replace list with spinner while loading
            list.html(this.templates.spinner);
            // lookup resource by search term
            this.search(this.editorState.selectedType, searchTerm,
                function (items) {
                    var formatter = this.formatter[this.editorState.selectedType] || this.formatter['default'];
                    // store last result set
                    this.editorState.resultSet = items;
                    // update score
                    this.updateScoreAccordingOccurrence(items);
                    // create and add items
                    list.empty();

                    if (items.length !== 0) {
                        list.append(this.createListItems(0, items, formatter));

                        // do we need pagination?
                        if (items.length > this.options.paginationSize) {
                            var idxOffset = this.options.paginationSize;
                            var btnLoadMore = $(this.templates.showMore);
                            list.append(btnLoadMore);

                            btnLoadMore.click($.proxy(function () {
                                list.append(this.createListItems(idxOffset, items, formatter));
                                idxOffset += this.options.paginationSize;

                                if (idxOffset < items.length) {
                                    // move button to end
                                    btnLoadMore.parent().append(btnLoadMore);
                                }
                                else {
                                    // hide button if all items are visible
                                    btnLoadMore.hide();
                                }
                                return false;
                            }, this));
                        }
                    } else {
                        list.append(this.templates.noResults);
                    }
                }
            );
        },

        placeEditorBesidesAnnotation: function (annotation) {
            var top = $(annotation.highlights[0]).position().top;
            var left = $(annotation.highlights[0]).position().left;
            var editor = $(this.annotator.editor.element[0]);
            var annotator = $(this.annotator.element[0]);
            var width = annotator.width();
            editor.css("top", top);
            editor.find(".annotator-linie").width(width - left + 378 + 108);
            editor.find(".annotator-linie").css("left", -(width - left + 108));
            $(annotation.highlights[0]).css("border-left", "1px solid #717171");
        },

        extractSurroundedContent: function (annotation) {
            var length = 200;
            var node, contentLeft = '', contentRight = '';
            // left
            node = annotation.highlights[0];
            while (node != this.element[0] && contentLeft.length < length) {
                if (node.previousSibling) {
                    node = node.previousSibling;
                    // prepend extracted text
                    contentLeft = $(node).text() + contentLeft;
                }
                else {
                    node = node.parentNode;
                }
            }

            // right
            node = annotation.highlights[annotation.highlights.length - 1];
            while (node != this.element[0] && contentRight.length < length) {
                if (node.nextSibling) {
                    node = node.nextSibling;
                    // append extracted text
                    contentRight += $(node).text();
                }
                else {
                    node = node.parentNode;
                }
            }
            // replace line feed with space
            contentLeft = contentLeft.replace(/(\r\n|\n|\r)/gm, " ");
            contentRight = contentRight.replace(/(\r\n|\n|\r)/gm, " ");

            var leftC = contentLeft.trimLeft().substr(-length);
            var rightC = contentRight.trimRight().substr(0, length);

            return {
                left: leftC.substring(leftC.indexOf(" ") + 1),
                right: rightC.substring(0, rightC.lastIndexOf(" "))
            };
        },

        applyAnnotationSets: function () {
            this.adder.html("");
            for (var uri in this.compositor) {
                if (this.compositor.hasOwnProperty(uri)) {
                    this.adder.append("<button value='" + uri + "'>" + this.compositor[uri].label + "</button>");
                }
            }
        },

        getAnnotationHighlights: function () {
            return $(".annotator-hl:not(.annotator-hl-temporary),." + Annotator.Plugin.Neonion.prototype.classes.hide);
        },

        showAnnotation: function (annotation) {
            annotation.highlights.forEach(function (entry) {
                entry.className = Annotator.Plugin.Neonion.prototype.classes.visible;
            });
        },

        hideAnnotation: function (annotation) {
            annotation.highlights.forEach(function (entry) {
                entry.className = Annotator.Plugin.Neonion.prototype.classes.hide;
                entry.style.backgroundColor = "";
            });
        },

        getContributors: function () {
            var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
            var constributors = [];
            highlights.each(function () {
                var annotation = $(this).data("annotation");
                var userId = annotation.creator.email;
                if (constributors.indexOf(userId) === -1) {
                    constributors.push(userId);
                }
            });
            return constributors;
        },

        getAnnotationObjects: function () {
            var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
            var annotations = [];
            highlights.each(function () {
                var annotation = $(this).data("annotation");
                annotations.push(annotation);
            });
            return annotations;
        },

        getUserAnnotations: function (userId) {
            var annotations = Annotator.Plugin.Neonion.prototype.getAnnotationObjects();
            return annotations.filter(function (element) {
                return element.creator.email == userId;
            });
        },

        getLastAnnotation: function (userId) {
            var annotations;
            if (userId) {
                annotations = Annotator.Plugin.Neonion.prototype.getUserAnnotations(userId);
            }
            else {
                annotations = Annotator.Plugin.Neonion.prototype.getAnnotationObjects();
            }
            if (annotations.length > 0) {
                annotations.sort(Annotator.Plugin.Neonion.prototype.comparator.compareByUpdated);
                return annotations[annotations.length - 1];
            }
            return null;
        },

        createListItems: function (offset, list, formatter) {
            list = list.slice(offset, offset + this.options.paginationSize);
            var items = [];
            for (var i = 0; i < list.length; i++) {
                var label = formatter(list[i]);
                items.push(
                    "<button type='button' class='' value='" + (offset + i) + "'>" +
                    label +
                    "<a class='pull-right' href='" + list[i].uri + "' target='blank'><i class='fa fa-external-link'></i></a>" +
                    "</button>"
                );
            }
            return items;
        },

        updateScoreAccordingOccurrence: function (items) {
            var highlights = this.getAnnotationHighlights();
            var occurrence = {};
            // count occurrence of each resource
            highlights.each(function () {
                var annotation = $(this).data("annotation");
                if (annotation.rdf && annotation.rdf.sameAs) {
                    if (!occurrence[annotation.rdf.sameAs]) {
                        occurrence[annotation.rdf.sameAs] = 0;
                    }
                    occurrence[annotation.rdf.sameAs]++;
                }
            });
            // calculate score
            for (var i = 0; i < items.length; i++) {
                var uri = items[i].uri;
                items[i].score = 1 + (1 - i / (items.length - 1));
                if (occurrence[uri]) {
                    items[i].score *= occurrence[uri] + 1;
                }
            }
            // sort by score 
            items.sort(function (a, b) {
                return b.score - a.score;
            });
            //console.log(items);
        },

        comparator: {
            compareByLabel: function (a, b) {
                return Annotator.Plugin.Neonion.prototype.comparator.compareByField("label", a, b);
            },
            compareByUpdated: function (a, b) {
                return Number(Date.parse(a.updated)) - Number(Date.parse(b.updated));
            },
            compareByField: function (field, a, b) {
                if (a[field] < b[field]) {
                    return -1;
                }
                else if (a[field] > b[field]) {
                    return 1;
                }
                return 0;
            }
        },

        formatter: {
            'default': function (value) {
                return "<span>" + value.label + "</span>";
            },
            'http://neonion.org/concept/person': function (value) {
                var label = value.label;
                if (value.birth) {
                    label += "<span>&nbsp;&#42;&nbsp;" + value.birth;
                    if (value.death) {
                        label += ",&nbsp;&#8224;&nbsp;" + value.death;
                    }
                    label += "</span>";
                }

                if (value.descr) {
                    label += "<br/><span>" + value.descr + "</span>";
                }
                return label;
            }
        },

        search: function (type, searchText, callback) {
            var url = this.options.prefix + this.options.urls.search + "?";
            url += 'type=' + encodeURI(type) + '&q=' + encodeURI(searchText);
            $.getJSON(url, $.proxy(callback, this));
        }
    });

})();
