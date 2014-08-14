Annotator.Plugin.Neonion = function (element, options) {

	var user;

    return {

		pluginInit : function () {
			
			// add field to linked person
			this.annotator.viewer.addField({
				load: function (field, annotation) {
					if (annotation.rdf) {
						var fieldValue = "<a href='" + annotation.rdf.about + "' target='blank'>" + annotation.rdf.label + "</a>";
						var fieldCaption;
						switch(annotation.rdf.typeof) {
							case Annotator.Plugin.Neonion.prototype.surrogate.person:
								fieldCaption = Annotator.Plugin.Neonion.prototype.literals['de'].person; break;
							case Annotator.Plugin.Neonion.prototype.surrogate.institute:
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
				typeof : Annotator.Plugin.Neonion.prototype.surrogate.person,
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
			options.wikiData.search_items(words[words.length - 1], function(wdID) {
				options.wikiData.get_person_data(wdID.join('|'), function(items) {
					// sort list
					items.sort(Annotator.Plugin.Neonion.prototype.comparator.compareByLabel);
					// add surogate for unknown resource
					items.unshift(Annotator.Plugin.Neonion.prototype.surrogate.unknownPerson);
					// create and add items
					list.append(Annotator.Plugin.Neonion.prototype.createListItems(items, Annotator.Plugin.Neonion.prototype.formatters.formatPerson));
				
					// activae corresponding button
					if (annotation.rdf) {
						list.children("button[uri='" + annotation.rdf.about + "']" ).addClass("active");
					}
				});
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
	person : { label : Annotator.Plugin.Neonion.prototype.literals['de'].person, uri : "https://www.wikidata.org/wiki/Q5" },
	institute : { label : Annotator.Plugin.Neonion.prototype.literals['de'].institute, uri : "https://www.wikidata.org/wiki/Q31855" },
	unknownPerson : { label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownPerson, uri : "http://neonion.com/resource/Unknown_Person" },
	unknownInstitute : { label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownInstitute, uri : "http://neonion.com/resource/Unknown_Institute" }
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
		items.push("<button type='button' class='annotator-btn' value='" + value.label + "' uri='" + value.uri + "'>" + label	+ "</button>");
	});
	return items;
}

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
		var label = "<span>" + value.label + "</span>";
		if (value.birth) label += "<small>&nbsp;" + value.birth + "</small>";
		//if (value.descr) label += "<br/><small>" + value.descr + "</small>";
		return label;
	},
	formatInstitute : function(value) {
		var label = "<span>" + value.label + "</span>";
		// TODO formatting institute
		return label;
	}
}