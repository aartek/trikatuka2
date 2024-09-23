"use strict";

angular.module('trikatuka2').service('PlaylistService', function (Spotify, $q, RequestHelper) {
    this.loadPlaylists = function(user, params, itemsTransformer){
        return Spotify.get('https://api.spotify.com/v1/me/playlists', user, params).then(function(response){
            return {
                items: itemsTransformer ? _.map(response.data.items, itemsTransformer) : response.data.items,
                total: response.data.total
            }
        });
    };

    this.createPlaylist = function (user, name, isPublic) {
        var data = {
            name: name,
            public: isPublic || false
        };
        var url = sprintf('https://api.spotify.com/v1/users/%s/playlists', user.getUserId());
        return Spotify.post(url, user, data);
    };

    this.addTracksToPlaylist = function (tracks, user, playlistId) {
        var pages = Math.ceil(tracks.length / 100);

        function Page(data) {
            this.add = function () {
                return Spotify.post(url, user, data);
            }
        }

        var url = sprintf('https://api.spotify.com/v1/users/%s/playlists/%s/tracks', user.getUserId(), playlistId);

        var promises = [];
        for (var i = 0; i < pages; i++) {
            var data = {
                uris: _.map(tracks.slice(i * 100, (i * 100) + 100), function(item){
                    return item.track.uri;
                })
            };
            promises.push(new Page(data));
        }
        return RequestHelper.doAction('add',promises);
    }
});
