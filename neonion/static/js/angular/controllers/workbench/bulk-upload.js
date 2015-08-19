neonionApp.controller('BulkUploadCtrl', ['$scope', 'Upload',
        function ($scope, Upload) {

            $scope.form = {
                index: "",
                type: "",
                upload : {
                    uploading : false,
                    progress : 0
                }
            };
            $scope.upload = null;

            $scope.validate = function() {
                return !$scope.form.upload.uploading &&
                    $scope.form.index.length > 0 &&
                    $scope.form.type.length > 0;
            };

            $scope.uploadFile = function (file) {
                if ($scope.validate()) {
                    $scope.form.upload.uploading = true;
                    $scope.form.upload.progress = 0;

                    $scope.upload = Upload.upload({
                        url: 'api/es/import/' + $scope.form.index,
                        fields: $scope.form,
                        file: file
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.form.upload.progress = progressPercentage;
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        $scope.form.upload.uploading = false;
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                    }).error(function (data, status, headers, config) {
                        $scope.form.upload.uploading = false;
                        console.log('error status: ' + status);
                    })
                }
            };

            $scope.cancelUpload = function() {
                if ($scope.form.upload.uploading) {
                    $scope.upload.abort();
                    $scope.form.upload.uploading = false;
                    $scope.form.upload.progress = 0;
                }
            }
        }]
);
