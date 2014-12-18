(function () {
    "use strict"; // enable strict mode
    var selectedDocs = [];
    var docList = [];

    $(document).ready(function() {
        $( "#document-import-list" ).selectable();

        $("#btn-import").click(function() {
            $("#btn-import").attr("disabled", true);
            importSelectedDocuments();
            return false;
        });

        refreshDocuments();
    });

    function refreshDocuments() {
        $.getJSON("/documents/cms/list/", function(data) {
            docList = data;
            // clear list
            $("#document-import-list").html('');
            // create document import list
            $.each(data, function(index, value) {
                // var item = new Option( value.urn, value.name );
                var item = $('<li></li>').attr( 'id', value.urn ).text( value.name );
                $('#document-import-list').append( item );
            });
        });
    }

    function importSelectedDocuments(){
        $("#btn-import").prop('disabled', true);

        $('.ui-selected').each(function() {
            selectedDocs.push( this.id );
        });

        importNextDocument();
    }

    function importNextDocument() {
        if (selectedDocs.length > 0) {
            var urn = selectedDocs.shift();
            console.log("Import document " + urn);
            $.getJSON("/documents/cms/import/" + urn, function(data) {
                importNextDocument();
            });
        }
        else {
            window.location = "/";
        }
    }
})();
