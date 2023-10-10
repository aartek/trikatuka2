import Playlist from "../model/Playlist";
import { paginator } from "./paginator";
import Track from "../model/Track";
import { PagesProcessor } from "./PagesProcessor";
const PLAYLISTS_PATH = '/me/playlists';
export class PlaylistService {
    spotify;
    constructor(spotify) {
        this.spotify = spotify;
    }
    async loadPlaylists(user, params) {
        const response = await this.spotify.get(PLAYLISTS_PATH, user, params);
        return {
            items: response.data.items.map(item => Playlist.fromResponse(item)),
            total: response.data.total
        };
    }
    async transferPlaylists(playlists, user, targetUser) {
        const promises = playlists.map((playlist) => {
            if (playlist.collaborative || playlist.owner.id !== user.id) {
                return this.follow(playlist, targetUser);
            }
            else {
                return this.copyPlaylist(playlist, user, targetUser);
            }
        });
        return Promise.all(promises).then((results) => results.reduce((acc, curr) => {
            if (curr.success) {
                acc.succeeded.push(curr.item);
            }
            else {
                acc.failed.push(curr.item);
            }
            return acc;
        }, { succeeded: [], failed: [] }));
    }
    async transferAll(user, targetUser) {
        const playlistsResponse = await PagesProcessor.recursiveLoad(this.spotify, PLAYLISTS_PATH, user);
        const playlists = playlistsResponse.map(item => Playlist.fromResponse(item));
        return this.transferPlaylists(playlists.reverse(), user, targetUser);
    }
    async follow(playlist, targetUser) {
        const data = {
            public: playlist.isPublic
        };
        const url = `/users/${playlist.owner.id}/playlists/${playlist.id}/followers`;
        try {
            await this.spotify.put(url, targetUser, data);
            return {
                success: true,
                item: playlist
            };
        }
        catch (e) {
            return {
                success: false,
                item: playlist
            };
        }
    }
    async copyPlaylist(playlist, user, targetUser) {
        try {
            const tracks = (await PagesProcessor.recursiveLoad(this.spotify, playlist.tracks.url, user, (response => response.data), { fields: 'next,items(track(id))' }))
                .map(item => Track.fromResponse(item.track));
            const playlistCreationResponse = await this.createPlaylist(targetUser, playlist);
            const newPlaylistId = playlistCreationResponse.data.id;
            await this.addTracksToPlaylist(tracks, targetUser, newPlaylistId);
            return {
                success: true,
                item: playlist
            };
        }
        catch (e) {
            return {
                success: false,
                item: playlist
            };
        }
    }
    async createPlaylist(user, sourcePlaylist) {
        const data = {
            name: sourcePlaylist.name,
            public: sourcePlaylist.isPublic
        };
        const url = `/users/${user.id}/playlists`;
        return this.spotify.post(url, user, data);
    }
    ;
    async addTracksToPlaylist(tracks, user, playlistId) {
        const url = `/users/${user.id}/playlists/${playlistId}/tracks`;
        const transfer = async (tracks) => this.spotify.put(url, user, { uris: tracks });
        const slicesToTransfer = paginator(tracks, 100, (track) => track.id);
        return PagesProcessor.process(slicesToTransfer, transfer);
    }
}
