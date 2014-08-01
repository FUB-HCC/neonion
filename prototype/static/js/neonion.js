var config = {

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
        create : "/content/save"
    }
};

var cmsConfig = {
    server : "http://euler.mpiwg-berlin.mpg.de:18080",

    service : {
        get : "/doc2?url=/Jahrbuch_der_MPG_Veroeffentlichungen_MPIs_1954-1974___Jahrbuch_der_MPG_Veroeffentlichungen_der_MPI-1974/pages&pn=1&viewmode=hocr&mode=hocr",
        list : ""
    }
};

var gndConfig = {
    server : "http://zbw.eu/beta/sparql"
}