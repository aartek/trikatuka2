export default class Track {
    id;
    name;
    artists;
    constructor(id, name, artists = []) {
        this.id = id;
        this.name = name;
        this.artists = artists;
    }
    static fromResponse(response) {
        return new Track(response.id, response.name, response.artists?.map((artist) => artist.name));
    }
}
