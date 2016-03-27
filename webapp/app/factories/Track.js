"use strict";

angular.module('trikatuka2').factory('Track', function(Spotify ,$q, TrackService){
    this.playlistId = null;
    this.tracksCount = null;
    this.name = null;
    this.collaborative = null;

    function Track(track, user){
        var self = this;
        self.id = track.id;
        self.name = track.name;
        self.artists = track.artists;
        self.album = track.album;
        self.user = user;
    }

    return Track;

});
//# sourceURL=Track.js