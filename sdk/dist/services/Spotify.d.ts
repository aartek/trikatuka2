import { AxiosResponse } from 'axios';
import { Params, User } from "../model";
import { AuthService } from "./AuthService";
export declare class Spotify {
    private readonly authService;
    url: string;
    constructor(authService: AuthService);
    _extractPath(url: string): string;
    get(path: string, user: User, params: Params): Promise<AxiosResponse>;
    post(path: string, user: User, data: any): Promise<AxiosResponse>;
    put(path: string, user: User, data: any): Promise<AxiosResponse>;
    _beforeRequest(user: User): Promise<User>;
    _buildHeaders(user: User): {
        Authorization: string;
    };
}
