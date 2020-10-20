export default class Playlist {
    constructor(playlist, user) {
        this.id = playlist.id;
        this.name = playlist.name;
        this.collaborative = playlist.collaborative;
        this.isPublic = playlist.public;
        this.owner = playlist.owner;
        this.tracksCount = playlist.tracks.total;
        this.user = user;
    }
};
