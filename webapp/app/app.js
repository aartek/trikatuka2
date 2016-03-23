var app = angular.module('trikatuka2', ['ngRoute', 'ngResource', 'btford.socket-io', 'ngStorage']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        controller: 'MainCtrl as  mainVM',
        templateUrl: 'partials/main.html'
    }).otherwise({
        redirectTo: '/'
    });
});

app.run(function ($sessionStorage, users, User) {
    users.user1 = new User('user1', $sessionStorage.user1);
    users.user2 = new User('user2', $sessionStorage.user2);
});

app.factory('mySocket', function (socketFactory) {
    return socketFactory();
});


app.service('users', function (User) {
    this.user1 = null;
    this.user2 = null;
});

app.controller('LoginCtrl', function ($scope, users) {
    $scope.user1 = users.user1;
    $scope.user2 = users.user2;

    $scope.$on('DISABLE_VIEW', function(){
        $scope.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function(){
        $scope.viewDisabled = false;
    });
});

app.directive('owner', function($http){
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
})


