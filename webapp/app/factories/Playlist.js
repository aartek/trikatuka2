"use strict";

angular.module('trikatuka2').factory('Playlist', function(Spotify ,$q, PlaylistService, $timeout){
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
        self.tracksCount = playlist.tracks.total;
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
        var url = sprintf('https://api.spotify.com/v1/users/%s/playlists/%s/followers', this.owner.id, this.id);
        return Spotify.put(url, targetUser, data).then(function(){
            return {
                success: true,
                playlist: self
            }
        }, function(){
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
                return PlaylistService.addTracksToPlaylist(tracks, targetUser, newPlaylistId).then(function(){
                    return {
                        success: true,
                        playlist: self
                    }
                });
            });
        },function(){
            return {
                success: false,
                playlist: self
            };
        });
    };

    Playlist.prototype.loadTracks = function(){
        var self = this;
        function load(params) {
            var url = sprintf('https://api.spotify.com/v1/users/%s/playlists/%s/tracks',self.user.getUserId(), self.id);
            return Spotify.get(url, self.user, params);
        }

        var total = this.tracksCount;
        var itemsPerPage = 100;

        var pages = Math.ceil(total / itemsPerPage);
        var promises = [];

        for (var i = 0; i < pages; i++) {
            promises.push(load({offset: i * itemsPerPage, limit: itemsPerPage}));
        }

        return $q.all(promises).then(function (results) {
            var tracks = [];
            _.each(results, function (result) {
                tracks = tracks.concat(result.data.items);
            });
            return tracks;
        });

    };

    return Playlist;

});
