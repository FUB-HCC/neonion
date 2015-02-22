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
            options.model = options.model || 'default';
        };

        this.recognize = function(params) {
            // Post text to NER service
            var params = {
                textURI: options.uri,
                text: $(element).first().text()
            };
            console.log($(element).first().text());
            //console.log(params);
            $.ajax({
                type: "POST",
                url: options.service + "/models/" + options.model + "/recognize",
                data: JSON.stringify(params),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    this.processTokenSet(data.results);
                    if (params.hasOwnProperty('success')) params.success(data);
                },
                error: function () {
                    if (params.hasOwnProperty('error')) params.error();  
                }
            });
        };

        this.processTokenSet = function(tokenList) {
            var mergedToken = [];

            if (tokenList.length > 0) {
                var plainText = $(element).text();
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
                    var currentToken = groups[key][0];
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
                            currentToken = token;
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