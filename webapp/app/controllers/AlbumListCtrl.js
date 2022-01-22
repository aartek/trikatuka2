"use strict";

angular.module('trikatuka2').controller('AlbumListCtrl', function ($scope, $resource, users, Pagination,
                                                                   Checkboxes, $rootScope, $timeout) {


    var pagination = $scope.pagination = new Pagination();
    pagination.setChangeCallback(load);

    function loadAlbums(params) {
        return sdk.albumService.loadAlbums(users.user1, params);
    }

    function load() {
        loadAlbums(pagination.getParams()).then(function (albums) {
            $scope.items = albums.items;
            pagination.updateTotal(albums.total);
        })
            .then(function () {
                $timeout(function () {
                    $scope.$apply()
                })
            })
    }


    $scope.transferAll = function () {
        var confirmed = confirm('Are you sure you want to transfer all albums?');
        if (!confirmed) {
            return;
        }
        $rootScope.$broadcast('DISABLE_VIEW');
        sdk.albumService.transferAll(users.user1, users.user2)
            .then(function () {
                alert('Transfering albums done.\n\nYou may need to login again to your Spotify client to see the results.');
                $rootScope.$broadcast('ENABLE_VIEW');
                $timeout(function () {
                    $scope.$apply()
                })
            });

    };

    if (users.user1) {
        load();
    }

    $scope.$on('USER_LOGGED_IN', function (event, user) {
        if (user.type === 'SOURCE_USER') {
            load();
        }
    });

    $scope.$on('USER_LOGGED_OUT', function (event, userType) {
        if (userType === 'SOURCE_USER') {
            $scope.items = null;
            pagination.updateTotal(0);
        }
    });
});
//# sourceURL=AlbumListCtrl.js
