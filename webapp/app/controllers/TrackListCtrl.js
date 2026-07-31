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
        function progress(transferred) {
            $scope.progress += transferred;
            setTimeout(() => {
                $scope.$apply()
            });
        }


        TrackService.transferAll(users.user1, users.user2, $scope.form.keepOrder, progress).then(function (result) {
            $rootScope.$broadcast('ENABLE_VIEW');

            var msg = sprintf('Transfered %s of %s track(s).\n\n', $scope.progress, $scope.total);
            if (result.fail.length) {
                _.each(result.fail, function (failure) {
                    var body = failure.data && failure.data.error;
                    console.error('Track transfer failed:', failure.status, body ? body.message : failure.data);
                });
                msg += sprintf('%s batch(es) failed, see the browser console for details.\n\n', result.fail.length);
            }
            msg += 'You may need to login again to your Spotify client to see the results.';
            alert(msg);
            $scope.progress = 0;
        }, function (error) {
            $rootScope.$broadcast('ENABLE_VIEW');
            console.error(error);
            alert('Could not read your liked songs. See the browser console for details.');
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
