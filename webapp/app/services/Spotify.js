"use strict";

angular.module('trikatuka2').service('Spotify', function ($http, $q) {
    this.get = function (url, user, params) {
        return beforeRequest(user).then(function (usr) {
            return $http({
                url: url,
                method: 'GET',
                headers: buildHeaders(usr),
                params: params
            });
        });
    };

    this.post = function (url, user, data) {
        return beforeRequest(user).then(function (usr) {
            return $http({
                url: url,
                method: 'POST',
                headers: buildHeaders(usr),
                data: data
            });
        });
    };

    this.put = function (url, user, data) {
        return beforeRequest(user).then(function (usr) {
            return $http({
                url: url,
                method: 'PUT',
                headers: buildHeaders(usr),
                data: data
            });
        });
    };

    this.put = function (url, user, data, params) {
        return beforeRequest(user).then(function (usr) {
            return $http({
                url: url,
                method: 'PUT',
                headers: buildHeaders(usr),
                data: data,
                params: params
            });
        });
    };

    this.SAVE_LIBRARY_BATCH_SIZE = 40;

    this.saveToLibrary = function (uris, user) {
        var url = 'https://api.spotify.com/v1/me/library?uris=' + encodeURIComponent(uris.join(','));
        return this.put(url, user);
    };

    function beforeRequest(user) {
        var deferred = $q.defer();

        if (user.authData && !user.authData.error && user.authData.expiresAt <= new Date().getTime()) {
            user.refreshToken().then(function (refreshedUser) {
                deferred.resolve(refreshedUser);
            });
        }
        else if (user.authData && user.authData.error) {
            user.logout();
            deferred.reject();
        }
        else if(user.authData && !user.authData.error){
            deferred.resolve(user);
        }
        else{
            deferred.reject();
        }
        return deferred.promise;
    }

    function buildHeaders(user) {
        return {
            'Authorization': 'Bearer ' + user.getAccessToken(),
            'Accept': 'application/json',
            'Content-type': 'application/json'
        };
    }
});
