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

       /**
         *  Internal vars
         *  @private
         */
        var _isProcessing = false;

        this.pluginInit = function () {
            options.model = options.model || 'default';
            options.agent = options.agent || {
                email : 'ner@neonion.org',
                name : 'Stanford NER'
            };
            options.motivation = options.motivation || 'oa:questioning';

            // subscribe to annotator events
            this.annotator
                .subscribe("annotationCreated", function (annotation) {
                    // TODO raise NER event
                    console.log(annotation);
                })
                .subscribe("annotationUpdated", function (annotation) {
                    // TODO raise NER event
                })
                .subscribe("annotationDeleted", function (annotation) {
                    // check if deleted annotation is automatic annotation
                    if (annotation.hasOwnProperty('creator') && annotation.creator.email == options.agent.email) {
                        // TODO raise NER event
                    }
                });
        };

        /**
        * Returns the plain text of the document.
        **/
        this.getPlainText = function() {
            return $(this.annotator.wrapper[0]).children('div:first').text();
        };

        /**
        * Initiates the recognition process.
        **/
        this.recognize = function(settings) {
            if (!_isProcessing) {
                _isProcessing = true;
                // assemble parameters for NER recognition
                var params = {
                    textURI: options.uri,
                    text: this.getPlainText()
                };
                //console.log(params.text);
                // Post text to NER service
                $.ajax({
                    type: "POST",
                    url: options.service + "/models/" + options.model + "/recognize",
                    data: JSON.stringify(params),
                    dataType: "json",
                    context: this,
                    contentType: "application/json; charset=utf-8",
                    success: function (data, textStatus, jqXH) {
                        _isProcessing = false;
                        this.createAnnotations(this.processTokenSet(data.results));
                        if (settings.hasOwnProperty('success')) settings.success(data);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        _isProcessing = false;
                        if (settings.hasOwnProperty('error')) settings.error(jqXHR, textStatus, errorThrown);  
                    }
                });
            }
        };

        /**
        *Creates annotations from list of token.
        **/
        this.createAnnotations = function(tokenList) {
            for(var i = 0; i < tokenList.length; i++) {
                if (!this.annotationExist(tokenList[i])){
                    var path = this.convertToXPath(tokenList[i]); 
                    var annotation = this.annotator.createAnnotation();
                    // additional properties to identify automatic annotations
                    annotation.creator = options.agent;
                    annotation.motivatedBy = options.motivation;
                    annotation.rdf = {
                        typeof : 'http://neonion.org/concept/person', // tokenList[i].type,
                        label : tokenList[i].text
                    };
                    // add range to annotation
                    annotation.ranges = [path];
                    // finalize annotation
                    this.annotator.setupAnnotation(annotation);
                    // publish annotation created
                    this.annotator.publish("annotationCreated", [annotation]);
                }
            }
        };

        /**
        * Convert the offset of an token to an XPath expression.
        **/
        this.convertToXPath = function(token) {
            return {
                start: "//div[1]",
                end: "//div[1]",
                startOffset: token.offset.start,
                endOffset: token.offset.end
            }
        };

        /**
        * Checks if an annotation already exists.
        **/
        this.annotationExist = function(token){
            var path = this.convertToXPath(token);
            var range = Annotator.Range.sniff(path).normalize(this.annotator.wrapper[0]);

            if (range && range.hasOwnProperty('commonAncestor') &&
                range.commonAncestor.className == 'annotator-hl') {
                // get annotation of ancestor
                var annotation = $(range.commonAncestor).data('annotation');
                if (annotation && annotation.quote == token.text){
                    return true;
                }
            }
            return false;
        }

        /**
        * Post-process token set and merges contiguous token.
        */
        this.processTokenSet = function(tokenList) {
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
                    return a.offset.start - b.offset.start
                });
                var groups = {};
                // group token by type
                tokenList.map(function(item) {
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

    };

    $.extend(Annotator.Plugin.NER.prototype, new Annotator.Plugin(), {
        events: {},
        options: {}
    });

})();