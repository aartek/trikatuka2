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
//# sourceURL=Spotify.js
