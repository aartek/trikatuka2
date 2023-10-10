import {PagesProcessor} from "./PagesProcessor";
import Album from "../model/Album";
import {paginator} from "./paginator";
import {Spotify} from "./Spotify";
import {Page, Params, User} from "../model";

const PAGE_SIZE = 50
const ALBUMS_PATH = '/me/albums'

export class AlbumService {

    constructor(private readonly spotify: Spotify) {
    }

    async loadAlbums(user: User, params: Params): Promise<Page<Album>> {
        const response = await this.spotify.get(ALBUMS_PATH, user, params);
        return {
            items: response.data.items.map((item: any) => Album.fromResponse(item.album)),
            total: response.data.total
        }
    };

    async transferAll(user: User, targetUser: User): Promise<void> {

        const albums = await this._getAll(user)
        const albumsPages: string[][] = paginator<Album, string>(albums, PAGE_SIZE, (item) => item.id)

        return PagesProcessor.process(albumsPages, (items) => this.spotify.put(ALBUMS_PATH, targetUser, {ids: items}))
            .then(result => {
                if (result.failed.length) {
                    console.error(`Not all albums were transferred successfully, failed: ${JSON.stringify(result.failed)}`);
                }
                return;
            });
    }

    async _getAll(user: User): Promise<Album[]> {
        return (await PagesProcessor.recursiveLoad(this.spotify, ALBUMS_PATH, user))
            .map(item => Album.fromResponse(item.album))
    }
}
