var config = {
    server : "http://localhost:8181/loomp",
    uriPrefix : "http://loomp.org/data/",

    uri : {
        annotation : "http://vocab.loomp.org/model/Annotation",
        annotationSet : "http://vocab.loomp.org/model/AnnotationSet",
        elementText : "http://vocab.loomp.org/model/ElementText"
    },
    
    service : {
        get : "/content/get",
        getAll : "/content/getAll",
        save : "/content/save"
    }
}; 