import Artist from "../model/Artist";
import { Spotify } from "./Spotify";
import { Page, Params, User } from "../model";
export declare class ArtistService {
    private readonly spotify;
    constructor(spotify: Spotify);
    loadArtists(user: User, params: Params, lastArtistId?: string): Promise<Page<Artist>>;
    transferAll(user: any, targetUser: any): Promise<void>;
    _getAll(user: any): Promise<Artist[]>;
}
