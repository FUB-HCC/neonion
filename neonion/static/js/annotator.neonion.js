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
         *  Internal vars
         *  @private
         */
        var annotator = null,
            adder = null,
            compositor = {},
            selectedType = null,
            viewerFields = {},
            editorFields = {};

        // properties
        this.setCompositor = function (compositorData) {
            compositor = compositorData;
            this.applyAnnotationSets(adder, compositor);
        };
        this.getCompositor = function () {
            return compositor;
        };

        /**
         * Initializes the plugin.
         * @override
         */
        this.pluginInit = function () {
            options.agent = options.agent || {
                email: "unknown@neonion.org"
            };
            annotator = this.annotator;
            adder = this.overrideAdder();
            viewerFields = this.initViewerFields();
            editorFields = {
                search: this.initEditorEntitySearch()
            };
            this.setCompositor(this.getCompositor());

            // bind events to document
            $(document).bind({
                mouseup: function () {
                    // skip adder if only one button is visible
                    if ($(adder).is(":visible")) {
                        var childBtn = $(adder).find("button");
                        // only one button is visible in adder
                        if (childBtn.length === 1) {
                            childBtn.click();
                        }
                    }
                }
            });

            // subscribe to create event to add extra data
            this.annotator
                .subscribe("beforeAnnotationCreated", function (annotation) {
                    if (options.hasOwnProperty("workspace")) {
                        // add permissions to annotation
                        annotation.permissions = {
                            read: [options.workspace],
                            update: [options.workspace],
                            delete: [options.agent.email],
                            admin: [options.agent.email]
                        };
                    }
                });

            this.applyLayer(Annotator.Plugin.Neonion.prototype.annotationLayers.group);
        };

        /**
         * Restores annotations if an uri is provided
         */
        this.applyLayer = function (layer) {
            if (this.annotator.plugins.Store && options.hasOwnProperty("uri")) {
                var query = layer(options);
                this.annotator.plugins.Store.loadAnnotationsFromSearch(query);
            }
        };

        /**
         * Overrides the adder according provided types
         * @returns {*|jQuery|HTMLElement}
         */
        this.overrideAdder = function () {
            var adder = $(this.annotator.adder[0]);

            // create compositor from provided annotation sets
            if (options.hasOwnProperty("annotationSets")) {
                compositor = options["annotationSets"];
            }
            else {
                compositor = {};
            }

            // catch submit event
            adder.on("click", "button", function () {
                // set selected type
                selectedType = $(this).val();
            });
            return adder;
        };

        /**
         * Creates additional fields in viewer
         * @returns {{resource: *, creator: *}}
         */
        this.initViewerFields = function () {
            return {
                // add field to linked person
                resource: this.annotator.viewer.addField({
                    load: function (field, annotation) {
                        if (annotation.rdf) {
                            var ref = annotation.rdf.hasOwnProperty('sameAs') ? annotation.rdf.sameAs : '#';
                            var fieldValue = "<a href='" + ref + "' target='blank'>" + annotation.rdf.label + "</a>";
                            var fieldCaption;
                            if (compositor[annotation.rdf.typeof]) {
                                fieldCaption = compositor[annotation.rdf.typeof].label;
                            }
                            else {
                                fieldCaption = Annotator.Plugin.Neonion.prototype.literals['en'].unknownResource;
                            }
                            field.innerHTML = fieldCaption + ":&nbsp;" + fieldValue;
                        }
                        else {
                            field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['en'].unknownResource;
                        }
                    }
                }),
                // add field with creator
                creator: this.annotator.viewer.addField({
                    load: function (field, annotation) {
                        var userField = Annotator.Plugin.Neonion.prototype.literals['en'].unknown;
                        if (annotation.creator) {
                            userField = annotation.creator.email;
                        }
                        field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['en'].creator + ":&nbsp;" + userField;
                    }
                })
            };
        };

        /**
         * Creates the search field in editor
         * @returns {*}
         */
        this.initEditorEntitySearch = function () {
            // add field containing the suggested resources
            var field = this.annotator.editor.addField({
                load: function (field, annotation) {
                    // restore type from annotation if provided
                    selectedType = annotation.hasOwnProperty('rdf') ? annotation.rdf.typeof : selectedType;

                    $(field).show();
                    $(field).find("#resource-search").val(annotation.quote);
                    $(field).find("#resource-form").submit();

                    // TODO@Alexa: Irgendwie besser benennen.
                    Annotator.Plugin.Neonion.prototype.calcPositionFromAnnotation(annotator, annotation);
                },
                submit: function (field, annotation) {
                    // add user to annotation
                    annotation.user = options.agent.email;
                    annotation.creator = options.agent;
                    // add context
                    annotation.context = Annotator.Plugin.Neonion.prototype.extractSourroundedContent(element, annotation);

                    // add rdf data
                    annotation.rdf = {
                        typeof: selectedType,
                        label: annotation.quote
                    };

                    if ($(element).data("resource")) {
                        var dataItem = $(element).data("resource");
                        // add rdf data
                        annotation.rdf.sameAs = dataItem.uri + '';
                        annotation.rdf.label = dataItem.label;
                        // remove from data
                        $(element).data("resource", null);
                    }
                }
            });

            var searchItem = "<i class='fa fa-search'></i>";
            var cancelItem = "<a href='#' data-action='annotator-cancel'><i class='fa fa-times-circle'></i></a>";
            var unknownItem = "<a href='#' data-action='annotator-unknown'><i class='fa fa-question-circle'></i></a>";

            $(field).children((":first")).replaceWith(
                "<div class='resource-controles'>" + cancelItem + unknownItem + "</div>" +
                "<form id='resource-form'>" + searchItem + "</form>" +
                "<div id='resource-list' class=''></div>"
            );

            $("[data-action=annotator-cancel]").on("click", function () {
                annotator.editor.hide();
            });

            $("[data-action=annotator-unknown]").on("click", function () {
                annotator.editor.submit();
            });

            // create input for search term
            var searchInput = $('<input>').attr({
                type: 'text',
                id: 'resource-search',
                autocomplete: 'off',
                placeholder: Annotator.Plugin.Neonion.prototype.literals['en'].searchText,
                required: true
            });

            var searchForm = $(field).find("#resource-form");
            searchInput.appendTo(searchForm);

            // attach submit handler handler
            searchForm.submit(function () {
                // get search term
                var searchTerm = $(this).find("#resource-search").val();
                var list = $(this).parent().find("#resource-list");
                // replace list with spinner while loading
                list.html(Annotator.Plugin.Neonion.prototype.templates.spinner);

                Annotator.Plugin.Neonion.prototype.search(selectedType, searchTerm,
                    function (items) {
                        var formatter = Annotator.Plugin.Neonion.prototype.formatter[selectedType] || Annotator.Plugin.Neonion.prototype.formatter['default'];
                        // store last result set in jQuery data collection
                        $(element).data("results", items);
                        // update score
                        Annotator.Plugin.Neonion.prototype.updateScoreAccordingOccurrence(items);
                        // create and add items
                        list.empty();

                        if (items.length !== 0) {
                            list.append(Annotator.Plugin.Neonion.prototype.createListItems(0, items, formatter));

                            // do we need pagination?
                            if (items.length > Annotator.Plugin.Neonion.prototype.defaults.paginationSize) {
                                var idxOffset = Annotator.Plugin.Neonion.prototype.defaults.paginationSize;
                                var btnLoadMore = $(Annotator.Plugin.Neonion.prototype.templates.showMore);
                                list.append(btnLoadMore);

                                btnLoadMore.click(function () {
                                    list.append(Annotator.Plugin.Neonion.prototype.createListItems(idxOffset, items, formatter));
                                    idxOffset += Annotator.Plugin.Neonion.prototype.defaults.paginationSize;

                                    if (idxOffset < items.length) {
                                        // move button to end
                                        btnLoadMore.parent().append(btnLoadMore);
                                    }
                                    else {
                                        // hide button if all items are visible
                                        btnLoadMore.hide();
                                    }
                                    return false;
                                });
                            }
                        } else {
                            list.append(Annotator.Plugin.Neonion.prototype.templates.noResults);
                        }
                    });

                return false;
            });
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

            var resourceList = $(field).find("#resource-list");
            // stop propagation on anchor click
            resourceList.on("click", "a", function (event) {
                event.stopPropagation();
            });
            // attach click handler
            resourceList.on("click", "button", function (event) {
                var source = $(this);
                //source.parent().children().removeClass("active");
                //source.addClass("active");
                var itemIndex = parseInt(source.val());
                var dataItem = $(element).data("results")[itemIndex];
                // store selected resource in data
                $(element).data("resource", dataItem);
                annotator.editor.submit();
            });

            var linie = $("<div class='annotator-linie'></div>");
            $(".annotator-editor").append(linie);

            return field;
        };
    };

    $.extend(Annotator.Plugin.Neonion.prototype, new Annotator.Plugin(), {
        events: {},
        options: {},

        defaults : {
            paginationSize : 5
        },

        templates : {
            showMore : "<button data-action='annotator-more'>Show more results&nbsp;&#8230;</button>",
            spinner : "<span style='margin:5px;' class='fa fa-spinner fa-spin'></span>",
            noResults : "<div class='empty'>No results found.</div>"
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
                creator: "Creator"
            },
            de: {
                search: "Suchen",
                searchText: "Suchtext",
                unknown: "Unbekannt",
                unknownResource: "Unbekannte Ressource",
                creator: "Erfasser"
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

        calcPositionFromAnnotation: function (annotator, annotation) {
          var top = $(annotation.highlights[0]).position().top;
          var left = $(annotation.highlights[0]).position().left;
          var editor = $(annotator.editor.element[0]);
          var annotator = $(annotator.element[0]);
          var width = annotator.width();
          editor.css("top", top);
          editor.find(".annotator-linie").width(width - left + 378 + 108);
          editor.find(".annotator-linie").css("left", -(width - left + 108));
          $(annotation.highlights[0]).css("border-left", "1px solid #717171");
        },

        extractSourroundedContent: function (element, annotation) {
            var length = 200;
            var node, contentLeft = '', contentRight = '';
            // left
            node = annotation.highlights[0];
            while (node != element && contentLeft.length < length) {
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
            while (node != element && contentRight.length < length) {
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

        applyAnnotationSets: function (adder, compositor) {
            adder.html("");
            for (var uri in compositor) {
                if (compositor.hasOwnProperty(uri)) {
                    adder.append("<button value='" + uri + "'>" + compositor[uri].label + "</button>");
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
            list = list.slice(offset, offset + Annotator.Plugin.Neonion.prototype.defaults.paginationSize);
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
            var highlights = Annotator.Plugin.Neonion.prototype.getAnnotationHighlights();
            var occurrence = {};
            // count occurrence of each resource
            highlights.each(function () {
                var annotation = $(this).data("annotation");
                if (annotation.rdf && annotation.rdf.about) {
                    if (!occurrence[annotation.rdf.about]) {
                        occurrence[annotation.rdf.about] = 0;
                    }
                    occurrence[annotation.rdf.about]++;
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
            var url = '/es?type=' + encodeURI(type) + '&q=' + encodeURI(searchText);
            $.getJSON(url, function (data) {
                if (callback) {
                    callback(data);
                }
            });
        }
    });

})();
