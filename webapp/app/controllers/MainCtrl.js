"use strict";

angular.module('trikatuka2').controller('MainCtrl', function ($scope, users){
    var self = this;
    self.viewDisabled = false;
    self.user1 = users.user1;
    self.user2 = users.user2;

    $scope.$on('DISABLE_VIEW', function () {
        self.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function () {
        self.viewDisabled = false;
    });
});
