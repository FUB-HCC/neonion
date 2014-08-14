Annotator.Plugin.Neonion = function (element, options) {

	var user;

    return {

		pluginInit : function () {
			
			// add field to linked person
			this.annotator.viewer.addField({
				load: function (field, annotation) {
					field.innerHTML = Annotator.Plugin.Neonion.prototype.literals['de'].person + ": <a href='" + annotation.rdf.about + "' target='blank'>" + annotation.rdf.label + "</a>";
				}
			});
			// add field with creator
			this.annotator.viewer.addField({
				load: function (field, annotation) {
					var userField = Annotator.Plugin.Neonion.prototype.literals['de'].unknown;
					if (annotation.creator) {
						userField = annotation.creator.email;
					}
					field.innerHTML = Annotator.Plugin.Neonion.prototype['de'].literals.creator + ": " + userField + "</a>";
				}
			});

			// add field containing the suggested ressources
			var suggestionField = this.annotator.editor.addField({
				load: this.updateSuggestionField,
				submit: this.pluginSubmit
			});
			$(suggestionField).children((":first")).replaceWith("<div class='btn-group-vertical'></div>");
			$(suggestionField).click(function (e) {
				var source = $(e.target);

				source.parent().children().removeClass("active");
				$(source).addClass("active");
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
				typeof : "dbpedia-owl:Person",
				property : "rdfs:label",
				about : activeItem.attr("uri"),
				label : activeItem.text()
			 };
		},

		updateSuggestionField : function(field, annotation) {
			// get selected text
			var words = annotation.quote.split(" ");
			var list = $(field).children(":first");
			var associatedUri = annotation.rdf ? annotation.rdf.about : "";
			list.empty();

			options.wikiData.search_items(words[words.length - 1], function(wdID) {
				options.wikiData.get_person_data(wdID.join('|'), function(persons) {
					// sort list
					persons.sort(Annotator.Plugin.Neonion.prototype.compareByLabel);
					persons.unshift(Annotator.Plugin.Neonion.prototype.surrogate.unknownPerson);
					// add items
					$.each(persons, function(index, value) {
						list.append(
							"<button type='button' class='annotator-btn' uri='" + options.wikiData.prefix +  value.id + "'>" 
							+ Annotator.Plugin.Neonion.prototype.formatters.personLabel(value)
							+ "</button>"
						);
						if (associatedUri == value.id) {
							list.children(":last").addClass("btn-active");
						}
					});
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
		creator : "Erfasser", unknown : "Unbekannt"
	}
}

Annotator.Plugin.Neonion.prototype.surrogate = {
	unknownPerson : { label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownPerson, id : "http://neonion.com/resource/Unknown_Person" },
	unknownInstitute : { label : Annotator.Plugin.Neonion.prototype.literals['de'].unknownInstitute, id : "http://neonion.com/resource/Unknown_Institute" }
}

Annotator.Plugin.Neonion.prototype.enrichRDFa = function(annotation) {
	// add RDFa attributes to markup
	annotation.highlights[0].setAttribute("typeof", annotation.rdf.typeof);
	annotation.highlights[0].setAttribute("property", annotation.rdf.property);
	annotation.highlights[0].setAttribute("about", annotation.rdf.about);
}

Annotator.Plugin.Neonion.prototype.compareByLabel = function(a, b) {
	if (a.label < b.label)
		return -1;
	if (a.label > b.label)
		return 1;
	return 0;
}

Annotator.Plugin.Neonion.prototype.formatters = {

	personLabel : function(value) {
		var label = "<span>" + value.label + "</span>";
		if (value.birth) label += "<small>&nbsp;" + value.birth + "</small>";
		return label;
	},

	instituteLabel : function(value) {
		var label = "<span>" + value.label + "</span>";
		// TODO
		return label;
	}
}