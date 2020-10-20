export default class Album {

    constructor(album, user) {
        this.id = album.id;
        this.name = album.name;
        this.artists = album.artists;
        this.trackcounts = album.tracks.total;
        this.owner = owner;
    }
}
