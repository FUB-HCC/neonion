(function () {
  "use strict";


  Annotator.Plugin.neonion.prototype.widgets['wikidataLiveEntitySearch'] = function (scope, options) {
    var factory = {};

    factory.load = function () {

      // overwrite local endpoint called for entity search
      scope.options.lookup = {
        prefix: '/wikidata',
        urls: {
          search: "/itemsearch"
        }
      };

      scope.annotator.subscribe('annotationEditorShown', function (editor, annotation) {

        console.log(annotation);
        console.log(scope.options);

      });

      scope.annotator.subscribe('annotationEditorHidden', function () {


      });

    };

    return factory;

  }
})();
