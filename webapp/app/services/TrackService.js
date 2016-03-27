"use strict";

angular.module('trikatuka2').service('TrackService', function (Spotify, $q) {
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
        getAll(user).then(function(tracks){
            var url = 'https://api.spotify.com/v1/me/tracks';
            var pages = Math.ceil(tracks.length / 50);
            var promises = [];
            for(var i=0; i<pages; i++) {
                var data  = tracks.slice(i * 50, (i * 50) + 50);
                promises.push(Spotify.put(url, targetUser, data));
            }
            $q.all(promises).then(function(){
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

            var pages = Math.ceil(total / 50);
            var promises = [];
            for(var i=0; i<pages; i++) {
                var params = {
                    limit: 50,
                    offset: i*50
                };
                promises.push(load(url,user,params));
            }
            return $q.all(promises).then(function(results){
                _.each(results, function(result){
                    tracks = tracks.concat(result);
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
