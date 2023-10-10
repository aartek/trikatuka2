export default class Track {
    id;
    name;
    artists;
    album;
    constructor(id, name, artists = [], album) {
        this.id = id;
        this.name = name;
        this.artists = artists;
        this.album = album;
    }
    static fromResponse(response) {
        return new Track(response.id, response.name, response.artists?.map((artist) => artist.name), response.album.name);
    }
}
