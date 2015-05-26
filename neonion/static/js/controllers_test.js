describe('Testing the controller called AnnotationSetCtrl', function() {

    var ctrl, scope, httpMock;

    beforeEach(module('neonionApp'));

    beforeEach(inject(function($controller, $rootScope, $httpBackend) {

        httpMock = $httpBackend;

        scope = $rootScope.$new();

        httpMock.when('GET', '/api/annotationsets').respond("some annotationssets");

        ctrl = $controller('AnnotationSetCtrl', {
            '$scope': scope
        });
    }));

    it("gets the list of annotationsets and assigns it to scope", function() {
      httpMock.expectGET('/api/annotationsets');
      httpMock.flush();
      expect(scope.annotationsets).toMatch("some annotationssets");
    });
});