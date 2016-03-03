(function () {
    "use strict"; // enable strict mode

    /**
     * Custom formatter for persons.
     * @param value
     * @returns {*}
     */
    Annotator.Plugin.neonion.prototype.formatter['http://neonion.org/concept/person'] = function (value) {
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
    };

    /**
     * Widget to store the surrounded text of the annotation quote.
     * @returns {}
     */
    Annotator.Plugin.neonion.prototype.widgets['contextInformation'] = function (scope, options) {
        var factory = {};

        factory.load = function () {
            // extract the context information when the editor was submitted
            scope.annotator.subscribe("annotationEditorSubmit", function (editor, annotation) {
                if (!annotation.hasOwnProperty('neonion')) {
                    annotation['neonion'] = {};
                }
                // add context information
                annotation['neonion']['context'] = {
                    'pageIdx': factory.getPageIndex(annotation, scope.annotator),
                    'surrounding': factory.getSurroundedContent(annotation, scope.annotator),
                    'normalizedHighlights': factory.getHighlightRectangles(annotation, scope.annotator)
                };

                // add information to OA selector
                if (annotation.hasOwnProperty("oa")) {
                    // use PDF fragment identification
                    // see http://openannotation.org/spec/core/specific.html#FragmentSelector
                    annotation['oa']['hasTarget']['hasSelector']['conformsTo'] = 'http://tools.ietf.org/rfc/rfc3778';
                    annotation['oa']['hasTarget']['hasSelector']['value'] = 
                        '#page=' + (annotation['neonion']['context']['pageIdx'] + 1) + 
                        '&highlight=' + factory.getFragmentHighlight(annotation['neonion']['context']['normalizedHighlights']);
                }
            });
        };

        /**
         * Returns the element representing the page bounds.
         * @param annotation
         * @param annotator
         */
        factory.getPageElement = function (annotation, annotator) {
            var node = null;
            if (annotation.highlights.length > 0) {
                node = $(annotation.highlights[0]);
                while (!node.parent().hasClass('annotator-wrapper')) {
                    // move up until annotator-wrapper is reached
                    node = node.parent();
                }
                // convert selector to DOM element
                node = node[0];
            }
            return node;
        };

        /**
         * Returns a formatted string representing the bounds to the highlights.
         * @param highlights array with rectangles
         */
        factory.getFragmentHighlight = function(highlights) {
            var lt = 0, rt = 1, top = 0, btm = 1;
            for(var i = 0; i < highlights.length; i++) {
                lt = Math.max(highlights[i].left, lt);
                rt = Math.min(1 - highlights[i].left + highlights[i].width, rt);
                top = Math.max(highlights[i].top, top);
                btm = Math.min(1 - highlights[i].top + highlights[i].height, btm);
            }
            return lt + ',' + rt + ',' + top + ',' + btm;
        };

        /**
         * Returns the page index on the document.
         * @param annotation
         * @param annotator
         */
        factory.getPageIndex = function (annotation, annotator) {
            var page = factory.getPageElement(annotation, annotator);
            // return the index of the page
            return $(page.parentNode).children("div").index(page);
        };

        factory.getHighlightRectangles = function (annotation, annotator) {
            var page = factory.getPageElement(annotation, annotator);
            var pageBounds = page.getBoundingClientRect();
            var rects = [];

            annotation.highlights.forEach(function (highlight) {
                var clientRects = highlight.getClientRects();
                // convert ClientRectList to array
                for (var i = 0; i < clientRects.length; i++) {
                    rects.push({
                        'top': clientRects[i].top,
                        'left': clientRects[i].left,
                        'width': clientRects[i].width,
                        'height': clientRects[i].height
                    });
                }
            });

            // return an array of normalized rectangles
            return rects.map(function (rect) {
                // map coordinate to page space and normalize
                rect.top = (rect.top - pageBounds.top) / pageBounds.height;
                rect.left = (rect.left - pageBounds.left) / pageBounds.width;
                // normalize size
                rect.width = rect.width / pageBounds.width;
                rect.height = rect.height / pageBounds.height;
                return rect;
            });
        };

        /**
         * Extracts the text left and right of the annotation quote
         * @param annotation
         * @param annotator
         * @returns {{left: string, right: string}}
         */
        factory.getSurroundedContent = function (annotation, annotator) {
            var length = 70;
            var node, contentLeft = '', contentRight = '';
            // left
            node = annotation.highlights[0];
            while (node != annotator.element[0] && contentLeft.length < length) {
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
            while (node != annotator.element[0] && contentRight.length < length) {
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
        };

        return factory;
    };

    /**
     * Widget to enable the linking of entities to external resources.
     * @returns {}
     */
    Annotator.Plugin.neonion.prototype.widgets['entityLinking'] = function (scope, options) {

        var factory = {
            state: {
                selectedItem: -1,
                resultSet: []  
            },
            paginationSize: 5,
        };

        factory.templates = {
            showMore: "<button class='more' data-action='annotator-more'>Show more results&nbsp;&#8230;</button>",
            spinner: "<span style='margin:5px;' class='fa fa-spinner fa-spin'></span>",
            noResults: "<div class='empty'>No results found.</div>",
            searchItem: "<i class='fa fa-search'></i>",
            cancelItem: "<a data-action='annotator-cancel'><i class='fa fa-times fa-fw'></i></a>",
            unknownItem: "<button type='button' class='unknown' data-action='annotator-submit'>Unknown Resource</button>",
        };

        factory.load = function () {
            // create field in editor
            factory.entityField = factory.initEditorEntityField();
            // inject field to parent
            scope.fields.editor[scope.oa.motivation.classifying] = factory.entityField;
            scope.fields.editor[scope.oa.motivation.identifying] = factory.entityField;

            scope.annotator.subscribe('annotationEditorShown', function (editor, annotation) {
                if (scope.helper.getMotivationEquals(annotation, scope.oa.motivation.classifying) ||
                    scope.helper.getMotivationEquals(annotation, scope.oa.motivation.identifying)) {
                    var concept = scope.getConceptDefinition(annotation['oa']['hasBody']['classifiedAs']);
                    // check if the concept provides an entity lookup
                    if (!(concept && factory.conceptHasReferrals(concept))) {
                        // submit automatically if no lookup is provided
                        editor.submit();
                    }
                }

            });

            scope.annotator.subscribe('annotationEditorHidden', function () {
                // clear prior editor state
                factory.state.selectedItem = -1;
                factory.state.resultSet = [];
            });
        };

        factory.initEditorEntityField = function () {
            // add field containing the suggested resources
            var field = scope.annotator.editor.addField({
                load: factory.loadEditorEntityField,
                submit: factory.submitEditorEntityField
            });

            // replace filed with custom content
            $(field).children((":first")).replaceWith(
                "<div class='resource-controls'>" + factory.templates.cancelItem + "</div>" +
                "<form id='resource-form'>" + factory.templates.searchItem + "</form>" +
                "<div id='resource-list'>" + factory.templates.unknownItem + "</div>"
            );

            // create input for search term
            var searchInput = $('<input>').attr({
                type: 'text',
                id: 'resource-search',
                autocomplete: 'off',
                placeholder: scope.literals['en'].searchText,
                required: true
            });

            var searchForm = $(field).find("#resource-form");
            var resourceList = $(field).find("#resource-list");
            searchInput.appendTo(searchForm);

            // attach submit handler handler
            searchForm.submit(function () {
                factory.updateEntityList(searchInput.val());    
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

            // stop propagation on anchor click
            resourceList.on("click", "a", function (e) {
                e.stopPropagation();
            });

            // attach handler to submit from resource list
            resourceList.on("click", "button", function (e) {
                var source = $(e.currentTarget);
                var itemIndex = parseInt(source.val());
                itemIndex = !isNaN(itemIndex) ? itemIndex : -1;
                // store selected resource in editor state
                factory.state.selectedItem = itemIndex;
                scope.annotator.editor.submit();
            });

            return field;
        };

        factory.submitEditorEntityField = function (field, annotation) {
            if (scope.helper.getMotivationEquals(annotation, scope.oa.motivation.classifying) ||
                scope.helper.getMotivationEquals(annotation, scope.oa.motivation.identifying)) {
                // add extra information from identified resource
                if (factory.state.selectedItem >= 0 && factory.state.selectedItem < factory.state.resultSet.length) {
                    var dataItem = factory.state.resultSet[factory.state.selectedItem];
                    annotation['oa']['hasBody']['label'] = dataItem.label;
                    annotation['oa']['hasBody']['identifiedAs'] = dataItem.uri + '';
                    annotation['oa']['motivatedBy'] = scope.oa.motivation.identifying;
                }
            }
        };

        factory.loadEditorEntityField = function (field, annotation) {
            if (scope.helper.getMotivationEquals(annotation, scope.oa.motivation.classifying) ||
                scope.helper.getMotivationEquals(annotation, scope.oa.motivation.identifying)) {
                $(field).show();
                $(field).find("#resource-search").val(annotation.quote);
                $(field).find("#resource-search").attr("autofocus", "autofocus");
                $(field).find("#resource-search").focus();
                $(field).find("#resource-form").submit();
            }
        };

        /**
         * Creates the list containing the suggested resources.
         * @param searchTerm
         */
        factory.updateEntityList = function (searchTerm) {
            var concept = scope.getConceptDefinition(scope.annotator.editor.annotation['oa']['hasBody']['classifiedAs']);

            // check if the concept is connected to concepts from a knowledge provider
            if (concept && factory.conceptHasReferrals(concept)) {
                var list = $(factory.entityField).find("#resource-list");
                // replace list with spinner while loading
                list.html(factory.templates.spinner);

                var indexName = factory.getIndexName(concept.linked_concepts[0].endpoint);
                // lookup resource by search term and provided index
                this.search(concept.id, searchTerm, indexName)
                    .done(function (items) {
                        var formatter = scope.formatter[concept.uri] || scope.formatter['default'];
                        // store last result set
                        factory.state.resultSet = items;
                        // update score
                        factory.updateScoreAccordingOccurrence(items);
                        // create and add items
                        list.empty();

                        if (items.length !== 0) {
                            list.append(factory.createListItems(0, items, factory.paginationSize, formatter));

                            // do we need pagination?
                            if (items.length > factory.paginationSize) {
                                var idxOffset = factory.paginationSize;
                                var btnLoadMore = $(factory.templates.showMore);
                                list.append(btnLoadMore);

                                btnLoadMore.click(function () {
                                    list.append(factory.createListItems(idxOffset, items, factory.paginationSize, formatter));
                                    idxOffset += factory.paginationSize;

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
                            list.append(factory.templates.noResults);
                        }
                        list.prepend(factory.templates.unknownItem);
                    })
                    .fail(function () {
                        list.html(factory.templates.unknownItem);
                    });
            }
        };

        factory.search = function (type, searchText, index) {
            var url = scope.options.lookup.prefix + scope.options.lookup.urls.search +
                "/" + encodeURI(index) + "/" + encodeURI(type) + "/" + encodeURI(searchText);
            return $.getJSON(url);
        };

        factory.updateScoreAccordingOccurrence = function (items) {
            var annotations = scope.getAnnotations();
            var occurrence = {};
            // count occurrence of each resource
            for (var i = 0; i < annotations.length; i++) {
                if(scope.helper.getMotivationEquals(annotations[i], scope.oa.motivation.identifying)) {
                    if (annotations[i]['oa']['hasBody'].hasOwnProperty("identifiedAs")) {
                        if (!occurrence[annotations[i]['oa']['hasBody']['identifiedAs']]) {
                            occurrence[annotations[i]['oa']['hasBody']['identifiedAs']] = 0;
                        }
                        occurrence[annotations[i]['oa']['hasBody']['identifiedAs']]++;
                    }
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
        };

        /**
         * Creates a list of item according pagination and formatter.
         * @param offset
         * @param list
         * @param pageSize
         * @param formatter
         * @returns {Array}
         */
        factory.createListItems = function (offset, list, pageSize, formatter) {
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
        };

        /**
         * Indicates whether the given concept provides a search for referrals.
         * @param concept
         * @returns {boolean}
         */
        factory.conceptHasReferrals = function(concept) {
            return concept.hasOwnProperty('linked_concepts') && concept['linked_concepts'].length > 0;
        };

        /**
         * Extracts the name of the index from the given endpoint URL
         * @param endpoint
         */
        factory.getIndexName = function(endpoint) {
            // TODO rethink that
            var element = document.createElement('a');
            element.href = endpoint;
            return element.hostname.split('.')[1];
        };

        return factory;
    };

})();