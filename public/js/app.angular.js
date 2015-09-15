'use strict';

var crawlApp = angular.module('callsApp', ['ngResource', 'ui.router']);


crawlApp.controller('SearchController', ['Call', '$scope', '$stateParams', function(Call, $scope, $stateParams){
    $scope.city = $stateParams.city;
    $scope.calls = Call.query({city : $scope.city});
}]);


crawlApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $stateProvider
        
        .state({
            name : 'calls',
            url  : 'calls'
        })

        .state({
            name         : 'main',
            url          : '/',
            controller   : 'MainController'
        })
    ;

    $urlRouterProvider.otherwise('/');
}]);

crawlApp.controller('MainController', ['$scope', 'Call', '$http', function($scope, Call, $http){

    $scope.queryObject = {};
    $scope.calls = Call.query($scope.queryObject);
    $scope.call = new Call();

    $scope.saveCall = function(){
        $scope.call.$save(function(){
            $scope.call = new Call();
            $scope.calls = Call.query($scope.queryObject);
        });
    };

    $scope.editCall = function(call){
        $scope.call = call;
        $scope.call.expiration = new Date($scope.call.expiration);
    };

    $scope.deleteCall = function(call){
        call.$delete(function(){
            $scope.calls = Call.query($scope.queryObject);
        });
    };

    
    $scope.search = function(){
        console.log($scope.queryObject);
        $scope.calls = Call.query($scope.queryObject);
    };

    $scope.$watch('queryObject', $scope.search, true);


    $http.get('/api/institutions').success(function(data){
        $scope.institutions = data;
    });
    $http.get('/api/cities').success(function(data){
        $scope.cities = data;
    });
}]);

crawlApp.factory('Call', function ($resource) {
    return $resource(
        '/api/call/:Id',
        {
            Id: '@_id'
        },
        {
            'index':   { method: 'GET', isArray: true },
            'update': {
                method: 'PUT'
            }
        }
    );
});

crawlApp.factory('Source', ['$http', function($http){
    var instance = {};
    var host = 'http://127.0.0.1:5000/';

    instance.save = function(payload){
        console.log('Posting to ' + host + 'sources');
        console.log(payload);
        return $http.post(host + 'sources', payload);
    };
    instance.delete = function(id) {
        return $http.delete(host + 'sources', id);
    };
    instance.search = function(param, query) {
        return $http.get(host + 'sources?' + param + '=' + query);    
    };
    instance.index = function() {
        return $http.get(host + 'sources');    
    };
    return instance;
}]);

crawlApp.controller('SourceController', ['$scope', 'Source', '$http', function($scope, Source, $http){
    $scope.source = {name: '', baseUrl : ''};
    
    $scope.sources = [];
    var readSources = function() {
        Source.index().success(function(data) {$scope.sources = data; });   
    };    
    $scope.saveSource = function() {
        Source.save($scope.source).success(function() {
            readSources();
        });
    };
    $scope.editCall = function(source){
        $scope.source = source;
    };

    $scope.deleteCall = Source.delete($scope.source._id);
    readSources();
    // $scope.search = Source.search('name', $scope.queryObject);

}]);