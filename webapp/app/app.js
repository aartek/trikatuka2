var app = angular.module('trikatuka2', ['ngRoute', 'ngResource', 'btford.socket-io', 'ngStorage']);

angular.module('trikatuka2').config(function ($routeProvider) {
    $routeProvider.when('/', {
        controller: 'MainCtrl as  mainVM',
        templateUrl: 'partials/main.html'
    }).otherwise({
        redirectTo: '/'
    });
});

angular.module('trikatuka2').run(function ($sessionStorage, users, User) {
    users.user1 = new User('user1', $sessionStorage.user1);
    users.user2 = new User('user2', $sessionStorage.user2);
});
//# sourceURL=app.js

