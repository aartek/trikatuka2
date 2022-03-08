import Playlist from "../model/Playlist";
import {paginator} from "./paginator";
import Spotify from "./Spotify";
import {OperationResult, Page, Params, Stats} from "../model/Types";
import User from "../model/User";
import {AxiosResponse} from "axios";
import Track from "../model/Track";
import PagesProcessor from "./PagesProcessor";

const PLAYLISTS_PATH = '/me/playlists'

export default class PlaylistService {

    constructor(private readonly spotify: Spotify) {
    }

    async loadPlaylists(user: User, params: Params): Promise<Page<Playlist>> {
        const response = await this.spotify.get(PLAYLISTS_PATH, user, params)
        return {
            items: response.data.items.map(item => Playlist.fromResponse(item)),
            total: response.data.total
        }
    }

    async transferPlaylists(playlists: Playlist[], user: User, targetUser: User): Promise<Stats<Playlist>> {
        const promises: Promise<OperationResult<Playlist>>[] = playlists.map((playlist: Playlist) => {
            if (playlist.collaborative || playlist.owner.id !== user.id) {
                return this.follow(playlist, targetUser);
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
        const playlistsResponse: any = await PagesProcessor.recursiveLoad(this.spotify, PLAYLISTS_PATH, user);
        const playlists: Playlist[] = playlistsResponse.map(item => Playlist.fromResponse(item))
        return this.transferPlaylists(playlists.reverse(), user, targetUser);
    }

    private async follow(playlist: Playlist, targetUser: User): Promise<OperationResult<Playlist>> {
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
            const tracks =
                (await PagesProcessor.recursiveLoad(this.spotify, playlist.tracks.url, user, (response => response.data), {fields: 'next,items(track(id))'}))
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

    private async addTracksToPlaylist(tracks: Track[], user: User, playlistId: string): Promise<Stats<string>> {
        const url = `/users/${user.id}/playlists/${playlistId}/tracks`

        const transfer = async (tracks: string[]) => this.spotify.put(url, user, {uris: tracks});

        const slicesToTransfer: string[][] = paginator<Track, string>(tracks, 100, (track) => track.id);
        return PagesProcessor.process(slicesToTransfer, transfer);
    }
}
