import Album from "../model/Album";
import { Spotify } from "./Spotify";
import { Page, Params, User } from "../model";
export declare class AlbumService {
    private readonly spotify;
    constructor(spotify: Spotify);
    loadAlbums(user: User, params: Params): Promise<Page<Album>>;
    transferAll(user: User, targetUser: User): Promise<void>;
    _getAll(user: User): Promise<Album[]>;
}
