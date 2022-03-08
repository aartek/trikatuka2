import {default as _AuthService} from "./services/AuthService";
import {default as _AlbumService} from "./services/AlbumService";
import {default as _ArtistService} from "./services/ArtistService";
import {default as _PlaylistService} from "./services/PlaylistService";
import {default as _TrackService} from "./services/TrackService";
import {default as _Spotify} from "./services/Spotify";
import {default as _User} from "./model/User";


export function create(clientId) {
    const authService = new _AuthService('27edb2ed1e2c4c5c8cd7e192c81e37e8')
    const spotify = new _Spotify(authService)
    const albumService = new _AlbumService(spotify)
    const artistService = new _ArtistService(spotify)
    const playlistService = new _PlaylistService(spotify)
    const trackService = new _TrackService(spotify)
    const User = _User

    return {
        authService, albumService, artistService, playlistService, trackService, User
    }
}
