"use strict";

angular.module('trikatuka2').service('AuthService', function ($rootScope, $timeout, users) {

    this.login = function (userType) {
        sdk.authService.openWindow(userType)

        var interval = setInterval(function () {
            var user = sdk.authService.getUser(userType)
            if (user) {
                if (userType === 'SOURCE_USER') {
                    users.user1 = user
                } else if (userType === 'TARGET_USER') {
                    users.user2 = user
                }
                $rootScope.$broadcast('USER_LOGGED_IN', user);
                clearInterval(interval)
            }
        }, 5)
    }

    this.logout = function (userType) {
        sdk.authService.logout(userType);
        if (userType === 'SOURCE_USER') {
            users.user1 = null
        } else if (userType === 'TARGET_USER') {
            users.user2 = null
        }
        $rootScope.$broadcast('USER_LOGGED_OUT', userType);
        $timeout(function (){
            $rootScope.$apply()
        })
    }

});
