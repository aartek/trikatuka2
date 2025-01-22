"use strict";

angular.module('trikatuka2').service('PodcastService', function (Spotify, $q, RequestHelper, $timeout) {
    this.loadPodcasts = function(user, params, itemsTransformer){
        return Spotify.get('https://api.spotify.com/v1/me/shows', user, params).then(function(response){
            return {
                items: itemsTransformer ? _.map(response.data.items, itemsTransformer) : response.data.items,
                total: response.data.total
            }
        });
    };

    this.transferAll = function(user, targetUser){
        var deferred = $q.defer();

        var url = 'https://api.spotify.com/v1/me/shows';
        function Page(items){
            this.items = items;

            this.transfer = function () {
                return Spotify.put(url, targetUser, {}, {ids: this.items.join(',')});
            }
        }

        getAll(user).then(function(podcasts){
            var pages = Math.ceil(podcasts.length / 50);

            var toTransfer = [];
            for(var i=0; i<pages; i++) {
                var data  = podcasts.slice(i * 50, (i * 50) + 50);
                toTransfer.push(new Page(data));
            }
            return RequestHelper.doAction('transfer',toTransfer).then(function () {
                deferred.resolve();
            });

        });
        return deferred.promise;
    };

    function getAll(user){
        var deferred = $q.defer();
        var url = 'https://api.spotify.com/v1/me/shows';
        var params = {
            limit: 1,
            offset: 0
        };
        Spotify.get(url, user, params).then(function(response){
            var total = response.data.total;
            var podcasts = [];

            function Page(params) {
                this.getItems = function () {
                    return load(url,user,params)
                }
            }

            var pages = Math.ceil(total / 50);
            var pagesToLoad = [];
            for(var i=0; i<pages; i++) {
                var params = {
                    limit: 50,
                    offset: i*50
                };
                pagesToLoad.push(new Page(params));
            }
            
            return RequestHelper.doAction('getItems',pagesToLoad).then(function (result) {
                _.each(result.success, function (items) {
                    podcasts = podcasts.concat(items);
                });
                deferred.resolve(podcasts);
            }); 

        });
        return deferred.promise;
    }

    function load(url, user, params){
        return Spotify.get(url, user, params).then(function(response){
            return getIds(response.data.items);
        });
    }

    function getIds(items){
        return _.map(items, function(item){
            return item.show.id;
        });
    }
});
