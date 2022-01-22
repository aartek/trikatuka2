window.sdk = sdk.create()
var app = angular.module('trikatuka2', ['ngRoute', 'ngResource']);

angular.module('trikatuka2').config(function ($routeProvider) {
    $routeProvider.when('/', {
        controller: 'MainCtrl as  mainVM',
        templateUrl: 'partials/main.html'
    })
        .when('/help', {
            controller: 'HelpCtrl',
            templateUrl: 'partials/help.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});

angular.module('trikatuka2').run(function (users) {
    users.user1 = sdk.authService.getUser('SOURCE_USER')
    users.user2 = sdk.authService.getUser('TARGET_USER');
});
//# sourceURL=app.js

