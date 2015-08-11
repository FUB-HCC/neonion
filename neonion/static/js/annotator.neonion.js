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
        this.conceptSet = function (concepts) {
            if (concepts) {
                this.concepts = concepts;
                if (this.editorState.annotationMode == this.annotationModes.conceptTagging) {
                    // apply if annotation mode equals concept tagging
                    this.helper.applyConceptSet(this.conceptSet(), this.adder);
                }
            }
            return this.concepts;
        };

        this.annotationMode = function (mode) {
            if (mode && $.isNumeric(mode)) {
                this.editorState.annotationMode = mode;
                switch (mode) {
                    case this.annotationModes.conceptTagging:
                        this.helper.applyConceptSet(this.conceptSet(), this.adder);
                        break;
                    default:
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
                annotationMode: this.options.annotationMode,
                selectedConcept: "",
                selectedItem: -1,
                resultSet: []
            };

            // create compositor from provided annotation sets
            if (this.options.hasOwnProperty("conceptSet")) {
                this.concepts = this.options["conceptSet"];
            }
            else {
                this.concepts = [];
            }

            // bind events on document
            $(document).bind({
                mouseup: $.proxy(function () {
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

            // activate additional widgets
            if (this.options.hasOwnProperty("activateWidgets")) {
                for(var i = 0; i < this.options.activateWidgets.length; i++) {
                    var widget = this.options.activateWidgets[i];
                    if (this.widgets.hasOwnProperty(widget)) {
                        // instantiate widget
                        (new this.widgets[widget](this, options)).load();
                    }
                }
            }

            // closure
            this.conceptSet(this.conceptSet());
            this.applyLayer(this.annotationLayers.group);
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
                commentField: this.initCommentField(),
                conceptTaggingField: this.initConceptTaggingField()
            };
        };

        this.initCommentField = function () {
            var field = this.annotator.editor.fields[0].element;
            // add controls submit and cancel buttons
            $(field).append(
                "<div class='resource-controls'>" + this.templates.submitItem + this.templates.cancelItem + "</div>");

            return field;
        };

        this.initConceptTaggingField = function () {
            // add field containing the suggested resources
            var field = this.annotator.editor.addField({
                load: $.proxy(this.loadEditorConceptField, this),
                submit: $.proxy(this.submitEditorConceptField, this)
            });

            // replace filed with custom content
            $(field).children((":first")).replaceWith(
                "<div class='resource-controls'>" + this.templates.cancelItem + "</div>" +
                "<form id='resource-form'>" + this.templates.searchItem + "</form>" +
                "<div id='resource-list'>" + this.templates.unknownItem + "</div>"
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
                itemIndex = !isNaN(itemIndex) ? itemIndex : -1;
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
            annotationViewerShown: "annotationViewerShown",
            annotationViewerTextField: "annotationViewerTextField",
            linkedAnnotationCreated: "linkedAnnotationCreated",
            linkedAnnotationDeleted: "linkedAnnotationDeleted"
        },

        annotationModes: {
            commenting: 1,
            highlighting: 2,
            conceptTagging: 3
        },

        options: {
            prefix: "/api/es/",
            agent: {
                email: "unknown@neonion.org"
            },
            urls: {
                search: "search"
            },
            paginationSize: 5,
            annotationMode : 1, // commenting
            activateWidgets : ['storeContext', 'viewerSummarizeStatements', 'viewerCreateProperty']
        },

        /**
         * Object to inject custom methods.
         */
        widgets : {},

        templates: {
            showMore: "<button class='more' data-action='annotator-more'>Show more results&nbsp;&#8230;</button>",
            spinner: "<span style='margin:5px;' class='fa fa-spinner fa-spin'></span>",
            noResults: "<div class='empty'>No results found.</div>",
            editorLine: "<div class='annotator-line'></div>",
            searchItem: "<i class='fa fa-search'></i>",
            cancelItem: "<a data-action='annotator-cancel'><i class='fa fa-times fa-fw'></i></a>",
            submitItem: "<a data-action='annotator-submit'><i class='fa fa-check fa-fw'></i></a>",
            unknownItem: "<button type='button' class='unknown' data-action='annotator-submit'>Unknown Resource</button>",
            emptyAdder: "<button></button>"
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
                agent: "Creator"
            },
            de: {
                search: "Suchen",
                searchText: "Suchtext",
                unknown: "Unbekannt",
                agent: "Erfasser"
            }
        },

        oa: {
            motivation: {
                commenting: "oa:commenting",
                highlighting: "oa:highlighting",
                classifying: "oa:classifying",
                identifying: "oa:identifying",
                linking: "oa:linking",
                questioning: "oa:questioning"
            },
            types: {
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
                query["oa.annotatedBy.email"] = params.agent.email;
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
         *
         * @param annotationSubject
         * @param predicate
         * @param annotationObject
         * @returns {{ranges: Array, oa: {annotatedBy, motivatedBy: string, hasBody: {type: string}, hasTarget: {source: *, target: string}}}}
         */
        createLinkedAnnotation : function(annotationSubject, predicate, annotationObject) {
            var linkage = {
                ranges: [], // empty but necessary
                oa : {
                    motivatedBy: this.oa.motivation.linking,
                    annotatedBy: $.extend(this.options.agent, {type: this.oa.types.agent.person}),
                    hasBody: {
                        rdf : {
                            subject: this.helper.getSemanticTag(annotationSubject).uri,
                            predicate: predicate.uri,
                            predicateLabel: predicate.label,
                            object: this.helper.getSemanticTag(annotationObject).uri
                        },
                        type: this.oa.types.tag.semanticTag
                    },
                    hasTarget: {
                        source : annotationSubject.id,
                        target : annotationObject.id
                    }
                }
            };
            this.applyPermissions(linkage);

            // publish linked annotation was created
            this.annotator.publish("linkedAnnotationCreated", [linkage]);

            return linkage;
        },

        deleteLinkedAnnotation : function(annotation) {
            this.annotator.deleteAnnotation(annotation);
            this.annotator.publish("linkedAnnotationDeleted", [annotation]);
        },

        /**
         * Sets then permissions according current workspace
         * @param annotation
         */
        applyPermissions : function(annotation) {
            if (this.options.hasOwnProperty("workspace")) {
                // add permissions to annotation
                annotation.permissions = {
                    read: [this.options.workspace],
                    update: [this.options.workspace],
                    delete: [this.options.agent.email],
                    admin: [this.options.agent.email]
                };
            }
        },

        linkedAnnotationCreated : function(annotation) {
            if (this.annotator.plugins.Store) {
                // store annotation
                this.annotator.plugins.Store.annotationCreated(annotation);
            }
        },

        linkedAnnotationDeleted : function(annotation) {

        },

        /**
         * Called before an annotation is created.
         * @param annotation
         */
        beforeAnnotationCreated: function (annotation) {
            // create a child element to store Open Annotation data
            annotation.oa = {
                annotatedBy: $.extend(this.options.agent, {type: this.oa.types.agent.person}),
                hasTarget: {
                    type: this.oa.types.document.text
                }
            };

            // prepare annotation according current annotation mode
            switch (this.editorState.annotationMode) {
                case this.annotationModes.conceptTagging:
                    annotation.oa.motivatedBy = this.oa.motivation.classifying;
                    annotation.oa.hasBody = {type: this.oa.types.tag.semanticTag};
                    annotation.rdf = {
                        typeof: this.editorState.selectedConcept,
                        conceptLabel: this.getConcept(this.editorState.selectedConcept).label
                    };
                    break;
                case this.annotationModes.commenting:
                    annotation.oa.motivatedBy = this.oa.motivation.commenting;
                    annotation.oa.hasBody = {type: this.oa.types.document.text};
                    break;
                case this.annotationModes.highlighting:
                    annotation.oa.motivatedBy = this.oa.motivation.highlighting;
                    break;
            }

            this.applyPermissions(annotation);
        },

        annotationEditorShown: function (editor, annotation) {
            if (annotation.hasOwnProperty("oa")) {
                // visibility of fields depends on the motivation
                switch (annotation.oa.motivatedBy) {
                    case this.oa.motivation.commenting:
                        this.showEditorField(this.fields.editor.commentField);
                        // check if the annotation has no comment yet
                        if (!annotation.hasOwnProperty("text")) {
                            // transfer quote to text area and preselect the content
                            $(this.fields.editor.commentField)
                                .find("textarea")
                                .val(annotation.quote)
                                .select();
                        }
                        break;
                    case this.oa.motivation.highlighting:
                        // submit editor automatically
                        editor.submit();
                        break;
                    case this.oa.motivation.classifying:
                    case this.oa.motivation.identifying:
                        var concept = this.getConcept(this.helper.getSemanticTag(annotation).typeof);
                        if (concept && this.helper.conceptHasReferrals(concept)) {
                            this.showEditorField(this.fields.editor.conceptTaggingField);
                            // focus search field
                            $(this.fields.editor.conceptTaggingField).find("#resource-search").focus();
                        }
                        else {
                            // submit editor automatically if there is to search
                            editor.submit();
                        }
                        break;
                }
            }

            this.helper.placeEditorBesidesAnnotation(annotation, this.annotator);
        },

        annotationEditorHidden: function () {
            // clear prior editor state
            this.editorState.selectedItem = -1;
            this.editorState.resultSet = [];
            this.editorState.selectedConcept = "";
        },

        annotationViewerShown: function (viewer, annotations) {
            if (this.helper.getMotivationEquals(annotations[0], this.oa.motivation.highlighting)) {
                $(viewer.element).find(".annotator-edit").hide();
            }
            else {
                $(viewer.element).find(".annotator-edit").show();
            }
        },

        annotationViewerTextField: function (field, annotation) {
            if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("hasBody") &&
                annotation.oa.hasBody.type == this.oa.types.document.text) {
                $(field).show();
            }
            else {
                $(field).hide();
            }
        },

        annotationEditorSubmit: function (editor, annotation) {
            // TODO add OA start and end position to target
        },

        /**
         * Restores annotations if an uri is provided.
         */
        applyLayer: function (layer) {
            if (this.annotator.plugins.Store && this.options.hasOwnProperty("uri")) {
                var query = layer(this.options);
                this.annotator.plugins.Store.loadAnnotationsFromSearch(query);
            }
        },

        /**
         * Shows the specified field and hides the other ones.
         * @param field
         */
        showEditorField: function (field) {
            // hide all fields first
            for (var key in this.fields.editor) {
                $(this.fields.editor[key]).hide();
            }
            // show specified field
            if (field) {
                $(field).show();
            }
        },

        /**
         * Overrides the adder according provided types
         * @returns {*|jQuery|HTMLElement}
         */
        overrideAdder: function () {
            var adder = $(this.annotator.adder[0]);

            // catch submit event
            adder.on("click", "button", $.proxy(function (e) {
                var sender = $(e.target);
                if (sender.val()) {
                    // set selected type
                    this.editorState.selectedConcept = sender.val();
                }
                return true;
            }, this));
            return adder;
        },

        viewerLoadResourceField: function (field, annotation) {
            if (this.helper.getMotivationEquals(annotation, this.oa.motivation.classifying) ||
                this.helper.getMotivationEquals(annotation, this.oa.motivation.identifying)) {
                var semanticTag = this.helper.getSemanticTag(annotation);
                var ref = semanticTag.hasOwnProperty('sameAs') ? semanticTag.sameAs : '#';
                var fieldValue = "<a href='" + ref + "' target='blank'>" + semanticTag.label + "</a>";
                var fieldCaption = '';
                if (semanticTag.hasOwnProperty('conceptLabel')) {
                    fieldCaption = semanticTag.conceptLabel + ":&nbsp;";
                }
                field.innerHTML = fieldCaption + fieldValue;
                $(field).show();
            }
            else {
                $(field).hide();
            }
        },

        viewerLoadAgentField: function (field, annotation) {
            var userField = this.literals['en'].unknown;
            if (annotation.hasOwnProperty('oa') && annotation.oa.hasOwnProperty('annotatedBy')) {
                userField = annotation.oa.annotatedBy.email;
            }
            field.innerHTML = this.literals['en'].agent + ":&nbsp;" + userField;
        },

        loadEditorConceptField: function (field, annotation) {
            if (this.helper.getMotivationEquals(annotation, this.oa.motivation.classifying) ||
                this.helper.getMotivationEquals(annotation, this.oa.motivation.identifying)) {
                $(field).show();
                $(field).find("#resource-search").val(annotation.quote);
                $(field).find("#resource-search").attr("autofocus", "autofocus");
                $(field).find("#resource-form").submit();
            }
        },

        submitEditorConceptField: function (field, annotation) {
            if (this.helper.getMotivationEquals(annotation, this.oa.motivation.classifying) ||
                this.helper.getMotivationEquals(annotation, this.oa.motivation.identifying)) {
                if (annotation.oa.hasBody.type == this.oa.types.tag.semanticTag) {
                    // add extra semantic data from identified resource
                    var semanticTag = this.helper.getSemanticTag(annotation);
                    if (this.editorState.selectedItem >= 0 && this.editorState.selectedItem < this.editorState.resultSet.length) {
                        var dataItem = this.editorState.resultSet[this.editorState.selectedItem];
                        semanticTag.sameAs = dataItem.uri + '';
                        semanticTag.label = dataItem.label;
                        annotation.oa.motivatedBy = this.oa.motivation.identifying;
                    }
                    else {
                        semanticTag.label = annotation.quote;
                        annotation.oa.motivatedBy = this.oa.motivation.classifying;
                    }
                }
            }
        },

        /**
         * Returns the concept object of the given concept identifier.
         * @param concept
         * @returns {*}
         */
        getConcept : function(concept) {
            for(var i = 0; i < this.concepts.length; i++) {
                if (this.concepts[i].uri == concept) {
                    return this.concepts[i];
                }
            }
            return null;
        },

        /**
         * Returns a list containing all annotation objects.
         * Note: Only annotations with visible highlights are returned. Mo linked annotations.
         * @returns {Array.<T>}
         */
        getAnnotations: function () {
            var annotations = Array.prototype.slice.call(
                document.querySelectorAll(".annotator-hl:not(.annotator-hl-temporary),." +
                Annotator.Plugin.Neonion.prototype.classes.hide))
                .map(function (highlight) {
                    return $(highlight).data("annotation");
                });
            var unique = {};
            return annotations.filter(function(annotation) {
                if (!unique.hasOwnProperty(annotation.id)) {
                    unique[annotation.id] = true;
                    return true;
                }
                return false;
            });
        },

        /**
         * Returns a list of annotations matching the given concepts.
         * @param concepts
         * @returns {Array.<T>}
         */
        getAnnotationsMatchingConcepts: function (concepts) {
            concepts = concepts.map(function (concept) {
                return concept.uri;
            });

            return this.getAnnotations()
                .filter($.proxy(function (annotation) {
                    if (this.helper.getMotivationEquals(annotation, this.oa.motivation.classifying) ||
                        this.helper.getMotivationEquals(annotation, this.oa.motivation.identifying)) {
                        return concepts.indexOf(this.helper.getSemanticTag(annotation).typeof) != -1;
                    }
                    return false;
                }, this));
        },

        /**
         * Groups the annotation object by the given property
         * @param annotations
         * @returns {{}}
         */
        groupAnnotationBy : function(annotations, condition) {
            var grouped = {};
            annotations.map(function(annotation) {
                var value = condition(annotation);
                if (!grouped.hasOwnProperty(value)) {
                    grouped[value] = [];
                }
                grouped[value].push(annotation);
            });
            return grouped;
        },

        /**
         * Creates the list containing the suggested resources.
         * @param searchTerm
         */
        updateResourceList: function (searchTerm) {
            var list = $(this.fields.editor.conceptTaggingField).find("#resource-list");
            var concept = this.getConcept(this.helper.getSemanticTag(this.annotator.editor.annotation).typeof);

            // replace list with spinner while loading
            list.html(this.templates.spinner);

            // check if the concept is connected to concepts from a knowledge provider
            if (concept && this.helper.conceptHasReferrals(concept)) {
                var indexName = this.helper.getIndexName(concept.linked_concepts[0].endpoint);
                // lookup resource by search term and provided index
                this.search(concept.id, searchTerm, indexName)
                    .done($.proxy(function (items) {
                        var formatter = this.formatter[concept.uri] || this.formatter['default'];
                        // store last result set
                        this.editorState.resultSet = items;
                        // update score
                        this.updateScoreAccordingOccurrence(items);
                        // create and add items
                        list.empty();

                        if (items.length !== 0) {
                            list.append(this.helper.createListItems(0, items, this.options.paginationSize, formatter));

                            // do we need pagination?
                            if (items.length > this.options.paginationSize) {
                                var idxOffset = this.options.paginationSize;
                                var btnLoadMore = $(this.templates.showMore);
                                list.append(btnLoadMore);

                                btnLoadMore.click($.proxy(function () {
                                    list.append(this.helper.createListItems(idxOffset, items, this.options.paginationSize, formatter));
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
                        list.prepend(this.templates.unknownItem);
                    }, this))
                    .fail($.proxy(function () {
                        list.html(this.templates.unknownItem);
                    }, this));
            }
        },

        search: function (type, searchText, index) {
            var url = this.options.prefix + this.options.urls.search +
                "/" + encodeURI(index) + "/" + encodeURI(type) + "/" + encodeURI(searchText);
            return $.getJSON(url);
        },

        updateScoreAccordingOccurrence: function (items) {
            var annotations = this.getAnnotations();
            var occurrence = {};
            // count occurrence of each resource
            for (var i = 0; i < annotations.length; i++) {
                var semanticTag = this.helper.getSemanticTag(annotations[i]);
                if (semanticTag && semanticTag.hasOwnProperty("sameAs")) {
                    if (!occurrence[semanticTag.sameAs]) {
                        occurrence[semanticTag.sameAs] = 0;
                    }
                    occurrence[semanticTag.sameAs]++;
                }
            }
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
        },

        helper: {

            /**
             * Returns the RDF object associated with the semantic tag.
             * @param annotation
             * @returns {*}
             */
            getSemanticTag: function (annotation) {
                switch (annotation.oa.motivatedBy) {
                    case Annotator.Plugin.Neonion.prototype.oa.motivation.classifying:
                    case Annotator.Plugin.Neonion.prototype.oa.motivation.identifying:
                        return annotation.rdf;
                    case Annotator.Plugin.Neonion.prototype.oa.motivation.linking:
                        return annotation.oa.hasBody.rdf;
                    default:
                        return null;
                }
            },

            /**
             * Indicates whether the given concept provides a search for referrals.
             * @param concept
             * @returns {boolean}
             */
            conceptHasReferrals : function(concept) {
                return concept.hasOwnProperty('linked_concepts') && concept.linked_concepts.length > 0;
            },

            /**
             * Extracts the name of the index from the given endpoint URL
             * @param endpoint
             */
            getIndexName : function(endpoint) {
                // TODO rethink that
                var element = document.createElement('a');
                element.href = endpoint;
                return element.hostname.split('.')[1];
            },

            /**
             * Returns true if the annotation has the given motivation.
             * @param annotation
             * @param motivation
             * @returns {boolean}
             */
            getMotivationEquals : function(annotation, motivation) {
                if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("motivatedBy")) {
                    return annotation.oa.motivatedBy == motivation;
                }
                return false;
            },

            isLinkedAnnotation: function(annotation) {
                if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("motivatedBy")) {
                    return annotation.oa.motivatedBy == Annotator.Plugin.Neonion.prototype.oa.motivation.linking;
                }
                return false;
            },

            /**
             * Creates the adder according the provided concepts.
             * @param concepts
             * @param adder
             */
            applyConceptSet: function (concepts, adder) {
                adder.html("");
                for (var i = 0; i < concepts.length; i++) {
                    adder.append("<button value='" + concepts[i].uri + "'>" + concepts[i].label + "</button>");
                }
            },

            /**
             * Creates a list of item according pagination and formatter.
             * @param offset
             * @param list
             * @param pageSize
             * @param formatter
             * @returns {Array}
             */
            createListItems: function (offset, list, pageSize, formatter) {
                list = list.slice(offset, offset + pageSize);
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

            placeEditorBesidesAnnotation: function (annotation, annotator) {
                var editor = $(annotator.editor.element[0]);
                if (annotation.highlights.length > 0) {
                    var annotatorRect = annotator.editor.element[0].getBoundingClientRect();
                    annotator = $(annotator.element[0]);
                    // place line vertically
                    var top = $(annotation.highlights[0]).position().top;
                    editor.css("top", top);

                    // place line horizontally
                    var clientRects = annotation.highlights[0].getClientRects();
                    var width = annotatorRect.left - clientRects[0].left;
                    editor.find(".annotator-line").width(width);
                    editor.find(".annotator-line").height(clientRects[0].height);
                    editor.find(".annotator-line").css("left", -width);
                    editor.find(".annotator-line").show();
                }
                else {
                    editor.find(".annotator-line").hide();
                }
            }
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
            }
        }

    });

})();
