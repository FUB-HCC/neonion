var config = {

    store : {
        server : "http://annotator.l3q.de"
    },

    scms : {
        server : "http://hcc-loomp.herokuapp.com",
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
    },
    
    cms : {
        server : "http://euler.mpiwg-berlin.mpg.de:8000",

        service : {
            getPage : "/hocr?document=%(uri)s&pn=%(pn)s",
            list : ""
        }
    },

    gnd : {
        server : "http://zbw.eu/beta/sparql",

        servive : {
            query : "query?query=%(query)s&output=json"
        }
    }

};

