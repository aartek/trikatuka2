"use strict";

angular.module('trikatuka2').controller('PlaylistListCtrl', function ($scope, $resource, users, Pagination,
                                                                      Checkboxes, $rootScope, $timeout) {

    var pagination = $scope.pagination = new Pagination();
    pagination.setChangeCallback(load);

    var checkboxes = $scope.checkboxes = new Checkboxes();

    function loadPlaylists(params) {
        return sdk.playlistService.loadPlaylists(users.user1, params)
    }

    function load() {
        loadPlaylists(pagination.getParams()).then(function (playlists) {
            checkboxes.pageSwitch();
            $scope.items = playlists.items;
            pagination.updateTotal(playlists.total);
        }).then(function () {
            $timeout(function () {
                $scope.$apply()
            })
        });
    }

    load();

    $scope.transferAll = function () {
        var confirmed = confirm('Are you sure you want to transfer all playlists?');
        if (!confirmed) {
            return;
        }
        $rootScope.$broadcast('DISABLE_VIEW');
        sdk.playlistService.transferAll(users.user1, users.user2).then(stats => {
            $rootScope.$broadcast('ENABLE_VIEW');
            checkboxes.clearCache();

            var msg = '';
            if (stats.succeeded.length) {
                msg += `Successfully transfered playlist(s):\n${stats.succeeded.join(',\n')}\n\n`;
            }
            if (stats.failed.length) {
                msg += `Failed to transfer playlist(s):\n${failedNames.join(',\n')}`;
            }
            msg += '\nYou may need to login again to your Spotify client to see the results.';
            alert(msg);
            $timeout(function () {
                $scope.$apply()
            })
        })
    };

    $scope.transferSelected = function () {
        var confirmed = confirm('Are you sure you want to transfer selected playlists?');
        if (!confirmed) {
            return;
        }
        var items = _.toArray(checkboxes.cache);

        $rootScope.$broadcast('DISABLE_VIEW');
        sdk.playlistService.transferPlaylists(items, users.user1, users.user2)
            .then(stats => {
                $rootScope.$broadcast('ENABLE_VIEW');
                checkboxes.clearCache();

                var msg = '';
                if (stats.succeeded.length) {
                    msg += `Successfully transfered playlist(s):\n${stats.succeeded.map((playlist) => playlist.name).join(',\n')}\n\n`;
                }
                if (stats.failed.length) {
                    msg += `Failed to transfer playlist(s):\n${stats.failed.map((playlist) => playlist.name).join(',\n')}`;
                }
                msg += '\nYou may need to login again to your Spotify client to see the results.';
                alert(msg);
                $timeout(function () {
                    $scope.$apply()
                })
            })
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
            checkboxes.clearCache();
            checkboxes.removeCheckboxes()
        }
    });

    $scope.$on('DISABLE_VIEW', function () {
        $scope.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function () {
        $scope.viewDisabled = false;
    });
});
//# sourceURL=PlaylistListCtrl.js
