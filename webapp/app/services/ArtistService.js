"use strict";

angular.module('trikatuka2').service('ArtistService', function (Spotify, $q, RequestHelper, $timeout) {
    this.loadArtists = function (user, params, lastArtistId, itemsTransformer) {
        if (lastArtistId) {
            params.after = lastArtistId;
        }
        return Spotify.get('https://api.spotify.com/v1/me/following?type=artist', user, params).then(function (response) {
            return {
                items: itemsTransformer ? _.map(response.data.artists.items, itemsTransformer) : response.data.artists.items,
                total: response.data.artists.total
            }
        });
    };

    this.transferAll = function (user, targetUser) {
        var deferred = $q.defer();

        var url = 'https://api.spotify.com/v1/me/following?type=artist';

        function Page(items) {
            this.items = items;

            this.transfer = function () {
                return Spotify.put(url, targetUser, {ids: this.items});
            }
        }

        getAll(user).then(function (artists) {
            artists = _.reduce(artists, function (arr, artist) {
                return arr.concat(getIds(artist.items))
            }, [])
            var pages = Math.ceil(artists.length / 50);

            var toTransfer = [];
            for (var i = 0; i < pages; i++) {
                var data = artists.slice(i * 50, (i * 50) + 50);
                toTransfer.push(new Page(data));
            }
            return RequestHelper.doAction('transfer', toTransfer).then(function () {
                deferred.resolve();
            });

        });
        return deferred.promise;
    };

    function getAll(user) {
        var deferred = $q.defer();
        var url = 'https://api.spotify.com/v1/me/following?type=artist';
        var params = {
            limit: 1,
            offset: 0
        };

        Spotify.get(url, user, params).then(function (response) {
            var total = response.data.artists.total;
            var artists = [];

            function Page(params) {
                this.getItems = function (previousResult) {
                    if (previousResult) {
                        params.after = previousResult.cursors.after
                    }
                    return load(url, user, params)
                }
            }

            var pages = Math.ceil(total / 50);
            var pagesToLoad = [];
            for (var i = 0; i < pages; i++) {
                var params = {
                    limit: 50,
                    offset: i * 50,
                };
                pagesToLoad.push(new Page(params));
            }

            return RequestHelper.doAction('getItems', pagesToLoad).then(function (result) {
                _.each(result.success, function (items) {
                    artists = artists.concat(items);
                });
                deferred.resolve(artists);
            });

        });
        return deferred.promise;
    }

    function load(url, user, params) {
        return Spotify.get(url, user, params).then(function (response) {
            return response.data.artists;
            // return getIds(response.data.artists.items);
        });
    }

    function getIds(items) {
        return _.map(items, function (item) {
            return item.id;
        });
    }
});
