export default class Track {

    readonly id: string
    readonly name: string

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    static fromResponse(response: any): Track {
        return new Track(response.id, response.name)
    }

}
