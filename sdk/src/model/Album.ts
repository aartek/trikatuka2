export default class Album {
    readonly id: string
    readonly name: string
    readonly artists: string[]
    readonly trackcounts: number


    constructor(id: string, name: string, artists: string[], trackcounts: number) {
        this.id = id;
        this.name = name;
        this.artists = artists;
        this.trackcounts = trackcounts;
    }

    static fromResponse(response: any): Album {
        return new Album(response.id, response.name, response.artists, response.tracks.total);
    }
}
