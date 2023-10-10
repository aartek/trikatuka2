import { Spotify } from "./Spotify";
import { Page, Params, User } from "../model";
import Track from "../model/Track";
export declare class TrackService {
    private readonly spotify;
    private readonly trackTransferDelayMs;
    constructor(spotify: Spotify, trackTransferDelayMs?: number);
    loadTracks(user: User, params: Params): Promise<Page<Track>>;
    transferAll(user: User, targetUser: User): Promise<void>;
    _getAll(user: User): Promise<Track[]>;
}
