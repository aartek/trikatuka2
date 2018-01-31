"use strict";

angular.module('trikatuka2').factory('Artist', function(Spotify ,$q, ArtistService){
    this.playlistId = null;
    this.name = null;

    function Artist(artist, user){
        var self = this;
        self.id = artist.id;
        self.name = artist.name;
        self.user = user;
    }

    return Artist;

});
//# sourceURL=Artist.js