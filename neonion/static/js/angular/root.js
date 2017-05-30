neonionApp
    .run(function ($rootScope) {

        /**
         * Transform the given data to a CSV export
         */
        $rootScope.exportCSV = function (data, properties, separator) {
            separator = separator || ';'
            var csvContent = 'data:text/csv;charset=utf-8,';
            // create array to store lines
            var lines = [];
            // add header information
            lines.push(properties.join(separator));
            // create array to store each field value
            var fields = [];
            fields.length = properties.length;

            // iterate over data items
            data.forEach(function (item) {
                // iterate over specified properties
                properties.forEach(function (property, index) {
                    var subValue = item;
                    // split property into keys
                    var keys = property.split('.');
                    // iterate over keys in current property
                    for (var i = 0; i < keys.length; i++) {
                        if (subValue.hasOwnProperty(keys[i])) {
                            subValue = subValue[keys[i]];
                        }
                        else {
                            subValue = '';
                            // exit if current key not exists
                            break;
                        }
                    }
                    // write value to field set
                    fields[index] = JSON.stringify(subValue);
                });
                lines.push(fields.join(separator));
            });
            // closure
            return csvContent + lines.join('%0A');
        };

    });