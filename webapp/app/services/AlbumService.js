"use strict";

angular.module('trikatuka2').service('AlbumService', function (Spotify, $q, RequestHelper, $timeout) {
    this.loadAlbums = function(user, params, itemsTransformer){
        return Spotify.get('https://api.spotify.com/v1/me/albums', user, params).then(function(response){
            return {
                items: itemsTransformer ? _.map(response.data.items, itemsTransformer) : response.data.items,
                total: response.data.total
            }
        });
    };

    this.transferAll = function(user, targetUser){
        var deferred = $q.defer();

        function Page(items){
            this.items = items;

            this.transfer = function () {
                return Spotify.saveToLibrary(this.items, targetUser);
            }
        }

        getAll(user).then(function(albums){
            var size = Spotify.SAVE_LIBRARY_BATCH_SIZE;
            var pages = Math.ceil(albums.length / size);

            var toTransfer = [];
            for(var i=0; i<pages; i++) {
                var data  = albums.slice(i * size, (i * size) + size);
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
        var url = 'https://api.spotify.com/v1/me/albums';
        var params = {
            limit: 1,
            offset: 0
        };
        Spotify.get(url, user, params).then(function(response){
            var total = response.data.total;
            var albums = [];

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
                    albums = albums.concat(items);
                });
                deferred.resolve(albums);
            }); 

        });
        return deferred.promise;
    }

    function load(url, user, params){
        return Spotify.get(url, user, params).then(function(response){
            return getUris(response.data.items);
        });
    }

    function getUris(items){
        return _.compact(_.map(items, function(item){
            return item.album && item.album.uri;
        }));
    }
});
