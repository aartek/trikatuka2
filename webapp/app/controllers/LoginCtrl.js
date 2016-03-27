"use strict";

angular.module('trikatuka2').controller('LoginCtrl', function ($scope, users) {
    $scope.user1 = users.user1;
    $scope.user2 = users.user2;

    $scope.$on('DISABLE_VIEW', function(){
        $scope.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function(){
        $scope.viewDisabled = false;
    });
});
//# sourceURL=LoginCtrl.js
