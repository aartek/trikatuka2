export default class Track {

    constructor(track, user) {
        this.id = track.id;
        this.name = track.name;
        this.artists = track.artists;
        this.album = track.album;
        this.user = user;
    }

}
