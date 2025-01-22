"use strict";

angular.module('trikatuka2').controller('PodcastListCtrl', function ($scope, users, Pagination, PodcastService, Podcast, $rootScope) {


        var pagination = $scope.pagination = new Pagination();
        pagination.setChangeCallback(load);
    
        function loadPodcasts(params){
            return PodcastService.loadPodcasts(users.user1, params, transformer);
        }
    
        function load() {
            loadPodcasts(pagination.getParams()).then(function (res) {
                $scope.items = res.items;
                pagination.updateTotal(res.total);
            });
        }
    
        function transformer(item) {
            return new Podcast(item.show, users.user1);
        }
    
        $scope.transferAll = function(){
            var confirmed = confirm('Are you sure you want to transfer all podcasts?');
            if(!confirmed){
                return;
            }
            $rootScope.$broadcast('DISABLE_VIEW');
            PodcastService.transferAll(users.user1, users.user2).then(function(){
                alert('Transfering podcasts done.\n\nYou may need to login again to your Spotify client to see the results.');
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
    