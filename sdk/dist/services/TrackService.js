import { PagesProcessor } from "./PagesProcessor";
import { paginator } from "./paginator";
import Track from "../model/Track";
const TRACKS_PATH = '/me/tracks';
export class TrackService {
    spotify;
    trackTransferDelayMs;
    constructor(spotify, trackTransferDelayMs = 2000) {
        this.spotify = spotify;
        this.trackTransferDelayMs = trackTransferDelayMs;
    }
    async loadTracks(user, params) {
        const response = await this.spotify.get(TRACKS_PATH, user, params);
        return {
            items: response.data.items.map((item) => Track.fromResponse(item.track)),
            total: response.data.total
        };
    }
    ;
    async transferAll(user, targetUser) {
        const tracks = await this._getAll(user);
        const tracksPages = paginator(tracks, 1, (item) => item.id);
        return PagesProcessor.process(tracksPages.reverse(), (items) => this.spotify.put(TRACKS_PATH, targetUser, { ids: items })
            .then(async (result) => {
            return await (new Promise(res => {
                setTimeout(() => {
                    res(result);
                }, this.trackTransferDelayMs);
            }));
        }))
            .then(result => {
            if (result.failed.length) {
                console.error(`Not all tracks were transferred successfully, failed: ${JSON.stringify(result.failed)}`);
            }
            return;
        });
    }
    async _getAll(user) {
        return (await PagesProcessor.recursiveLoad(this.spotify, TRACKS_PATH, user))
            .map(item => Track.fromResponse(item.track));
    }
}
