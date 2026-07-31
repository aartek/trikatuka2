"use strict";

angular.module('trikatuka2').factory('Playlist', function(Spotify ,$q, PlaylistService){
    this.playlistId = null;
    this.tracksCount = null;
    this.name = null;
    this.collaborative = null;

    function Playlist(playlist, user){
        var self = this;
        self.id = playlist.id;
        self.name = playlist.name;
        self.collaborative = playlist.collaborative;
        self.isPublic = playlist.public;
        self.owner = playlist.owner;
        self.tracksCount = playlist.tracks ? playlist.tracks.total : 0;
        self.user = user;
    }

    Playlist.prototype.transfer = function(targetUser){
        var self = this;
        if(self.collaborative || self.owner.id !== self.user.getUserId()){
            return self.followCollaborative(targetUser);
        }
        else{
            return self.copyPlaylist(targetUser);
        }
    };

    Playlist.prototype.followCollaborative = function(targetUser){
        var self = this;
        var data = {
            public: this.isPublic
        };
        var url = sprintf('https://api.spotify.com/v1/playlists/%s/followers', this.id);
        return Spotify.put(url, targetUser, data).then(function(){
            return {
                success: true,
                playlist: self
            }
        }, function(error){
            console.error('Failed to follow playlist:', self.name, error && error.status, error && error.data);
            return {
                success: false,
                playlist: self
            }
        });
    };

    Playlist.prototype.copyPlaylist = function(targetUser){
        var self = this;

        return this.loadTracks().then(function(tracks){
            return PlaylistService.createPlaylist(targetUser, self.name, self.isPublic).then(function(playlistResponse){
                var newPlaylistId = playlistResponse.data.id;
                return PlaylistService.addTracksToPlaylist(tracks, targetUser, newPlaylistId).then(function(result){
                    if (result.fail.length) {
                        return $q.reject(result.fail[0]);
                    }
                    return {
                        success: true,
                        playlist: self
                    }
                });
            });
        }).catch(function(error){
            console.error('Failed to copy playlist:', self.name, error && error.status, error && error.data);
            return {
                success: false,
                playlist: self
            };
        });
    };

    Playlist.prototype.loadTracks = function(){
        var self = this;
        function load(params) {
            var url = sprintf('https://api.spotify.com/v1/playlists/%s/items', self.id);
            return Spotify.get(url, self.user, params);
        }

        var itemsPerPage = 100;

        return load({offset: 0, limit: itemsPerPage}).then(function (first) {
            var pages = Math.ceil(first.data.total / itemsPerPage);
            var promises = [];

            for (var i = 1; i < pages; i++) {
                promises.push(load({offset: i * itemsPerPage, limit: itemsPerPage}));
            }

            return $q.all(promises).then(function (results) {
                var tracks = first.data.items;
                _.each(results, function (result) {
                    tracks = tracks.concat(result.data.items);
                });
                return tracks;
            });
        });

    };

    return Playlist;

});
