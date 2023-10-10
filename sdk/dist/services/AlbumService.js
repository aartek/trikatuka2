import { PagesProcessor } from "./PagesProcessor";
import Album from "../model/Album";
import { paginator } from "./paginator";
const PAGE_SIZE = 50;
const ALBUMS_PATH = '/me/albums';
export class AlbumService {
    spotify;
    constructor(spotify) {
        this.spotify = spotify;
    }
    async loadAlbums(user, params) {
        const response = await this.spotify.get(ALBUMS_PATH, user, params);
        return {
            items: response.data.items.map((item) => Album.fromResponse(item.album)),
            total: response.data.total
        };
    }
    ;
    async transferAll(user, targetUser) {
        const albums = await this._getAll(user);
        const albumsPages = paginator(albums, PAGE_SIZE, (item) => item.id);
        return PagesProcessor.process(albumsPages, (items) => this.spotify.put(ALBUMS_PATH, targetUser, { ids: items }))
            .then(result => {
            if (result.failed.length) {
                console.error(`Not all albums were transferred successfully, failed: ${JSON.stringify(result.failed)}`);
            }
            return;
        });
    }
    async _getAll(user) {
        return (await PagesProcessor.recursiveLoad(this.spotify, ALBUMS_PATH, user))
            .map(item => Album.fromResponse(item.album));
    }
}
