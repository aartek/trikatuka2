"use strict";

angular.module('trikatuka2').factory('Album', function(){
    this.playlistId = null;
    this.name = null;

    function Album(album, user){
        var self = this;
        self.id = album.id;
        self.name = album.name;
        self.artists = album.artists;
        self.trackcounts = album.tracks.total;
        self.user = user;
    }

    return Album;

});
