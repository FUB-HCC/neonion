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
    Annotator.Plugin.neonion = function (element, options) {

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
            this.linkedAnnotations = [];
            this.adder = this.overrideAdder();
            this.fields = {
                viewer: this.initViewerField(),
                editor: this.initEditorField()
            };

            this.editorState = {
                annotationMode: this.options.annotationMode,
                selectedConcept: ""
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

            // attach handler to hide editor
            $("[data-action=annotator-cancel]").on("click", $.proxy(function () {
                this.annotator.editor.hide();
            }, this));

            // attach handler to submit editor
            $("[data-action=annotator-submit]").on("click", $.proxy(function () {
                this.annotator.editor.submit();
            }, this));

            // closure
            this.conceptSet(this.conceptSet());
            this.applyLayer(this.annotationLayers.space);
        };

        /**
         * Creates additional fields in viewer
         * @returns {{resource: *, agent: *}}
         */
        this.initViewerField = function () {
            return {
                // get comment field
                comment: this.annotator.viewer.fields[0].element,
                // add field to linked entity
                entity: this.annotator.viewer.addField({
                    load: $.proxy(this.viewerLoadEntityField, this)
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
            $(".annotator-editor").append(this.templates.editorLine);
            // create a mapping from motivation to editor field
            var mapping = {};
            mapping[this.oa.motivation.commenting] = this.initCommentField();
            return mapping;
        };

        this.initCommentField = function () {
            var field = this.annotator.editor.fields[0].element;
            // add controls submit and cancel buttons
            $(field).append(
                "<div class='resource-controls'>" + this.templates.submitItem + this.templates.cancelItem + "</div>");

            return field;
        };

    };

    $.extend(Annotator.Plugin.neonion.prototype, new Annotator.Plugin(), {
        events: {
            beforeAnnotationCreated: "beforeAnnotationCreated",
            annotationUpdated: "annotationUpdated",
            annotationDeleted: "annotationDeleted",
            annotationsLoaded: "annotationsLoaded",
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
            conceptTagging: 3,
            tagging: 4
        },

        options: {
            annotationMode : 1, // commenting
            activateWidgets : [
                'entityLinking',
                'contextInformation', 
                'visualizeRelationship',
                'viewerSummarizeStatements', 
                'pointAndLightRelations'
            ],            
            lookup: {
                prefix: "/api/es/",
                urls: {
                    search: "search"
                }            
            }
        },

        /**
         * Object to inject custom features.
         */
        widgets : {},

        templates: {
            editorLine: "<div class='annotator-line'></div>",
            searchItem: "<i class='fa fa-search'></i>",
            cancelItem: "<a data-action='annotator-cancel'><i class='fa fa-times fa-fw'></i></a>",
            submitItem: "<a data-action='annotator-submit'><i class='fa fa-check fa-fw'></i></a>",
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
            }
        },

        oa: {
            motivation: {
                commenting: "oa:commenting",
                highlighting: "oa:highlighting",
                classifying: "oa:classifying",
                identifying: "oa:identifying",
                linking: "oa:linking",
                tagging: "oa:tagging"
            },
            stubs: {
                // basic stub for the embedded OA representation
                createBaseStub: function() {
                    return { 
                        "@type": "oa:Annotation",
                        "annotatedAt": new Date().toISOString(),
                        "annotatedBy": { "@type": "foaf:person" },
                        "hasTarget": {
                            "@type": "oa:SpecificResource",
                            "hasSelector": { 
                                "@type": "oa:FragmentSelector"
                            },
                            "hasSource": { "@type": "dctypes:Text" }
                        }
                    }   
                },
                // stub representing a highlight
                createHighlightAnnotationStub: function() {
                    return $.extend(true, Annotator.Plugin.neonion.prototype.oa.stubs.createBaseStub(),
                        {
                            "motivatedBy": "oa:highlighting"
                        });
                },
                // stub representing a comment
                createCommentAnnotationStub: function() {
                    return $.extend(true, Annotator.Plugin.neonion.prototype.oa.stubs.createHighlightAnnotationStub(),
                        {
                            "motivatedBy": "oa:commenting",
                            "hasBody": {
                                "@type": ["dctypes:Text", "cnt:ContentAsText"],
                                "chars": ""
                            }
                        });
                },
                // stub representing a tag
                createTagAnnotationStub: function() {
                    return $.extend(true, Annotator.Plugin.neonion.prototype.oa.stubs.createBaseStub(),
                        {
                            "motivatedBy": "oa:tagging",
                            "hasBody": {
                                "@type": ["oa:Tag", "cnt:ContentAsText"],
                                "chars": ""
                            }
                        });
                },
                // stub representing an instance
                createInstanceAnnotationStub: function() {
                    return $.extend(true, Annotator.Plugin.neonion.prototype.oa.stubs.createBaseStub(),
                        {
                            "motivatedBy": "oa:classifying",
                            "hasBody": {
                                "@type": ["oa:SemanticTag", "neo:EntityMention"],
                                "contextualizedAs": "",
                                "classifiedAs": ""
                            }
                        });
                },
                // stub representing a relation
                createLinkedAnnotationStub: function() {
                    return $.extend(true, Annotator.Plugin.neonion.prototype.oa.stubs.createBaseStub(),
                        {
                            "motivatedBy": "oa:linking",
                            "hasBody": {
                                "@type": ["oa:SemanticTag", "neo:RelationMention"],
                            },
                            "hasTarget": {
                                "hasSelector": { 
                                    "@type": "neo:SourceTargetSelector",
                                    "source": "",
                                    "target": ""
                                }
                            }
                        });
                }
            }                
        },

        annotationLayers: {
            unspecified: function (params) {
                return {
                    uri: params.uri,
                    limit: 999
                };
            },
            space: function (params) {
                var query = {};
                if (params.hasOwnProperty("workspace")) {
                    // filter for workspace
                    query["permissions.read"] = params.workspace;
                }
                return $.extend(true, Annotator.Plugin.neonion.prototype.annotationLayers.unspecified(params), query);
            }
        },

        /**
         * Creates a linked annotation and returns it.
         * @param annotationSubject
         * @param predicate
         * @param annotationObject
         * @returns {{ranges: Array, oa: {motivatedBy: string, hasBody: {type: string}, hasTarget: {source: *, target: string}}}}
         */
        createLinkedAnnotation : function(annotationSource, predicate, annotationTarget) {
            var linkage = {
                ranges: [], // empty but necessary
                neonion: {
                    viewer : {
                        source: annotationSource['oa']['hasBody']['contextualizedAs'],
                        predicate: predicate['uri'],
                        predicateLabel: predicate['label'],
                        target: annotationTarget['oa']['hasBody']['contextualizedAs']
                    },
                },
                oa : this.oa.stubs.createLinkedAnnotationStub()
            };

            // set type of relation
            linkage['oa']['hasBody']['relation'] = predicate['uri'];
            // set source and target of selector
            linkage['oa']['hasTarget']['hasSelector']['source'] = annotationSource['oa']['@id'];
            linkage['oa']['hasTarget']['hasSelector']['target'] = annotationTarget['oa']['@id'];
        
            // publish linked annotation was created
            this.annotator.publish("linkedAnnotationCreated", [linkage]);

            return linkage;
        },

        deleteLinkedAnnotation : function(annotation) {
            this.annotator.deleteAnnotation(annotation);
            this.annotator.publish("linkedAnnotationDeleted", [annotation]);
        },

        linkedAnnotationCreated : function(annotation) {
            this.linkedAnnotations.push(annotation);
            if (this.annotator.plugins.Store) {
                // store annotation
                this.annotator.plugins.Store.annotationCreated(annotation);
            }
        },

        linkedAnnotationDeleted : function(annotation) {
            var annotationIdx = this.linkedAnnotations.indexOf(annotation);
            this.linkedAnnotations.splice(annotationIdx, 1);
        },

        /**
         * Called before an annotation is created.
         * @param annotation
         */
        beforeAnnotationCreated: function (annotation) {
            // neonion specific sub-field
            annotation['neonion'] = {};

            // prepare annotation according current annotation mode
            switch (this.editorState.annotationMode) {
                case this.annotationModes.conceptTagging:
                    annotation['oa'] = this.oa.stubs.createInstanceAnnotationStub();
                    annotation['oa']['hasBody']['classifiedAs'] = this.editorState.selectedConcept;
                    annotation['neonion']['viewer'] = {
                        conceptLabel: this.getConceptDefinition(this.editorState.selectedConcept)['label']
                    };
                    break;
                case this.annotationModes.commenting:
                    annotation['oa'] = this.oa.stubs.createCommentAnnotationStub();
                    break;
                case this.annotationModes.tagging:
                    annotation['oa'] = this.oa.stubs.createTagAnnotationStub();
                    break;
                case this.annotationModes.highlighting:
                    annotation['oa'] = this.oa.stubs.createHighlightAnnotationStub();
                    break;
            }
        },

        /**
        * Raised when an annotation was deleted.
        */
        annotationDeleted: function(annotation) {
            if (this.helper.getMotivationEquals(annotation, this.oa.motivation.classifying) ||
                this.helper.getMotivationEquals(annotation, this.oa.motivation.identifying)) {
                // delete all linked annotations that references the deleted annotation
                this.linkedAnnotations
                    .filter(function(linkage) {
                        // check if the linkage references the annotation in the target
                        return linkage['oa']['hasTarget']['hasSelector']['source'] == annotation['oa']['@id'] ||
                            linkage['oa']['hasTarget']['hasSelector']['target'] == annotation['oa']['@id'];
                    })
                    .forEach($.proxy(this.deleteLinkedAnnotation, this));
            }
        },

        /**
        * Raised when an annotation was updated.
        */
        annotationUpdated: function(annotation) {
            if (this.helper.getMotivationEquals(annotation, this.oa.motivation.classifying) ||
                this.helper.getMotivationEquals(annotation, this.oa.motivation.identifying)) {
                // update all linked annotations that references the annotation
                /*this.linkedAnnotations
                    .filter(function(linkage) {
                        // check if the linkage references the annotation in the target
                        return linkage['oa']['hasTarget']['hasSelector']['source'] == annotation['oa']['@id'] ||
                            linkage['oa']['hasTarget']['target'] == annotation['oa']['@id'];
                    })
                    .forEach($.proxy(function(linkage) {
                        // update the statement
                        if (linkage['oa']['hasTarget']['hasSelector']['source'] == annotation['oa']['@id']) {
                            //this.helper.getSemanticTag(linkage).subject = this.helper.getSemanticTag(annotation).uri;
                        }
                        else if (linkage.oa.hasTarget.object == annotation['oa']['@id']) {
                            //this.helper.getSemanticTag(linkage).object = this.helper.getSemanticTag(annotation).uri;
                        }
                        this.annotator.publish("linkedAnnotationUpdated", [linkage]);
                    }), this); */ 
            }
        },

        /**
        * Raised when annotations are loaded from store.
        */
        annotationsLoaded: function(annotations) {
            // filter for linked annotations
            this.linkedAnnotations = this.linkedAnnotations.concat(annotations.filter(this.helper.isLinkedAnnotation));
        },

        annotationEditorShown: function (editor, annotation) {
            if (annotation.hasOwnProperty("oa") &&
                this.fields.editor.hasOwnProperty(annotation['oa']['motivatedBy'])) {
                var field = this.fields.editor[annotation['oa']['motivatedBy']];
                // visibility of fields depends on the motivation
                switch (annotation['oa']['motivatedBy']) {
                    case this.oa.motivation.commenting:
                        // check if the annotation has no comment yet
                        if (!annotation.hasOwnProperty("text")) {
                            // transfer quote to text area and preselect the content
                            $(field)
                                .find("textarea")
                                .val(annotation.quote)
                                .select();
                        }
                        break;
                }
                this.showEditorField(field);
                this.helper.placeEditorBesidesAnnotation(annotation, this.annotator);    
            }
            else {
                editor.submit();
            }
        },

        annotationEditorHidden: function () {
            // clear editor state
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
            if (annotation.hasOwnProperty("text") && annotation["text"].length > 0) {
                $(field).show();
            }
            else {
                $(field).hide();
            }
        },

        annotationEditorSubmit: function (editor, annotation) {
            if (annotation.hasOwnProperty("oa")) {
                switch (annotation['oa']['motivatedBy']) {
                    case this.oa.motivation.commenting:
                        // add comment to body
                        annotation['oa']['hasBody']['chars'] = annotation['text'];
                        break;
                    case this.oa.motivation.classifying:
                    case this.oa.motivation.identifying:
                        if (!annotation['oa']['hasBody'].hasOwnProperty('label')) {
                            annotation['oa']['hasBody']['label'] = annotation.quote;    
                        }
                        break;
                }
            }
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

        viewerLoadEntityField: function (field, annotation) {
            if (this.helper.getMotivationEquals(annotation, this.oa.motivation.classifying) ||
                this.helper.getMotivationEquals(annotation, this.oa.motivation.identifying)) {
                var fieldValue = annotation['oa']['hasBody']['label'];
                if (annotation['oa']['hasBody'].hasOwnProperty('identifiedAs')) {
                    fieldValue = "<a class='link' href='" + annotation['oa']['hasBody']['identifiedAs'] + 
                        "' target='_blank'>" + annotation['oa']['hasBody']['label'] + "</a>";
                }
                var fieldCaption = annotation['neonion']['viewer']['conceptLabel'] + ":&nbsp;";
                field.innerHTML = fieldCaption + fieldValue;
                $(field).show();
            }
            else {
                $(field).hide();
            }
        },

        viewerLoadAgentField: function (field, annotation) {
            var userField = this.literals['en'].unknown;
            if (annotation.hasOwnProperty('neonion') && annotation['neonion'].hasOwnProperty('creator')) {
                userField = annotation['neonion']['creator'];
            }
            field.innerHTML = this.literals['en'].agent + ":&nbsp;" + userField;
        },

        /**
         * Returns the concept object of the given concept identifier.
         * @param concept
         * @returns {*}
         */
        getConceptDefinition : function(concept) {
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
                Annotator.Plugin.neonion.prototype.classes.hide))
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
                        return concepts.indexOf(annotation['oa']['hasBody']['classifiedAs']) != -1;
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

        helper: {

            /**
             * Returns true if the annotation has the given motivation.
             * @param annotation
             * @param motivation
             * @returns {boolean}
             */
            getMotivationEquals : function(annotation, motivation) {
                if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("motivatedBy")) {
                    return annotation['oa']['motivatedBy'] == motivation;
                }
                return false;
            },

            isLinkedAnnotation: function(annotation) {
                if (annotation.hasOwnProperty("oa") && annotation.oa.hasOwnProperty("motivatedBy")) {
                    return annotation['oa']['motivatedBy'] == Annotator.Plugin.neonion.prototype.oa.motivation.linking;
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

            placeEditorBesidesAnnotation: function (annotation, annotator) {
                var editor = $(annotator.editor.element[0]);
                if (annotation.highlights.length > 0) {
                    var editorBoundingRect = annotator.editor.element[0].getBoundingClientRect();
                    var highlightRects = annotation.highlights[0].getClientRects();
                    
                    // place line vertically - calculation is relative to the bounds of annotatable area
                    var top = highlightRects[0].top - annotator.element[0].getBoundingClientRect().top;
                    editor.css("top", top);
                    
                    // place line horizontally
                    var width = editorBoundingRect.left - highlightRects[0].left;
                    editor.find(".annotator-line").width(width);
                    editor.find(".annotator-line").height(highlightRects[0].height);
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
                return Annotator.Plugin.neonion.prototype.comparator.compareByField("label", a, b);
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
