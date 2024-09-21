import { User } from "../model";
import { UserType } from "../model/Enums";
export declare class AuthService {
    private readonly clientId;
    private redirectUri;
    constructor(clientId: any, redirectUri: any);
    privileges: string;
    openWindow(userType: UserType): void;
    authorize(userType: UserType): Promise<void>;
    private requestAccessToken;
    handleAuthCallback(): Promise<void>;
    private handleAuthorizationCodeResponse;
    refreshToken(refreshToken: string): Promise<any>;
    storeUser(user: User, authData: any): void;
    getUser(userType: UserType): User;
    getAuthData(userType: UserType): any;
    logout(userType: UserType): void;
}
