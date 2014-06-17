Annotator.Plugin.Neonion = function (element, options) {
    
    return {

		pluginInit : function () {

			this.annotator.viewer.addField({
				load: function (field, annotation) {
					field.innerHTML = "Testfield";
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
				//alert("edit");
				// RDFa zu annotation Objekt hinzufügen
				// Markup updaten
			});

		}
	}

};