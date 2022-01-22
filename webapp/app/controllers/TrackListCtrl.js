"use strict";

angular.module('trikatuka2').controller('TrackListCtrl', function ($scope, $resource, users, Pagination, $rootScope, $timeout) {

    var pagination = $scope.pagination = new Pagination();
    pagination.setChangeCallback(load);

    function loadTracks(params) {
        return sdk.trackService.loadAlbums(users.user1, params)
    }

    function load() {
        loadTracks(pagination.getParams()).then(function (playlists) {
            $scope.items = playlists.items;
            pagination.updateTotal(playlists.total);
        }).then(function () {
            $timeout(function () {
                $scope.$apply()
            })
        })
    }

    $scope.transferAll = function () {
        var confirmed = confirm('Are you sure you want to transfer all tracks?');
        if (!confirmed) {
            return;
        }
        $rootScope.$broadcast('DISABLE_VIEW');
        sdk.trackService.transferAll(users.user1, users.user2).then(function () {
            alert('Transfering tracks done.\n\nYou may need to login again to your Spotify client to see the results.');
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
//# sourceURL=TrackListCtrl.js
