Annotator.Plugin.Neonion = function (element, options) {

	var user;

    return {

		pluginInit : function () {

			// add additional adder buttons
			/*var adder = $(this.annotator.adder[0]);
			adder.html("");
			var types = [
				Annotator.Plugin.Neonion.prototype.surrogate.person,
				Annotator.Plugin.Neonion.prototype.surrogate.institute
			];
			types.forEach(function(index, value)) {
				adder.append("<button class='btn-green'>" + Annotator.Plugin.Neonion.prototype.literals['de'].person + "</button>");
			});
			
			adder.on( "click", "button", function (e) {
				alert(this);
			});*/

			// add field to linked person
			this.annotator.viewer.addField({
				load: function (field, annotation) {
					if (annotation.rdf) {
						var fieldValue = "<a href='" + annotation.rdf.about + "' target='blank'>" + annotation.rdf.label + "</a>";
						var fieldCaption;
						switch(annotation.rdf.typeof) {
							case Annotator.Plugin.Neonion.prototype.surrogate.person.uri:
								fieldCaption = Annotator.Plugin.Neonion.prototype.literals['de'].person; break;
							case Annotator.Plugin.Neonion.prototype.surrogate.institute.uri:
								fieldCaption = Annotator.Plugin.Neonion.prototype.literals['de'].institute; break;
							default:
								fieldCaption = Annotator.Plugin.Neonion.prototype.literals['de'].unknownResource;
						}
						field.innerHTML = fieldCaption + ":&nbsp;" + fieldValue;
					}
					else {
						field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['de'].unknownResource
					}
				}
			});
			// add field with creator
			this.annotator.viewer.addField({
				load: function (field, annotation) {
					var userField = Annotator.Plugin.Neonion.prototype.literals['de'].unknown;
					if (annotation.creator) {
						userField = annotation.creator.email;
					}
					field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['de'].creator + ": " + userField;
				}
			});

			// add field containing the suggested ressources
			var suggestionField = this.annotator.editor.addField({
				load: this.updateSuggestionField,
				submit: this.pluginSubmit
			});
			$(suggestionField).children((":first")).replaceWith("<div class='btn-group-vertical'></div>");
			// attach click handler
			$(suggestionField).on( "click", "button", function (e) {
				var source = $(this);
				source.parent().children().removeClass("active");
				source.addClass("active");
				$(".annotator-widget").submit();
			});

			// get logged in user credentials
			$.ajax({
				context : this, 
				type : "get",
				url : options.whoamiUrl, 
				success : this.setUser, 
				dataType : "json"
			});

			// attach event handler to enrich DOM with RDFa
			this.annotator.subscribe("annotationCreated", Annotator.Plugin.Neonion.prototype.enrichRDFa);
			this.annotator.subscribe("annotationUpdated", Annotator.Plugin.Neonion.prototype.enrichRDFa);
		},

		setUser : function(userData) { 
			user = userData; 
		},

		pluginSubmit : function(field, annotation) {
			var activeItem = $(field).children(":first").children(".active");

			// add user to annotation
			annotation.creator = user;

			// update annotation object
			annotation.rdf = {
				typeof : Annotator.Plugin.Neonion.prototype.surrogate.person.uri,
				property : "rdfs:label",
				about : activeItem.attr("uri"),
				label : activeItem.val()
			 };
		},

		updateSuggestionField : function(field, annotation) {
			// get selected text
			var words = annotation.quote.split(" ");
			var list = $(field).children(":first");
			list.empty();

			// search person in WikiData
			Annotator.Plugin.Neonion.prototype.search.searchPerson(annotation.quote, function(items) {
				// add unknown person resource
				items.unshift(Annotator.Plugin.Neonion.prototype.surrogate.unknownPerson);
				// create and add items
				list.append(Annotator.Plugin.Neonion.prototype.createListItems(items, Annotator.Plugin.Neonion.prototype.formatters.formatPerson));
			
				// activae corresponding button
				if (annotation.rdf) {
					list.children("button[uri='" + annotation.rdf.about + "']" ).addClass("active");
				}
			});
		}

	}

};

