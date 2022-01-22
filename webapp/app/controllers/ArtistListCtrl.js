"use strict";

angular.module('trikatuka2').controller('ArtistListCtrl', function ($scope, $resource, users, Pagination,
                                                                    Checkboxes, $rootScope, $timeout) {

    var pagination;
    $scope.items = [];

    function initPagination() {
        pagination = $scope.pagination = new Pagination();
        pagination.setChangeCallback(load);
    }

    initPagination();

    function loadArtists(params) {
        var lastArtist = _.last($scope.items);
        var lastArtistId = lastArtist ? lastArtist.id : null;
        return sdk.artistService.loadArtists(users.user1, params, lastArtistId)
    }

    function load() {
        loadArtists(pagination.getParams()).then(function (artists) {
            $scope.items = $scope.items.concat(artists.items)
            pagination.updateTotal(artists.total);
        }).then(function () {
            $timeout(function () {
                $scope.$apply()
            })
        })
    }

    $scope.transferAll = function () {
        var confirmed = confirm('Are you sure you want to transfer all artists?');
        if (!confirmed) {
            return;
        }
        $rootScope.$broadcast('DISABLE_VIEW');
        sdk.artistService.transferAll(users.user1, users.user2)
            .then(function () {
                alert('Transfering artists done.\n\nYou may need to login again to your Spotify client to see the results.');
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
            $scope.items = [];
            initPagination();
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
//# sourceURL=ArtistListCtrl.js
