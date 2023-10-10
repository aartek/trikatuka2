export default class Album {
    id;
    name;
    artists;
    trackcounts;
    constructor(id, name, artists = [], trackcounts) {
        this.id = id;
        this.name = name;
        this.artists = artists;
        this.trackcounts = trackcounts;
    }
    static fromResponse(response) {
        return new Album(response.id, response.name, response.artists.map((artist) => artist.name), response.tracks.total);
    }
}
