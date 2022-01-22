export default class Track {

    readonly id: string
    readonly name: string
    readonly artists: string[]

    constructor(id: string, name: string, artists: string[] = []) {
        this.id = id;
        this.name = name;
        this.artists = artists
    }

    static fromResponse(response: any): Track {
        return new Track(response.id, response.name, response.artists?.map((artist: any) => artist.name))
    }

}
