export default class Track {

    readonly id: string
    readonly name: string
    readonly artists: string[]
    readonly album: string;

    constructor(id: string, name: string, artists: string[] = [], album: string) {
        this.id = id;
        this.name = name;
        this.artists = artists
        this.album = album;
    }

    static fromResponse(response: any): Track {
        return new Track(response.id, response.name, response.artists?.map((artist: any) => artist.name), response.album.name)
    }

}
