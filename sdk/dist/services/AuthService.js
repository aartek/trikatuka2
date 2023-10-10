import axios from "axios";
import { User } from "../model";
const STATE_KEY = '_state';
const CODE_VERIFIER_KEY = '_code_verifier';
const USER_DATA_KEY = '_user_data';
const REFRESH_THRESHOLD_SECONDS = 10 * 60;
export class AuthService {
    clientId;
    redirectUri;
    constructor(clientId, redirectUri) {
        this.clientId = clientId;
        this.redirectUri = redirectUri;
    }
    privileges = ['user-library-read',
        'user-library-modify',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-follow-read',
        'user-follow-modify'].join('%20');
    openWindow(userType) {
        window.open(`login.html#userType=${userType}`, '', "width=800, height=600, scrollbars=yes");
    }
    async authorize(userType) {
        const codeVerifier = generateRandomString(128);
        async function generateCodeChallenge(codeVerifier) {
            const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(codeVerifier));
            return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
                .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        }
        function generateRandomString(length) {
            let text = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
        const state = new Date().getTime().toString();
        window.localStorage.setItem(`${userType}${STATE_KEY}`, state);
        window.localStorage.setItem(`${userType}${CODE_VERIFIER_KEY}`, codeVerifier);
        const params = new URLSearchParams();
        params.append('show_dialog', "true");
        params.append('client_id', this.clientId);
        params.append('response_type', 'code');
        params.append('redirect_uri', this.redirectUri);
        params.append('code_challenge_method', 'S256');
        params.append('code_challenge', await generateCodeChallenge(codeVerifier));
        params.append('state', userType + ':' + state);
        const url = 'https://accounts.spotify.com/authorize?' + params.toString() + '&scope=' + this.privileges;
        location.href = url;
    }
    async requestAccessToken(userType, code) {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', this.redirectUri);
        params.append('code_verifier', window.localStorage.getItem(`${userType}${CODE_VERIFIER_KEY}`));
        params.append('client_id', this.clientId);
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url = `https://accounts.spotify.com/api/token`;
        try {
            const response = await axios.post(url, params, {
                headers: headers
            });
            return response.data;
        }
        catch (e) {
            throw new Error('Auth error');
        }
    }
    async handleAuthCallback() {
        const self = this;
        const currentTime = Date.now();
        const { code, userType, state } = self.handleAuthorizationCodeResponse();
        if (code) {
            const storedState = window.localStorage.getItem(`${userType}${STATE_KEY}`);
            if (storedState !== state) {
                throw new Error(`State doesn't match for user type ${userType}`);
            }
            const authData = await self.requestAccessToken(userType, code);
            authData.expiresAt = new Date(currentTime + (authData.expires_in * 1000));
            console.log('expires at', authData.expiresAt);
            const user = await axios.get('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `${authData.token_type} ${authData.access_token}` },
            }).then(response => new User(response.data.id, response.data, userType));
            self.storeUser(user, authData);
        }
    }
    handleAuthorizationCodeResponse() {
        const url = new URL(location.href);
        const params = url.searchParams;
        const code = params.get('code');
        const returnedState = params.get('state');
        const userType = returnedState?.split(':')[0];
        const state = returnedState?.replace(userType + ':', '');
        return { code, userType, state };
    }
    async refreshToken(refreshToken) {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);
        params.append('client_id', this.clientId);
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url = 'https://accounts.spotify.com/api/token';
        try {
            const response = await axios.post(url, params, {
                headers: headers
            });
            return response.data;
        }
        catch (e) {
            throw new Error("Refreshing error");
        }
    }
    storeUser(user, authData) {
        window.localStorage.setItem(`${user.type}${USER_DATA_KEY}`, JSON.stringify({ user, authData }));
    }
    getUser(userType) {
        const data = window.localStorage.getItem(`${userType}${USER_DATA_KEY}`);
        if (data && new Date(JSON.parse(data).authData.expiresAt) > new Date(Date.now() + REFRESH_THRESHOLD_SECONDS * 1000)) {
            return JSON.parse(data).user;
        }
        return null;
    }
    getAuthData(userType) {
        const data = window.localStorage.getItem(`${userType}${USER_DATA_KEY}`);
        return data ? JSON.parse(data).authData : null;
    }
    logout(userType) {
        window.localStorage.removeItem(`${userType}${USER_DATA_KEY}`);
    }
}
