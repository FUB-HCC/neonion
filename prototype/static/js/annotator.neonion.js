Annotator.Plugin.Neonion = function (element, options) {
    
    return {

		pluginInit : function () {

			var anno = this.annotator;

			this.annotator.viewer.addField({
				load: function (field, annotation) {
					field.innerHTML = "Person";
				}
			})

			// neues Feld im Editor erzeugen
			/*
			this.annotator.editor.addField({
				label: 'Name',
				type: 'input',
				load: this.updateField,
				submit: this.setAnnotationTags
			});
			*/

			this.annotator.subscribe("annotationCreated", function (annotation) {
				// update annotation object
				annotation.rdf = { 
					typeof : "dbpedia:Country",
					property : "rdfs:label",
					about : "http://www.loomp.org/dic/pi/0.1/PFXEMONGDGT4ZP7U8NWKJ0ZAR05CN298"
				 };

				// add RDFa attributes to markup
				annotation.highlights[0].setAttribute("typeof", annotation.rdf.typeof);
				annotation.highlights[0].setAttribute("property", annotation.rdf.property);
				annotation.highlights[0].setAttribute("about", annotation.rdf.about);
				
				//console.log(annotation.highlights[0]);	
				//console.log(anno);	

			});
			
		}
	}

};