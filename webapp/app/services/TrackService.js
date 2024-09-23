"use strict";

angular.module('trikatuka2').service('TrackService', function (Spotify, $q, RequestHelper, $timeout) {
    this.loadTracks = function(user, params, itemsTransformer){
        return Spotify.get('https://api.spotify.com/v1/me/tracks', user, params).then(function(response){
            return {
                items: itemsTransformer ? _.map(response.data.items, itemsTransformer) : response.data.items,
                total: response.data.total
            }
        });
    };

    this.transferAll = function(user, targetUser){
        var deferred = $q.defer();

        var url = 'https://api.spotify.com/v1/me/tracks';
        function Page(items){
            this.items = items;

            this.transfer = function () {
                return Spotify.put(url, targetUser, {ids: this.items});
            }
        }

        getAll(user).then(function(tracks){
            var pages = Math.ceil(tracks.length / 50);

            var toTransfer = [];
            for(var i=0; i<pages; i++) {
                var data  = tracks.slice(i * 50, (i * 50) + 50);
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
        var url = 'https://api.spotify.com/v1/me/tracks';
        var params = {
            limit: 1,
            offset: 0
        };
        Spotify.get(url, user, params).then(function(response){
            var total = response.data.total;
            var tracks = [];

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
                    tracks = tracks.concat(items);
                });
                deferred.resolve(tracks);
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
            return item.track.id;
        });
    }
});