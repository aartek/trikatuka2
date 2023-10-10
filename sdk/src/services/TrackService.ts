import {PagesProcessor} from "./PagesProcessor";
import {paginator} from "./paginator";
import {Spotify} from "./Spotify";
import {Page, Params, User} from "../model";
import Track from "../model/Track";

const TRACKS_PATH = '/me/tracks'

export class TrackService {

    constructor(private readonly spotify: Spotify, private readonly trackTransferDelayMs = 2000) {
    }

    async loadTracks(user: User, params: Params): Promise<Page<Track>> {
        const response = await this.spotify.get(TRACKS_PATH, user, params);
        return {
            items: response.data.items.map((item: any) => Track.fromResponse(item.track)),
            total: response.data.total
        }
    };

    async transferAll(user: User, targetUser: User): Promise<void> {

        const tracks = await this._getAll(user)
        const tracksPages: string[][] = paginator<Track, string>(tracks, 1, (item) => item.id)

        return PagesProcessor.process(tracksPages.reverse(), (items) =>
            this.spotify.put(TRACKS_PATH, targetUser, {ids: items})
                .then(async (result) => {
                    return await (new Promise(res => {
                        setTimeout(() => {
                            res(result)
                        }, this.trackTransferDelayMs)
                    }))
                }))
            .then(result => {
                if (result.failed.length) {
                    console.error(`Not all tracks were transferred successfully, failed: ${JSON.stringify(result.failed)}`);
                }
                return;
            });
    }

    async _getAll(user: User): Promise<Track[]> {
        return (await PagesProcessor.recursiveLoad(this.spotify, TRACKS_PATH, user))
            .map(item => Track.fromResponse(item.track))
    }
}
