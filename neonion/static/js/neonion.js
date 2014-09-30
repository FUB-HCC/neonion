var config = {

    scms : {
        // server : "http://hcc-loomp.herokuapp.com",
        server : "/loomp",
        uriPrefix: "http://loomp.org/data/",

        uri : {
            annotation : "http://vocab.loomp.org/model/Annotation",
            annotationSet : "http://vocab.loomp.org/model/AnnotationSet",
            elementText : "http://vocab.loomp.org/model/ElementText"
        },

        service : {
            // GET services
            get : "/content/get?uri=%(uri)s",
            getAll : "/content/getAll?type=%(type)s",
            delete : "/content/delete?uri=%(uri)s",
            // POST services
            save : "/content/save",
            create : "/content/save"
        }
    }

};

