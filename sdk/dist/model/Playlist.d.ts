export default class Playlist {
    readonly id: string;
    readonly name: string;
    readonly collaborative: boolean;
    readonly isPublic: boolean;
    readonly owner: {
        readonly id: string;
        readonly name: string;
    };
    readonly tracks: {
        readonly url: string;
        readonly total: number;
    };
    constructor(id: string, name: string, collaborative: boolean, isPublic: boolean, owner: {
        id: string;
        name: string;
    }, tracks: {
        url: string;
        total: number;
    });
    static fromResponse(response: any): Playlist;
}
