"use strict";

angular.module('trikatuka2').controller('LoginCtrl', function ($scope, $timeout, users, AuthService) {
    $scope.user1 = users.user1;
    $scope.user2 = users.user2;

    function handleLoginLogout() {
        $scope.user1 = users.user1;
        $scope.user2 = users.user2;
        $timeout(function () {
            $scope.$apply()
        })
    }

    $scope.$on('USER_LOGGED_IN', handleLoginLogout);
    $scope.$on('USER_LOGGED_OUT', handleLoginLogout);

    $scope.login = function (userType) {
        AuthService.login(userType)
    }

    $scope.logout = function (userType) {
        AuthService.logout(userType)
    }

    $scope.$on('DISABLE_VIEW', function () {
        $scope.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function () {
        $scope.viewDisabled = false;
    });
});
//# sourceURL=LoginCtrl.js
