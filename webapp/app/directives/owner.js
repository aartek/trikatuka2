"use strict";


angular.module('trikatuka2').directive('owner', function($http){
    return {
        require: 'ngModel',
        template: '<span>{{owner.display_name || owner.id}}</span>',
        replace: true,
        scope:{},
        link: function(scope,elem,attrs,ngModel){
            ngModel.$render = function(){
                $http.get(ngModel.$modelValue.href).then(function(response){
                    scope.owner = response.data;
                });
            };
        }
    }
});
