"use strict";

angular.module('trikatuka2').controller('ArtistListCtrl', function ($scope, users, Pagination,
    ArtistService, Artist, $rootScope) {

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
        return ArtistService.loadArtists(users.user1, params, lastArtistId, transformer);
    }

    function load() {
        loadArtists(pagination.getParams()).then(function (artists) {
            $scope.items = $scope.items.concat(artists.items)
            pagination.updateTotal(artists.total);
        });
    }

    function transformer(item) {
        return new Artist(item, users.user1);
    }

    $scope.transferAll = function () {
        var confirmed = confirm('Are you sure you want to transfer all artists?');
        if (!confirmed) {
            return;
        }
        $rootScope.$broadcast('DISABLE_VIEW');
        ArtistService.transferAll(users.user1, users.user2).then(function () {
            alert('Transfering artists done.\n\nYou may need to login again to your Spotify client to see the results.');
            $rootScope.$broadcast('ENABLE_VIEW');
        });

    };

    if (users.user1.authData) {
        load();
    }

    $scope.$on('USER_LOGGED_IN', function (event, user) {
        if (user.id === 'user1') {
            $scope.items = [];
            initPagination();
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
