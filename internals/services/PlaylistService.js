import Playlist from "../model/Playlist";
import paginator from "./paginator";
import {PagesProcessor} from "./PagesProcessor";

const PLAYLISTS_PATH = '/me/playlists'

export default class PlaylistService {

    constructor(spotify) {
        this.spotify = spotify;
    }

    async loadPlaylists(user, params) {
        const response = await this.spotify.get(PLAYLISTS_PATH, user, params)
        return {
            items: response.data.items.map(item => new Playlist(item.playlist, user)),
            total: response.data.total
        }
    };

    async createPlaylist(user, name, isPublic) {
        const data = {
            name: name,
            public: isPublic || false
        };
        const url = `/users/${user.getUserId()}/playlists`;
        return this.spotify.post(url, user, data);
    };

    async addTracksToPlaylist(tracks, user, playlistId) {
        const url = `/users/${user.getUserId()}/playlists/${playlistId}/tracks`

        const transfer = async (tracks) => this.spotify.put(url, user, tracks);

        const slicesToTransfer = paginator(tracks.length, 100, (item) => item.track.uri)
        const promises = slicesToTransfer.map(paginatedItems => PagesProcessor.process([paginatedItems], transfer));

        return Promise.all(promises);
    }


    async transfer(playlist, targetUser) {
        if (playlist.collaborative || playlist.owner.id !== playlist.user.getUserId()) {
            return await this._followCollaborative(playlist, targetUser);
        } else {
            return this._copyPlaylist(playlist, targetUser);
        }
    };

    async _followCollaborative(playlist, targetUser) {
        const data = {
            public: playlist.isPublic
        };
        const url = `https://api.spotify.com/v1/users/${playlist.owner.id}/playlists/${playlist.id}/followers`;
        try {
            await this.spotify.put(url, targetUser, data)
            return {
                success: true,
                playlist: playlist
            }
        } catch (e) {
            return {
                success: false,
                playlist: playlist
            }
        }
    };


    async _copyPlaylist(playlist, targetUser) {
        try {
            const tracks = this.loadTracks()
            const playlistCreationResponse = await this.createPlaylist(targetUser, playlist.name, playlist.isPublic)
            const newPlaylistId = playlistCreationResponse.data.id;

            await this.addTracksToPlaylist(tracks, targetUser, newPlaylistId)
            return {
                success: true,
                playlist: playlist
            }

        } catch (e) {
            return {
                success: false,
                playlist: playlist
            };
        }
    };

    async loadTracks(playlist) {
        const params = {
            limit: 100
        }
        const url = `/users/${playlist.user.getUserId()}/playlists/${playlist.id}/tracks`;

        const tracks = await this._recursiveTracksLoad(url, playlist.user.getUserId(), params)
        return tracks;
    };

    async _recursiveTracksLoad(url, user, params, items = []) {
        const response = await this.spotify.get(url, user, params)
        items.push(...response.items.map(track => track.id))

        if (response.next) {
            const nextUrl = response.next.replace("https://api.spotify.com/v1/", "/")
            return await this._recursiveTracksLoad(nextUrl, user, params, items)
        } else {
            return items;
        }
    }

}
