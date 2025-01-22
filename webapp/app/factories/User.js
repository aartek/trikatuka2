"use strict";


angular.module('trikatuka2').factory('User', function (Spotify, $sessionStorage, $rootScope, AuthService) {
    const USER_DATA_KEY = '_user_data'

    function User(id, authData) {
        this.authData = authData;
        this.data = null;
        this.id = id;

        if (authData && !authData.error) {
            this.fetchData();
        }
    }

    User.prototype.login = function () {
        var self = this;

        AuthService.authorize(self.id)

        window.userLoggedIn = function (data) {
            self.authData = data;
            self.authData.expiresAt = new Date().getTime() + (self.authData.expires_in * 1000);
            self.fetchData().then(function () {
                $sessionStorage[self.id] = self.authData;
                self.loggedIn = true;
                $rootScope.$broadcast('USER_LOGGED_IN', self);
            });
        }
    };

    User.prototype.fetchData = function () {
        var self = this;
        return Spotify.get('https://api.spotify.com/v1/me', self).then(function (response) {
            self.data = response.data;
        });
    };

    User.prototype.logout = function () {
        delete $sessionStorage[this.id];
        this.authData = null;
        this.data = null;
        $rootScope.$broadcast('USER_LOGGED_OUT', this);
    };

    User.prototype.getAccessToken = function () {
        return this.authData.access_token;
    };

    User.prototype.getUserId = function () {
        return this.data.id;
    };

    User.prototype.refreshToken = async function () {

        var response = await AuthService.refreshToken(this.authData.refresh_token)

        this.authData = response;
        this.authData.expiresAt = new Date().getTime() + (this.authData.expires_in * 1000);
        $sessionStorage[this.id] = this.authData;
        return this;
    };

    return User;
});
