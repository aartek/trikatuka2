import {PagesProcessor} from "../../sdk/src/services/PagesProcessor";
import paginator from "../../sdk/src/services/paginator";
import Track from "../../sdk/src/model/Track";


const TRACKS_URL_PATH = '/me/tracks'

export default class TrackService {

    constructor(spotify) {
        this.spotify = spotify
    }

    async loadTracks(user, params) {
        const response = this.spotify.get(TRACKS_URL_PATH, user, params);
        return {
            items: response.data.items.map(item => new Track(item.track, user)),
            total: response.data.total
        }
    };

    async transferAll(user, targetUser) {

        const transfer = async (items) => this.spotify.put(TRACKS_URL_PATH, targetUser, items);

        const tracks = await this._getAll(user)

        const slicesToTransfer = paginator(tracks.length, 50, (page) => tracks.slice(page * 50, (page * 50) + 50))

        const promises = slicesToTransfer.map(paginatedItems => PagesProcessor.process([paginatedItems], transfer));
        return await Promise.all(promises);
    };

    async _getAll(user) {
        const params = {
            limit: 50
        };

        return  await this._recursiveLoad(TRACKS_URL_PATH, user, params, []);
    }

    async _recursiveLoad(url, user, params, items) {
        const response = await this.spotify.get(url, user, params)
        items.push(...this._getIds(response.artists.items))

        if (response.next) {
            const nextUrl = response.artists.next.replace("https://api.spotify.com/v1/", "/")
            return await this._recursiveLoad(nextUrl, user, params, items)
        }
        else {
            return items;
        }
    }

    _getIds(items) {
        return items.map((item) => {
            return item.track.id;
        });
    }

}