// Prototype extensions
Annotator.Plugin.Neonion.prototype.literals = {
	de : {
		person : "Person", unknownPerson : "Unbekannte Person",
		institute : "Institut", unknownInstitute : "Unbekanntes Institut",
		creator : "Erfasser", unknown : "Unbekannt", unknownResource : "Unbekannte Ressource"
	}
}

Annotator.Plugin.Neonion.prototype.surrogate = {
	person : { uri : "https://www.wikidata.org/wiki/Q5", _source : { label : Annotator.Plugin.Neonion.prototype.literals['de'].person } },
	institute : { uri : "https://www.wikidata.org/wiki/Q31855" , _source : { label : Annotator.Plugin.Neonion.prototype.literals['de'].institute, } },
	unknownPerson : { uri : "http://neonion.com/resource/Unknown_Person", _source : { label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownPerson } },
	unknownInstitute : { uri : "http://neonion.com/resource/Unknown_Institute", _source : { label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownInstitute } }
}

Annotator.Plugin.Neonion.prototype.enrichRDFa = function(annotation) {
	// add RDFa attributes to markup
	annotation.highlights[0].setAttribute("typeof", annotation.rdf.typeof);
	annotation.highlights[0].setAttribute("property", annotation.rdf.property);
	annotation.highlights[0].setAttribute("about", annotation.rdf.about);
}

Annotator.Plugin.Neonion.prototype.createListItems = function(list, formatter) {
	var items = [];
	$.each(list, function(index, value) {
		var label = formatter(value);
		items.push("<button type='button' class='annotator-btn' value='" + value._source.label + "' uri='" + value._source.uri + "'>" + label	+ "</button>");
	});
	return items;
}
/*
Annotator.Plugin.Neonion.prototype.overrideAdder = function() {

},*/

Annotator.Plugin.Neonion.prototype.comparator = {
	compareByLabel : function(a, b) {
		if (a.label < b.label)
			return -1;
		if (a.label > b.label)
			return 1;
		return 0;
	}
}

Annotator.Plugin.Neonion.prototype.formatters = {
	formatPerson : function(value) {
		var label = "<span>" + value._source.label + "</span>";
		if (value._source.birth) label += "<small>&nbsp;" + value._source.birth + "</small>";
		//if (value.descr) label += "<br/><small>" + value.descr + "</small>";
		return label;
	},
	formatInstitute : function(value) {
		var label = "<span>" + value.label + "</span>";
		// TODO formatting institute
		return label;
	}
}

Annotator.Plugin.Neonion.prototype.search = {
	searchPerson : function(name, callback) {
	    var url = 'http://elasticsearch.l3q.de/persons/_search?size=10&pretty=true&source={"query":{"fuzzy_like_this":{"fields":["label","alias"],"like_text":"' + name + '"}}}';
	    $.getJSON(url, function(data) {
	        callback(data.hits.hits);
	    });
	},

	searchInstitute : function(callback) {
		var url = 'http://wdq.wmflabs.org/api?q=claim[31:15916302]&callback=?';
		$.getJSON(
		url,
		function(data) {
			var ids = 'q' + data.items.join('|q');
			var url = 'https://www.wikidata.org'+
			'/w/api.php?action=wbgetentities&format=json&props=labels&languagefallback=&ids='+ ids + '&callback=?';
			$.getJSON(
			url,
			function(data) {
				var result = [];
				$.each( data.entities, function( id, entity ) {
					var label = null;
					if(entity.labels) {
						if( entity.labels.de )
							label = entity.labels.de.value;
						else if( entity.labels.en )
							label = entity.labels.en.value;
						else {                     
							//label = entity.labels[getFirst(entity.labels)].value; 
						}
					}
					result.push( { _id : entity.id, _source : { label : label } } );
				});
				//console.log( result );
				callback(result);
			});
		});
	}
}