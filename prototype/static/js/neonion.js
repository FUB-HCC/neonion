var config = {

    neonion : {
        whoami : "/accounts/me"
    },

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

    wikiData : {

        prefix : "http://www.wikidata.org/wiki/",

        search_items : function(name, callback){
          var result = [];
          var url = 'https://www.wikidata.org'+
              '/w/api.php?action=query&list=search&format=json&srsearch='+name+'~&srnamespace=0&srprop=titlesnippet&srlimit=25'+
              '&callback=?';
          //console.log(url);
          $.getJSON(
            url,
            function(data) {
              $('#result_1').html('');
              $.each( data.query.search, function( id, entity ) {
                result.push( entity.title );
              });
              $('#result_1').append( result.join('|') );
              //console.log( result );
              callback(result);
          });
        },

        get_person_data : function(wd_ids, callback){
          var url = 'https://www.wikidata.org'+
              '/w/api.php?action=wbgetentities&format=json&props=labels%7Cdescriptions%7Cclaims&languagefallback=&ids='+wd_ids+
              '&callback=?';
          var result = [];
          //console.log(url);
          $.getJSON(
            url,
            function(data) {
                $.each( data.entities, function( id, entity ) {
                  var label = null;
                  var descr = null;
                  var birth = null;
                  if( entity.labels ){
                    if( entity.labels.de )      label = entity.labels.de.value;
                    else if( entity.labels.en ) label = entity.labels.en.value;
                    else{
                        var first;
                        for (var prop in entity.labels) {
                            first = prop;
                            break;
                        }
                        label = entity.labels[first].value;
                    }
                  }
                  if( entity.descriptions ){
                    if( entity.descriptions.de )      descr = entity.descriptions.de.value;
                    else if( entity.descriptions.en ) descr = entity.descriptions.en.value;
                  }
                  
                  if( entity.claims && 
                      entity.claims.P569 && 
                      entity.claims.P569.length > 0 && 
                      entity.claims.P569[0].mainsnak && 
                      entity.claims.P569[0].mainsnak.datavalue && 
                      entity.claims.P569[0].mainsnak.datavalue.value && 
                      entity.claims.P569[0].mainsnak.datavalue.value.time ){
                    birth = moment(entity.claims.P569[0].mainsnak.datavalue.value.time.substring(8)).format('YYYY-MM-DD');
                  }
                  
                  
                  if( entity.claims && 
                      entity.claims.P31 &&
                      entity.claims.P31[0] &&
                      entity.claims.P31[0].mainsnak &&
                      entity.claims.P31[0].mainsnak.datavalue &&
                      entity.claims.P31[0].mainsnak.datavalue.value &&
                      entity.claims.P31[0].mainsnak.datavalue.value['numeric-id'] == 5 ){
                        result.push( { 
                            id : entity.id, label : label
                            , uri : config.wikiData.prefix + entity.id
                            , birth : birth, descr : descr 
                        } );
                  }
                });
                //console.log( result );
                callback(result);
            });
        },


        get_mpi_ids : function(){
          var url = 'http://wdq.wmflabs.org/api?q=claim[31:15916302]'+
                    '&callback=?';
          var result = '';
          $.getJSON(
            url,
            function(data) {
              result = 'q'+data.items.join('|q');
              get_institute_data(result);
            });
        },

        get_institute_data : function(wd_ids){
          var url = 'https://www.wikidata.org'+
              '/w/api.php?action=wbgetentities&format=json&props=labels&languagefallback=&ids='+wd_ids+
              '&callback=?';
          var result = [];
          //console.log(url);
          $.getJSON(
            url,
            function(data) {
              $.each( data.entities, function( id, entity ) {
                var label = null;
                if( entity.labels ){
                  if( entity.labels.de )      label = entity.labels.de.value;
                  else if( entity.labels.en ) label = entity.labels.en.value;
                  else{                       label = entity.labels[getFirst(entity.labels)].value; }
                }
                result.push( { id:entity.id, label:label } )
              });
              //console.log( result );
              return result;
            });
        }
    }

    /*gnd : {
        server : "http://zbw.eu/beta/sparql",

        servive : {
            query : "query?query=%(query)s&output=json"
        },

        query : {
            findPerson : 
            "PREFIX gndo: <http://d-nb.info/standards/elementset/gnd#>" +
            "SELECT ?res ?name year(?birth) year(?death) WHERE{" +
            "?res a gndo:DifferentiatedPerson . ?res gndo:preferredNameForThePerson ?name . ?res gndo:dateOfBirth ?birth . ?res gndo:dateOfDeath ?death . FILTER (%(filter)s)" +
            "} LIMIT %(limit)s"
        }
    }*/

};

