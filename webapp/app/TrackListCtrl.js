"use strict";

app.controller('TrackListCtrl', function ($scope, $resource, users, Spotify, Pagination, TrackService, Track, $rootScope, $q) {

    var pagination = $scope.pagination = new Pagination();
    pagination.setChangeCallback(load);

    function loadTracks(params){
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

    $scope.transferAll = function(){
        $rootScope.$broadcast('DISABLE_VIEW');
        TrackService.transferAll(users.user1, users.user2).then(function(){
            alert('Transfering tracks done.\n\nYou may need to login again to your Spotify client to see the results.');
            $rootScope.$broadcast('ENABLE_VIEW');
        });

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
            checkboxes.clearCache();
            checkboxes.removeCheckboxes()
        }
    });
});
