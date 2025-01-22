"use strict";

angular.module('trikatuka2').factory('Podcast', function(){

    function Podcast(podcast, user){
        var self = this;
        self.id = podcast.id;
        self.name = podcast.name;
        self.publisher = podcast.publisher;
        self.user = user;
    }

    return Podcast;

});
