export default class Artist {
    readonly id: string
    readonly name: string

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    static fromResponse(response: any) {
        return new Artist(response.id, response.name)
    }
}
