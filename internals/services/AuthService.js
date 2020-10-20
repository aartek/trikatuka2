const {app, protocol, BrowserWindow} = require('electron')
const axios = require('axios')
const pkceChallenge = require('pkce-challenge')

const PROTOCOL_NAME = 'trikatuka2'
const REDIRECT_URI = `${PROTOCOL_NAME}://auth_callback`

class AuthService {

    window;

    constructor(clientId) {
        this.clientId = clientId;

        this.state = {
            SOURCE_USER: {},
            TARGET_USER: {}
        };

        this.registerAuthorizationCodeCallback();
    }

    privileges = ['user-library-read',
        'user-library-modify',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-follow-read',
        'user-follow-modify'].join('%20');

    async openAuthWindow(userType, signedInCallback) {
        const PKCE = pkceChallenge(128)
        const challenge = PKCE.code_challenge;
        this.state[userType].state = new Date().getTime().toString()
        this.state[userType].codeVerifier = PKCE.code_verifier;

        const params = new URLSearchParams()
        params.append('show_dialog', true)
        params.append('client_id', this.clientId)
        params.append('response_type', 'code')
        params.append('redirect_uri', REDIRECT_URI)
        params.append('code_challenge_method', 'S256')
        params.append('code_challenge', challenge)
        params.append('state', userType + ':' + this.state[userType].state)

        const url = 'https://accounts.spotify.com/authorize?' + params.toString() + '&scope=' + this.privileges;

        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nativeWindowOpen: true
            }
        })

        this.signedInCallback = signedInCallback;
        this.window.loadURL(url)
    }

    async requestAccessToken(userType, code) {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code')
        params.append('code', code)
        params.append('redirect_uri', REDIRECT_URI)
        params.append('code_verifier', this.state[userType].codeVerifier)
        params.append('client_id', this.clientId)

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const url = `https://accounts.spotify.com/api/token`;

        try {
            const response = await axios.post(url, params, {
                headers: headers
            });
            return response.data
        } catch (e) {
            throw new Error('Auth error')
        }
    }

    async registerAuthorizationCodeCallback() {
        const self = this;
        await app.whenReady()

        protocol.registerFileProtocol(PROTOCOL_NAME, async (authorizationCodeResponse, callback) => {

            const {code, userType, state} = self.handleAuthorizationCodeResponse(authorizationCodeResponse)

            if (this.state[userType].state !== state) {
                throw new Error(`State doesn't match for user type ${userType}`)
            }
            const authData = await self.requestAccessToken(userType, code)
            self.storeUser(userType, authData)

            callback('ok')

            if (this.signedInCallback) {
                //FIXME passing auth data is not needed here
                this.signedInCallback(authData)
            }

            if (self.window) {
                self.window.close()
            }
        })
    }

    handleAuthorizationCodeResponse(authorizationCodeResponse) {
        const url = new URL(authorizationCodeResponse.url)
        const params = new URLSearchParams(url.search)
        const code = params.get('code')
        const returnedState = params.get('state')
        const userType = returnedState.split(':')[0]
        const state = returnedState.replace(userType + ':', '')
        return {code, userType, state}
    }

    async refreshToken(refreshToken) {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token')
        params.append('refresh_token', refreshToken)
        params.append('client_id', this.clientId)

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const url = 'https://accounts.spotify.com/api/token';
        try {
            const response = await axios.post(url, params, {
                headers: headers
            });
            return response.data
        } catch (e) {
            throw new Error("Refreshing error")
        }
    }

    storeUser(userType, authData) {
        if (userType === 'SOURCE_USER') {
            this.sourceUser = authData
        } else if (userType === 'TARGET_USER') {
            this.targetUser = authData;
        }
    }

    getAuthData(userType) {
        if (userType === 'SOURCE_USER') {
            return this.sourceUser
        } else if (userType === 'TARGET_USER') {
            return this.targetUser
        }
    }




}

module.exports = AuthService
