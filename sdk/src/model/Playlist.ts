export default class Playlist {
    readonly id: string
    readonly name: string
    readonly collaborative: boolean
    readonly isPublic: boolean
    readonly owner: { readonly id: string, readonly name: string }
    readonly tracks: { readonly url: string, readonly total: number }

    constructor(id: string, name: string, collaborative: boolean, isPublic: boolean, owner: { id: string; name: string }, tracks: { url: string, total: number }) {
        this.id = id;
        this.name = name;
        this.collaborative = collaborative;
        this.isPublic = isPublic;
        this.owner = owner;
        this.tracks = tracks;
    }

    static fromResponse(response: any): Playlist {
        const owner = {
            id: response.owner.id,
            name: response.owner.display_name
        };
        return new Playlist(response.id, response.name, response.collaborative, response.public, owner, {url: response.tracks.href, total: response.tracks.total });
    }
};
