"use strict";

import axios from 'axios'

export default class Spotify {

    url = 'https://api.spotify.com/v1'

    get(path, user, params) {
        const self = this;
        return this._beforeRequest(user).then(function (usr) {
            return axios.get(self.url + path, {
                headers: self._buildHeaders(usr),
                params: params
            });
        });
    };

    post(path, user, data) {
        const self = this;
        return this._beforeRequest(user).then(function (usr) {
            return axios.post(self.url + path, data, {
                headers: self._buildHeaders(usr),
            });
        });
    };

    put(path, user, data) {
        const self = this;
        return this._beforeRequest(user).then(function (usr) {
            return axios.put(self.url + path, data, {
                headers: self._buildHeaders(usr),
            });
        });
    };

    _beforeRequest(user) {
        const refreshingThresholdMs = 5 * 60 * 1000;
        return new Promise(((resolve, reject) => {
            if (user.authData && !user.authData.error && user.authData.expiresAt >= new Date().getTime() - refreshingThresholdMs) {
                user.refreshToken().then(function (refreshedUser) {
                    resolve(refreshedUser);
                });
            } else if (user.authData && user.authData.error) {
                user.logout();
                reject();
            } else if (user.authData && !user.authData.error) {
                resolve(user);
            } else {
                reject();
            }
        }));
    }

    _buildHeaders(user) {
        return {
            'Authorization': 'Bearer ' + user.getAccessToken(),
            // 'Accept': 'application/json',
            // 'Content-type': 'application/json'
        };
    }


}
