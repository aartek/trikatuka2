"use strict";

angular.module('trikatuka2').controller('TrackListCtrl', function ($scope, users, Pagination, TrackService, Track, $rootScope) {

    $scope.form = {
        keepOrder: false
    };
    $scope.progress = 0;

    var pagination = $scope.pagination = new Pagination(50);
    pagination.setChangeCallback(load);

    function loadTracks(params) {
        return TrackService.loadTracks(users.user1, params, transformer);
    }

    function load() {
        loadTracks(pagination.getParams()).then(function (playlists) {
            $scope.items = playlists.items;
            pagination.updateTotal(playlists.total);
        });
    }

    function transformer(item) {
        return new Track(item.track, users.user1);
    }

    $scope.transferAll = function () {
        var confirmed = confirm('Are you sure you want to transfer all tracks?');
        if (!confirmed) {
            return;
        }
        $rootScope.$broadcast('DISABLE_VIEW');

        $scope.progress = 0;
        $scope.total = pagination.total;
        function progress(total) {
            $scope.progress++;
            setTimeout(() => {
                $scope.$apply()
            });
        }


        TrackService.transferAll(users.user1, users.user2, $scope.form.keepOrder, progress).then(function () {
            $rootScope.$broadcast('ENABLE_VIEW');
            alert('Transfering tracks done.\n\nYou may need to login again to your Spotify client to see the results.');
            $scope.progress = 0;
        })

    };

    if (users.user1.authData) {
        load();
    }

    $scope.$on('USER_LOGGED_IN', function (event, user) {
        if (user.id === 'user1') {
            load();
        }
    });

    $scope.$on('USER_LOGGED_OUT', function (event, user) {
        if (user.id === 'user1') {
            $scope.items = null;
            pagination.updateTotal(0);
        }
    });
});
