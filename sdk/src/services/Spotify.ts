"use strict";

import axios, {AxiosResponse} from 'axios'
import User from "../model/User";
import {Params} from "../model/Types";

export default class Spotify {

    url = 'https://api.spotify.com/v1'


    _extractPath(url) {
        if (url.indexOf(this.url) > -1) {
            return url.replace(this.url + '/', "/");
        } else {
            return url;
        }
    }


    get(path: string, user: User, params: Params): Promise<AxiosResponse> {
        const self = this;
        return this._beforeRequest(user).then(function (usr) {
            return axios.get(self.url + self._extractPath(path), {
                headers: self._buildHeaders(usr),
                params: params
            });
        });
    };

    post(path: string, user: User, data: any): Promise<AxiosResponse> {
        const self = this;
        return this._beforeRequest(user).then(function (usr) {
            return axios.post(self.url + self._extractPath(path), data, {
                headers: self._buildHeaders(usr),
            });
        });
    };

    put(path: string, user: User, data: any): Promise<AxiosResponse> {
        const self = this;
        return this._beforeRequest(user).then(function (usr) {
            return axios.put(self.url + self._extractPath(path), data, {
                headers: self._buildHeaders(usr),
            });
        });
    };

    _beforeRequest(user): Promise<any> {
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
