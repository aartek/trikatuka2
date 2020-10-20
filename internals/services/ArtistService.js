import Artist from "../model/Artist";
import {PagesProcessor} from "./PagesProcessor";
import paginator from "./paginator";

export default class ArtistService {

    constructor(spotify) {
        this.spotify = spotify
    }

    async loadArtists(user, params, lastArtistId) {
        if (lastArtistId) {
            params.after = lastArtistId;
        }
        const response = await this.spotify.get('/me/following?type=artist', user, params)
        return {
            items: response.data.artists.items.map(item => new Artist(item, user)),
            total: response.data.artists.total
        }
    };

    async transferAll(user, targetUser) {
        const path = '/me/following?type=artist';

        const transfer = async (data) => this.spotify.put(path, targetUser, data);

        const artists = await this._getAll(user)

        const slicesToTransfer = paginator(artists.length, 50, (page) => ({ids: artists.slice(page * 50, (page * 50) + 50)}))

        const promises = slicesToTransfer.map(paginatedItems => PagesProcessor.process([paginatedItems], transfer));
        return await Promise.all(promises);
    };

    async _getAll(user) {
        const url = '/me/following?type=artist';
        const params = {
            limit: 50,
        };

        const artists = await this._recursiveLoad(url, user, params, [])
        return artists
    }


    async _recursiveLoad(url, user, params, items) {
        const response = await this.spotify.get(url, user, params)
        items.push(...this._getIds(response.artists.items))

        if (response.artists.next) {
            const nextUrl = response.artists.next.replace("https://api.spotify.com/v1/", "/")
            return await this._recursiveLoad(nextUrl, user, params, items)
        }
        else {
            return items
        }
    }

    _getIds(items) {
        return items.map((item) => {
            return item.id;
        });
    }

}
