import Playlist from "../model/Playlist";
import paginator, {paginator2} from "./paginator";
import Spotify from "./Spotify";
import {OperationResult, Params, Stats} from "../model/Types";
import User from "../model/User";
import {AxiosResponse} from "axios";
import Track from "../model/Track";
import PagesProcessor from "./PagesProcessor";

const PLAYLISTS_PATH = '/me/playlists'

export default class PlaylistService {

    constructor(private readonly spotify: Spotify) {
    }

    async loadPlaylists(user: User, params: Params): Promise<{ items: Playlist[], total: number }> {
        const response = await this.spotify.get(PLAYLISTS_PATH, user, params)
        return {
            items: response.data.items.map(item => Playlist.fromResponse(item)),
            total: response.data.total
        }
    }

    async transferPlaylists(playlists: Playlist[], user: User, targetUser: User): Promise<Stats<Playlist>> {
        const promises: Promise<OperationResult<Playlist>>[] = playlists.map((playlist: Playlist) => {
            if (playlist.collaborative || playlist.owner.id !== user.id) {
                return this.followCollaborative(playlist, targetUser);
            } else {
                return this.copyPlaylist(playlist, user, targetUser);
            }
        });

        return Promise.all(promises).then((results) => results.reduce((acc, curr) => {
            if (curr.success) {
                acc.succeeded.push(curr.item);
            } else {
                acc.failed.push(curr.item);
            }
            return acc;
        }, {succeeded: [], failed: []}))

    }

    async transferAll(user: User, targetUser: User): Promise<Stats<Playlist>> {
        const playlistsResponse: any = await this.recursiveListLoad(PLAYLISTS_PATH, user);
        const playlists: Playlist[] = playlistsResponse.map(item => Playlist.fromResponse(item))
        return this.transferPlaylists(playlists.reverse(), user, targetUser);
    }

    private async followCollaborative(playlist: Playlist, targetUser: User): Promise<OperationResult<Playlist>> {
        const data = {
            public: playlist.isPublic
        };
        const url = `/users/${playlist.owner.id}/playlists/${playlist.id}/followers`;
        try {
            await this.spotify.put(url, targetUser, data)
            return {
                success: true,
                item: playlist
            }
        } catch (e) {
            return {
                success: false,
                item: playlist
            }
        }
    }

    private async copyPlaylist(playlist: Playlist, user: User, targetUser: User): Promise<OperationResult<Playlist>> {
        try {
            const tracks = (await this.recursiveListLoad(playlist.tracks.url, user, {fields: 'next,items(track(id))'}))
                .map(item => Track.fromResponse(item.track))
            const playlistCreationResponse = await this.createPlaylist(targetUser, playlist);
            const newPlaylistId = playlistCreationResponse.data.id;

            await this.addTracksToPlaylist(tracks, targetUser, newPlaylistId)
            return {
                success: true,
                item: playlist
            }

        } catch (e) {
            return {
                success: false,
                item: playlist
            };
        }
    }

    private async createPlaylist(user: User, sourcePlaylist: Playlist): Promise<AxiosResponse> {
        const data = {
            name: sourcePlaylist.name,
            public: sourcePlaylist.isPublic
        };
        const url = `/users/${user.id}/playlists`;
        return this.spotify.post(url, user, data);
    };

    private async recursiveListLoad(path, user, params?: object, items = []) {
        const response = await this.spotify.get(path, user, Object.assign({limit: 50}, params))
        items.push(...response.data.items);

        if (response.data.next) {
            return await this.recursiveListLoad(response.data.next, user, params, items)
        } else {
            return items;
        }
    }

    private async addTracksToPlaylist(tracks: Track[], user: User, playlistId: string): Promise<Stats<string>> {
        const url = `/users/${user.id}/playlists/${playlistId}/tracks`

        const transfer = async (tracks: string[]) => this.spotify.put(url, user, {uris: tracks});

        //TODO remove commented
        // const slicesToTransfer = paginator(tracks.length, 100, (item) => item.track.uri)
        const slicesToTransfer: string[][] = paginator2<Track, string>(tracks, 100, (pageOfTracks) => pageOfTracks.map((track: Track) => track.id));

        //TODO remove commented
        // const promises = slicesToTransfer.map(paginatedItems => PagesProcessor.process([paginatedItems], transfer));
        return PagesProcessor.process(slicesToTransfer, transfer);
    }


    //===============================


    // async transfer(playlist, targetUser) {
    //     if (playlist.collaborative || playlist.owner.id !== playlist.user.getUserId()) {
    //         return await this._followCollaborative(playlist, targetUser);
    //     } else {
    //         return this._copyPlaylist(playlist, targetUser);
    //     }
    // };
    //
    // async _followCollaborative(playlist, targetUser) {
    //     const data = {
    //         public: playlist.isPublic
    //     };
    //     const url = `https://api.spotify.com/v1/users/${playlist.owner.id}/playlists/${playlist.id}/followers`;
    //     try {
    //         await this.spotify.put(url, targetUser, data)
    //         return {
    //             success: true,
    //             playlist: playlist
    //         }
    //     } catch (e) {
    //         return {
    //             success: false,
    //             playlist: playlist
    //         }
    //     }
    // };
    //
    //
    // async _copyPlaylist(playlist, targetUser) {
    //     try {
    //         const tracks = this.loadTracks()
    //         const playlistCreationResponse = await this.createPlaylist(targetUser, playlist.name, playlist.isPublic)
    //         const newPlaylistId = playlistCreationResponse.data.id;
    //
    //         await this.addTracksToPlaylist(tracks, targetUser, newPlaylistId)
    //         return {
    //             success: true,
    //             playlist: playlist
    //         }
    //
    //     } catch (e) {
    //         return {
    //             success: false,
    //             playlist: playlist
    //         };
    //     }
    // };
    //
    // async loadTracks(playlist) {
    //     const params = {
    //         limit: 100
    //     }
    //     const url = `/users/${playlist.user.getUserId()}/playlists/${playlist.id}/tracks`;
    //
    //     const tracks = await this._recursiveTracksLoad(url, playlist.user.getUserId(), params)
    //     return tracks;
    // };
    //
    // async _recursiveTracksLoad(url, user, params, items = []) {
    //     const response = await this.spotify.get(url, user, params)
    //     items.push(...response.items.map(track => track.id))
    //
    //     if (response.next) {
    //         const nextUrl = response.next.replace("https://api.spotify.com/v1/", "/")
    //         return await this._recursiveTracksLoad(nextUrl, user, params, items)
    //     } else {
    //         return items;
    //     }
    // }

}
