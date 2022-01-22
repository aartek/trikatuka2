import Artist from "../model/Artist";
import Spotify from "./Spotify";
import User from "../model/User";
import {GetParams, Page, Params} from "../model/Types";
import {paginator} from "./paginator";
import PagesProcessor from "./PagesProcessor";

const ARTISTS_PATH = `/me/following?type=artist`
const PAGE_SIZE = 50

export default class ArtistService {

    constructor(private readonly spotify: Spotify) {
    }

    async loadArtists(user: User, params: Params, lastArtistId?: string): Promise<Page<Artist>> {
        const artistParams: GetParams = Object.assign(params, lastArtistId ? {after: lastArtistId} : {})

        const response = await this.spotify.get(ARTISTS_PATH, user, artistParams)
        return {
            items: response.data.artists.items.map(item => Artist.fromResponse(item)),
            total: response.data.artists.total
        }
    };

    async transferAll(user, targetUser): Promise<void> {

        const artists: Artist[] = await this._getAll(user)
        const artistsPages: string[][] = paginator<Artist, string>(artists, PAGE_SIZE, (item) => item.id)

        return PagesProcessor.process(artistsPages, (items) => this.spotify.put(ARTISTS_PATH, targetUser, {ids: items}))
            .then(result => {
                if (result.failed.length) {
                    console.error(`Not all artists were transferred successfully, failed: ${JSON.stringify(result.failed)}`);
                }
                return;
            });
    }

    async _getAll(user): Promise<Artist[]> {
        return (await PagesProcessor.recursiveLoad(this.spotify, ARTISTS_PATH, user, (response) => response.data.artists))
            .map(item => Artist.fromResponse(item))
    }
}
