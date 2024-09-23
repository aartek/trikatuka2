"use strict"

var STATE_KEY = '_state'
var CODE_VERIFIER_KEY = '_code_verifier'
var USER_DATA_KEY = '_user_data'

var REFRESH_THRESHOLD_SECONDS = 10 * 60;

angular.module('trikatuka2').service('AuthService', function (CLIENT_ID, REDIRECT_URI) {

    var privileges = ['user-library-read',
        'user-library-modify',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-modify-private',
        'user-follow-read',
        'user-follow-modify'].join('%20');

    function openWindow(userType) {
        window.open('login.html#userType=' + userType, '', "width=800, height=600, scrollbars=yes")
    }

    this.authorize = async function authorize(userType) {

        var codeVerifier = generateRandomString(128);

        async function generateCodeChallenge(codeVerifier) {
            var digest = await crypto.subtle.digest("SHA-256",
                new TextEncoder().encode(codeVerifier));

            return btoa(String.fromCharCode(...Array.from(new Uint8Array(digest))))
                .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
        }

        function generateRandomString(length) {
            let text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (let i = 0; i < length; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return text;
        }

        var state = new Date().getTime().toString()
        window.sessionStorage.setItem(userType + STATE_KEY, state)
        window.sessionStorage.setItem(userType + CODE_VERIFIER_KEY, codeVerifier)

        var params = new URLSearchParams()
        params.append('show_dialog', "true")
        params.append('client_id', CLIENT_ID)
        params.append('response_type', 'code')
        params.append('redirect_uri', REDIRECT_URI)
        params.append('code_challenge_method', 'S256')
        params.append('code_challenge', await generateCodeChallenge(codeVerifier))
        params.append('state', userType + ':' + state)

        var url = 'https://accounts.spotify.com/authorize?' + params.toString() + '&scope=' + privileges;

        window.open(url, '', "width=800, height=600, scrollbars=yes");
    }

    this.refreshToken = async function (refreshToken) {
        var payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }),
        }


        var url = 'https://accounts.spotify.com/api/token';

        try {
            var body = await fetch(url, payload);
            var response = await body.json();
            return response
        } catch (e) {
            throw new Error('Refreshing error')
        }
    }
});
