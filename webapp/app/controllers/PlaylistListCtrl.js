"use strict";

angular.module('trikatuka2').controller('PlaylistListCtrl', function ($scope, $resource, users, Spotify, Pagination,
    Checkboxes, PlaylistService, Playlist, $rootScope, $q, RequestHelper) {

    var pagination = $scope.pagination = new Pagination();
    pagination.setChangeCallback(load);

    var checkboxes = $scope.checkboxes = new Checkboxes();

    function loadPlaylists(params){
        return PlaylistService.loadPlaylists(users.user1, params, transformer);
    }

    function load() {
        loadPlaylists(pagination.getParams()).then(function (playlists) {
            checkboxes.pageSwitch();
            $scope.items = playlists.items;
            pagination.updateTotal(playlists.total);
        });
    }

    load();

    function transformer(item) {
        return new Playlist(item, users.user1);
    }

    $scope.transferAll = function(){
        var confirmed = confirm('Are you sure you want to transfer all playlists?');
        if(!confirmed){
            return;
        }
        var playlists = [];
        var collectingPlaylistsPromises = [];

        var pages = Math.ceil(pagination.total / 50);
        for (var i = 0; i<pages; i++){
            collectingPlaylistsPromises.push(loadPlaylists({limit: 50, offset: i * 50}).then(function(result){
                playlists = playlists.concat(result.items);
            }));
        }

        $q.all(collectingPlaylistsPromises).then(function(){
            transfer(playlists.reverse());
        });
    };

    $scope.transferSelected = function () {
        var confirmed = confirm('Are you sure you want to transfer selected playlists?');
        if(!confirmed){
            return;
        }
        var items = _.toArray(checkboxes.cache);
        transfer(items);
    };

    function transfer(items){
        $rootScope.$broadcast('DISABLE_VIEW');

        RequestHelper.doAction('transfer', items, [users.user2]).then(function (result) {
            var successNames = _.map(result.success, function (item) {
                return item.playlist.name
            });

            var failedNames = _.map(result.fail, function (item) {
                return item.playlist.name
            });

            $rootScope.$broadcast('ENABLE_VIEW');
            checkboxes.clearCache();

            var msg = '';
            if(successNames.length) {
                msg += sprintf('Successfully transfered playlist(s):\n%s\n\n', successNames.join(',\n'));
            }
            if(failedNames.length) {
                msg += sprintf('Failed to transfer playlist(s):\n%s', failedNames.join(',\n'));
            }
            msg +='\nYou may need to login again to your Spotify client to see the results.';
            alert(msg);
        });
    }

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

    $scope.$on('DISABLE_VIEW', function () {
        $scope.viewDisabled = true;
    });

    $scope.$on('ENABLE_VIEW', function () {
        $scope.viewDisabled = false;
    });
});
//# sourceURL=PlaylistListCtrl.js