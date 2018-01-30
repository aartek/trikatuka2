"use strict";

angular.module('trikatuka2').controller('AlbumListCtrl', function ($scope, $resource, users, Spotify, Pagination,
    Checkboxes, AlbumService, Album, $rootScope, $q, RequestHelper) {


        var pagination = $scope.pagination = new Pagination();
        pagination.setChangeCallback(load);
    
        function loadAlbums(params){
            return AlbumService.loadAlbums(users.user1, params, transformer);
        }
    
        function load() {
            loadAlbums(pagination.getParams()).then(function (albums) {
                $scope.items = albums.items;
                pagination.updateTotal(albums.total);
            });
        }
    
        function transformer(item) {
            return new Album(item.album, users.user1);
        }
    
        $scope.transferAll = function(){
            var confirmed = confirm('Are you sure you want to transfer all albums?');
            if(!confirmed){
                return;
            }
            $rootScope.$broadcast('DISABLE_VIEW');
            AlbumService.transferAll(users.user1, users.user2).then(function(){
                alert('Transfering albums done.\n\nYou may need to login again to your Spotify client to see the results.');
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
            }
        });
    });
    //# sourceURL=AlbumListCtrl.js