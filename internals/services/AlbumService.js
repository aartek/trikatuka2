import Album from "../model/Album";
import {PagesProcessor} from "./PagesProcessor";
import paginator from "./paginator";

export default class AlbumService {

    constructor(spotify) {
        this.spotify = spotify
    }

    async loadAlbums(user, params) {
        const response = this.spotify.get('/me/albums', user, params);
        return {
            items: response.data.items.map(item => new Album(item.album, user)),
            total: response.data.total
        }
    };

    async transferAll(user, targetUser) {
        const path = '/me/albums';

        const transfer = async (items) => this.spotify.put(path, targetUser, items);

        const albums = await this._getAll(user)

        const slicesToTransfer = paginator(albums.length, 50, (page) => albums.slice(page * 50, (page * 50) + 50))

        const promises = slicesToTransfer.map(paginatedItems => PagesProcessor.process([paginatedItems], transfer));
        return await Promise.all(promises);
    };

    async _getAll(user) {

        const url = '/me/albums';
        const params = {
            limit: 1,
            offset: 0
        };
        const response = await this.spotify.get(url, user, params)
        const total = response.data.total;

        const offsets = paginator(total, 50, (page) => ({limit: 50, offset: page * 50}))

        const result = await PagesProcessor.process(offsets, (params) => this._load(url, user, params))

        const albums = [];
        result.succeeded.forEach(items => albums.push(...items));

        return albums
    }

    async _load(url, user, params) {
        const response = await this.spotify.get(url, user, params)
        return this._getIds(response.data.items);
    }

    _getIds(items) {
        return items.map((item) => {
            return item.album.id;
        });
    }

}
