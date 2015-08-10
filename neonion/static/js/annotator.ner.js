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
     * Named entity plugin for Annotator
     * @implements {Annotator.Plugin}
     */
    Annotator.Plugin.NER = function (element, options) {

        /**
         * Call constructor.
         * @constructor
         */
        Annotator.Plugin.apply(this, arguments);

        this.pluginInit = function () {
            this._isProcessing = false;
        };

    };

    $.extend(Annotator.Plugin.NER.prototype, new Annotator.Plugin(), {

        events: {
            annotationCreated: "annotationCreated",
            annotationUpdated: "annotationUpdated",
            annotationDeleted: "annotationDeleted"
        },

        options: {
            service: '/',
            recognition : {
                model : 'standard',
                trainModel : false
            },
            agent : {
                email: 'ner@neonion.org',
                name: 'Stanford NER'
            }
        },

        annotationCreated : function (annotation) {
            // TODO raise NER event
            console.log(annotation, this);
        },

        annotationUpdated : function (annotation) {
            // TODO raise NER event
            //console.log(annotation);
        },

        annotationDeleted : function (annotation) {
            // check if deleted annotation is automatic annotation
            /*if (annotation.hasOwnProperty('creator') && annotation.oa.annotatedBy.email == this.options.agent.email) {
                // TODO raise NER event
            }*/
        },

        /**
         * Returns the plain text of the document.
         **/
        getPlainText : function () {
            return $(this.annotator.wrapper[0]).children('div:first').text();
        },

        /**
         * Initiates the recognition process.
         **/
        recognize : function (settings) {
            if (!this._isProcessing) {
                this._isProcessing = true;
                // assemble parameters for NER recognition
                var params = {
                    textURI: this.options.uri,
                    text: this.getPlainText()
                };
                //console.log(params.text);
                // Post text to NER service
                $.ajax({
                    type: "POST",
                    url: this.options.service + "/models/" + this.options.recognition.model + "/recognize",
                    data: JSON.stringify(params),
                    dataType: "json",
                    context: this,
                    contentType: "application/json; charset=utf-8",
                    beforeSend: $.proxy(function (request) {
                        if (this.options.hasOwnProperty('auth')) {
                            //request.setRequestHeader("X-Neonion-Authorization", this.options['auth']);
                        }
                    }, this),
                    success: $.proxy(function (data, textStatus, jqXH) {
                        this._isProcessing = false;
                        this.createAnnotations(this.processTokenSet(data.results));
                        if (settings.hasOwnProperty('success')) settings.success(data);
                    }, this),
                    error: $.proxy(function (jqXHR, textStatus, errorThrown) {
                        this._isProcessing = false;
                        if (settings.hasOwnProperty('error')) settings.error(jqXHR, textStatus, errorThrown);
                    }, this)
                });
            }
        },

        /**
         * Creates annotations from list of token.
         **/
        createAnnotations : function (tokenList) {
            for (var i = 0; i < tokenList.length; i++) {
                if (!this.annotationExist(tokenList[i])) {
                    var path = this.convertToXPath(tokenList[i]);
                    var annotation = this.annotator.createAnnotation();
                    // additional properties to identify automatic annotations
                    annotation.rdf = {
                        typeof: 'http://neonion.org/concept/person', // tokenList[i].type,
                        label: tokenList[i].text
                    };

                    // add range to annotation
                    annotation.ranges = [path];
                    // finalize annotation
                    this.annotator.setupAnnotation(annotation);
                    if (this.annotator.plugins.Neonion) {
                        annotation.oa.annotatedBy = $.extend(this.options.agent, {type: this.oa.types.agent.software}),
                        annotation.oa.motivatedBy = this.annotator.plugins.Neonion.oa.motivation.questioning;
                        annotation.context = this.annotator.plugins.Neonion.extractSurroundedContent(annotation);
                    }
                    // publish annotation created
                    this.annotator.publish("annotationCreated", [annotation]);
                }
            }
        },

        /**
         * Convert the offset of an token to an XPath expression.
         **/
        convertToXPath : function (token) {
            return {
                start: "//div[1]",
                end: "//div[1]",
                startOffset: token.offset.start,
                endOffset: token.offset.end
            };
        },

        /**
         * Checks if an annotation already exists.
         **/
        annotationExist : function (token) {
            var path = this.convertToXPath(token);
            var range = Annotator.Range.sniff(path).normalize(this.annotator.wrapper[0]);

            if (range && range.hasOwnProperty('commonAncestor') &&
                range.commonAncestor.className == 'annotator-hl') {
                // get annotation of ancestor
                var annotation = $(range.commonAncestor).data('annotation');
                if (annotation && annotation.quote == token.text) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Post-process token set and merges contiguous token.
         */
        processTokenSet : function (tokenList) {
            var mergedToken = [];

            if (tokenList.length > 0) {

                // Workaround Array in Array
                /*tokenList = tokenList.map(function(item) {
                 //item.offset.start -= 1;
                 item.offset.end -= 1;
                 return item;
                 });*/

                var plainText = this.getPlainText();
                // sort by ascending by token start
                tokenList.sort(function (a, b) {
                    return a.offset.start - b.offset.start;
                });
                var groups = {};
                // group token by type
                tokenList.map(function (item) {
                    if (!(item.type in groups)) {
                        groups[item.type] = [];
                    }
                    groups[item.type].push(item);
                    return item;
                });

                for (var key in groups) {
                    var currentToken = jQuery.extend(true, {}, groups[key][0]);
                    mergedToken.push(currentToken);
                    for (var i = 1; i < groups[key].length; i++) {
                        var token = groups[key][i];
                        // check if token are overlapping or separated by whitespace
                        if (
                            token.offset.start <= currentToken.offset.end ||
                            (Math.abs(token.offset.start - currentToken.offset.end) == 1 &&
                            plainText.charAt(Math.max(token.offset.start - 1, 0)) == " ")
                        ) {
                            // merge token
                            currentToken.offset.end = Math.max(currentToken.offset.end, token.offset.end);
                            currentToken.text = plainText.substring(currentToken.offset.start, currentToken.offset.end);
                        }
                        else {
                            currentToken = jQuery.extend(true, {}, token);
                            mergedToken.push(currentToken);
                        }
                    }
                }
            }
            console.log(tokenList);
            console.log(mergedToken);
            return mergedToken;
        }

    });

})();