import { AlbumService, ArtistService, AuthService, PlaylistService, TrackService } from "./services";
interface IConfig {
    clientId: string;
    redirectUri: string;
    trackTransferDelayMs?: number;
}
export declare function create(config: IConfig): {
    authService: AuthService;
    albumService: AlbumService;
    artistService: ArtistService;
    playlistService: PlaylistService;
    trackService: TrackService;
    user: () => void;
};
export { AlbumService, ArtistService, AuthService, PlaylistService, Spotify, TrackService } from './services';
export * from './model';
