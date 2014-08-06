var config = {

    scms : {

        server : "http://hcc-loomp.herokuapp.com",

        uriPrefix: "http://loomp.org/data/",

        uri : {
            annotation : "http://vocab.loomp.org/model/Annotation",
            annotationSet : "http://vocab.loomp.org/model/AnnotationSet",
            elementText : "http://vocab.loomp.org/model/ElementText"
        },

        service : {
            get : "/content/get",
            getAll : "/content/getAll",
            save : "/content/save",
            delete : "/content/delete",
            create : "/content/save"
        }
    },
    
    cms : {
        server : "http://euler.mpiwg-berlin.mpg.de:8000",

        service : {
            getPage : "/hocr?document=",
            list : ""
        }
    },

    gnd : {
        server : "http://zbw.eu/beta/sparql"
    }

};

