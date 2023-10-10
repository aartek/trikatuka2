export default class Playlist {
    id;
    name;
    collaborative;
    isPublic;
    owner;
    tracks;
    constructor(id, name, collaborative, isPublic, owner, tracks) {
        this.id = id;
        this.name = name;
        this.collaborative = collaborative;
        this.isPublic = isPublic;
        this.owner = owner;
        this.tracks = tracks;
    }
    static fromResponse(response) {
        const owner = {
            id: response.owner.id,
            name: response.owner.display_name
        };
        return new Playlist(response.id, response.name, response.collaborative, response.public, owner, { url: response.tracks.href, total: response.tracks.total });
    }
}
;
