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

    this.transferAll = function(user, targetUser, keepOrder, notifier){
        var deferred = $q.defer();

        function Page(items){
            this.items = items;

            this.transfer = function (notifier) {
                return Spotify.saveToLibrary(items, targetUser).then(function () {
                    if (notifier) {
                        notifier(items.length);
                    }
                    if (!keepOrder) {
                        return;
                    }
                    //needed because it seems that tracks are sorted by saved date
                    var sleep = $q.defer();
                    setTimeout(() => {
                        sleep.resolve();
                    }, 1000);
                    return sleep.promise;
                });
            }
        }

        getAll(user).then(function(tracks){
            tracks.reverse()
            var size = keepOrder ? 1 : Spotify.SAVE_LIBRARY_BATCH_SIZE;
            var pages = Math.ceil(tracks.length / size);

            var toTransfer = [];
            for(var i=0; i<pages; i++) {
                var data  = tracks.slice(i * size, (i * size) + size);
                toTransfer.push(new Page(data));
            }
            return RequestHelper.doAction('transfer', toTransfer, [notifier]).then(function (result) {
                deferred.resolve(result);
            });

        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };

    function getAll(user){
        var deferred = $q.defer();
        var url = 'https://api.spotify.com/v1/me/tracks';
        var params = {
            limit: 50,
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

        }, function (error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function load(url, user, params){
        return Spotify.get(url, user, params).then(function(response){
            return getUris(response.data.items);
        });
    }

    function getUris(items){
        return _.filter(_.map(items, function(item){
            return item.track && item.track.uri;
        }), function(uri){
            return uri && uri.indexOf('spotify:track:') === 0;
        });
    }
});