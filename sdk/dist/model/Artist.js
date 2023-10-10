export default class Artist {
    id;
    name;
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    static fromResponse(response) {
        return new Artist(response.id, response.name);
    }
}
