import Playlist from "../model/Playlist";
import { Spotify } from "./Spotify";
import { Page, Params, Stats, User } from "../model";
export declare class PlaylistService {
    private readonly spotify;
    constructor(spotify: Spotify);
    loadPlaylists(user: User, params: Params): Promise<Page<Playlist>>;
    transferPlaylists(playlists: Playlist[], user: User, targetUser: User): Promise<Stats<Playlist>>;
    transferAll(user: User, targetUser: User): Promise<Stats<Playlist>>;
    private follow;
    private copyPlaylist;
    private createPlaylist;
    private addTracksToPlaylist;
}
