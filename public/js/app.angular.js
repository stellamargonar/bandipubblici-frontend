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
    var host = '/crawler/';

    instance.save = function(payload){
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

    readSources();
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
crawlApp.controller('DataCleanController', ['$scope', 'Source', 'Call', '$http', '$stateParams', function($scope, Source, Call, $http, $stateParams){
    var host = '/crawler/';

    $scope.unvalidated = [];
    $scope.candidates = {};
    $scope.selectMerge = {};

    $scope.city = $stateParams.city;
    $scope.calls = Call.query({city : $scope.city});

    var retrieveUnvalidatedInstitutions = function () {
        $scope.unvalidated = [];
        var promise = $http.get(host + 'clean/unvalidated');    
        promise.success(function(data) {
            $scope.unvalidated = data;
        });
    };

    $scope.updateSingle = function (name, valid_name) {
        console.log('Updating');
        var payload = {
            name : name,
            valid_name : valid_name 
        };
        console.log(payload);
        var promise = $http.post(host + 'clean/update', payload);
        promise.success(function() {
            console.log('Return success');
            retrieveUnvalidatedInstitutions();
        });
    };

    $scope.retrieveSimilarName = function(name, index) {
        var promise = $http.get(host + 'clean/find?name=' + name);
        promise.success(function(data) {
            $scope.candidates[name] = data;
        });
    };

    $scope.selectAllBox = false;
    $scope.selectAll = function() {
        if ($scope.selectAllBox) {
            $scope.selectMerge = {}
            for (var c in $scope.calls) {
                $scope.selectMerge[$scope.calls[c]._id] = true; 
            }   
        }
        else {
            $scope.selectMerge = {};
        }
    }

    $scope.merge = function() {
        console.log('Called merge');
        var idsToMerge = [];
        for (var k in $scope.selectMerge) {
            if ($scope.selectMerge[k])
                idsToMerge.push(k);           
        }
        $scope.selectMerge = {};
    
        console.log(idsToMerge);
        if (idsToMerge.length <= 1)
            return;

        // idsToMerge.splice(1);
        var base = idsToMerge[0];
        var payload = {
            baseCall : base,
            calls : idsToMerge.splice(1)
        };
        console.log(payload);

        $http.post(host + 'clean/mergeCall', payload)
            .success(function(data) {
                $scope.search();
            });
        
    }

    $scope.search = function(){
        console.log($scope.queryObject);
        $scope.calls = Call.query($scope.queryObject);
        $scope.selectAllBox = false;
    };
    $scope.deleteCall = function(call){
        call.$delete(function(){
            $scope.calls = Call.query($scope.queryObject);
        });
    };
    $scope.queryObject = {};
    $scope.$watch('queryObject', $scope.search, true);


    retrieveUnvalidatedInstitutions();
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
