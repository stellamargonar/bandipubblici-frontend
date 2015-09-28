'use strict';

var crawlApp = angular.module('callsApp', ['ngResource', 'ui.router']);

crawlApp.directive('callType', function() {
    return {
        restrict : 'E',
        scope : { type : '='},
        controller : ['$scope', function ($scope) {
            $scope.labelClass = 'label-default';
            if ($scope.type == 'ricerca')
                $scope.labelClass = 'label-success';
            if ($scope.type == 'sanità')
                $scope.labelClass = 'label-primary';
            if ($scope.type == 'premio')
                $scope.labelClass = 'label-warning';
        }],
        template : '<span class="label {{labelClass}}">{{type}}</span>',

    }
});

crawlApp.controller('SearchController', ['Call', '$scope', '$stateParams', function(Call, $scope, $stateParams){
    $scope.city = $stateParams.city;
    $scope.calls = Call.query({city : $scope.city});
}]);


crawlApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $stateProvider
        
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
    $http.get('/api/types').success(function(data){
        $scope.types = data;
    });
}]);


crawlApp.controller('InstitutionController', ['$scope', 'Call', '$http', 'Institution', function($scope, Call, $http, Institution){
    $scope.queryObject = {
        institution: Institution
    };

    $scope.calls = Call.query($scope.queryObject);
    
    $scope.search = function(){
        $scope.calls = Call.query($scope.queryObject);
    };

    $scope.$watch('queryObject', $scope.search, true);

    $http.get('/api/institutions').success(function(data){
        $scope.institutions = data;
    });
    $http.get('/api/cities').success(function(data){
        $scope.cities = data;
    });
    $http.get('/api/types').success(function(data){
        $scope.types = data;
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
        return $http.delete(host + 'sources/' +  id);
    };
    instance.search = function(param, query) {
        return $http.get(host + 'sources?' + param + '=' + query);    
    };
    instance.index = function() {
        return $http.get(host + 'sources');    
    };
    instance.test = function(payload) {
        return $http.post(host + 'sources/test', payload);
    };
    instance.crawl = function(id) {
        if (id) 
            return $http.post(host + 'sources/crawl/' + id);
        else
            return $http.post(host + 'sources/crawl');
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
            $scope.source = {};
            readSources();
        });
    };
    $scope.editSource = function(source){
        $scope.source = source;
    };
    $scope.testSource  = function(source) {
        $scope.testCalls = undefined;
        $scope.error = undefined;

        if (!$scope.source.baseUrl)
            return
        var promise = Source.test($scope.source);
        promise.success(function(data) {
            $scope.testCalls = data;
        });
        promise.error(function(error) {
            $scope.error = error;
        });
    };

    $scope.deleteSource = function(source) {
        Source.delete(source._id).success(function() {
            readSources();
        });
    };

    $scope.crawlSource = function(source) {
        Source.crawl(source._id).success(function(data) {
            $scope.output = data;
        })
    }

 

    $scope.deleteCall = Source.delete($scope.source._id);
    readSources();
    // $scope.search = Source.search('name', $scope.queryObject);
    $scope.pattern  = {title: '', pattern : ''};
    $scope.addPattern = function() {
        $scope.source.pattern = $scope.source.pattern || {};
        $scope.source.pattern[$scope.pattern.title] = $scope.pattern.pattern;
        $scope.pattern  = {title: '', pattern : ''};
    }
    $scope.removePattern = function(key) {
        if ($scope.source.pattern[key])
            delete $scope.source.pattern[key]
    }
 }]);