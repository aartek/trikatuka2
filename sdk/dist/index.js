import { AlbumService, ArtistService, AuthService, PlaylistService, Spotify, TrackService } from "./services";
export function create(config) {
    const authService = new AuthService(config.clientId, config.redirectUri);
    const spotify = new Spotify(authService);
    const albumService = new AlbumService(spotify);
    const artistService = new ArtistService(spotify);
    const playlistService = new PlaylistService(spotify);
    const trackService = new TrackService(spotify, config.trackTransferDelayMs);
    const user = () => {
    };
    return {
        authService, albumService, artistService, playlistService, trackService, user
    };
}
export { AlbumService, ArtistService, AuthService, PlaylistService, Spotify, TrackService } from './services';
export * from './model';
