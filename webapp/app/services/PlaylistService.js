"use strict";

angular.module('trikatuka2').service('PlaylistService', function (Spotify, $q, RequestHelper) {
    this.loadPlaylists = function (user, params, itemsTransformer) {
        return Spotify.get('https://api.spotify.com/v1/me/playlists', user, params).then(function (response) {
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
        return Spotify.post('https://api.spotify.com/v1/me/playlists', user, data);
    };

    this.addTracksToPlaylist = function (tracks, user, playlistId) {
        var pages = Math.ceil(tracks.length / 100);

        function uriOf(item) {
            var track = item.track || item.item;
            return track && track.uri;
        }

        function Page(data) {
            this.add = function () {
                return Spotify.post(url, user, data);
            }
        }

        var url = sprintf('https://api.spotify.com/v1/playlists/%s/items', playlistId);

        var promises = [];
        for (var i = 0; i < pages; i++) {
            var data = {
                uris: _.chain(tracks.slice(i * 100, (i * 100) + 100))
                    .filter(function (item) {
                        if (!uriOf(item)) {
                            console.error({ item: item, error: "Something is wrong with this track so it couldn't be added to playlist: " + playlistId + ". Skipping this track." });
                        }
                        return !!uriOf(item);
                    })
                    .map(uriOf)
            };
            promises.push(new Page(data));
        }
        return RequestHelper.doAction('add', promises);
    }
});
